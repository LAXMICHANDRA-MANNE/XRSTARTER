import os
import cv2
import time
import math
import threading
from flask import Flask, render_template, Response, request, jsonify, send_file
from werkzeug.utils import secure_filename
import mediapipe as mp
from gesture_engine.rotation import detect_two_finger_lock, calculate_xyz_rotation
# ==========================================================
# GLOBAL PARAMS
# ==========================================================
PARAMS = {
    "zoom_min": 0.4,
    "zoom_max": 3.2,
    "zoom_sensitivity": 0.18,

    "rot_sensitivity": 0.15,
    "peel_sensitivity": 0.12,

    "drag_smooth": 0.28,
    "freeze_hold_time": 0.30,

    "smooth_alpha": 0.25,
}

# ==========================================================
# FLASK SETUP
# ==========================================================
app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR

gesture_state = {
    "scale": 1.0,
    "rotation": 0.0,
    "peel": 0.0,
    "drag_active": False,
    "drag_x": 0.5,
    "drag_y": 0.5
}

state_lock = threading.Lock()
frame_lock = threading.Lock()
last_frame = None
camera_running = False

# ==========================================================
# CAMERA + GESTURE THREAD
# ==========================================================
def start_camera_thread():
    global camera_running
    if camera_running:
        return
    camera_running = True

    threading.Thread(target=gesture_camera_loop, daemon=True).start()


def gesture_camera_loop():
    global last_frame

    print("\n===== Starting Camera Thread =====")

    # Try multiple camera IDs to avoid macOS blocking
    cap = None
    for cam_id in [0, 1, 2, -1]:
        test = cv2.VideoCapture(cam_id)
        time.sleep(0.8)
        if test.isOpened():
            cap = test
            print(f"✔ Camera opened using index {cam_id}")
            break
        test.release()

    if cap is None:
        print("❌ No camera found!")
        print("▶ FIX: System Settings → Privacy & Security → Camera → Enable Terminal / Python")
        return

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(max_num_hands=2,
                           min_detection_confidence=0.6,
                           min_tracking_confidence=0.6)

    base_left_angle = None
    base_right_pinch = None
    palm_open_time = 0
    freeze_rotation = False

    prev_drag_x = 0.5
    prev_drag_y = 0.5

    def finger_up(hand, tip, pip):
        return hand[tip].y < hand[pip].y

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.03)
            continue

        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]

        results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        left = None
        right = None

        if results.multi_hand_landmarks and results.multi_handedness:
            for idx, handedness in enumerate(results.multi_handedness):
                label = handedness.classification[0].label
                lm = results.multi_hand_landmarks[idx].landmark
                if label == "Left":
                    left = lm
                else:
                    right = lm

        newScale = 1.0
        newRot = gesture_state["rotation"]
        newPeel = 0.0
        drag = False
        dragX = 0.5
        dragY = 0.5

        # ==========================================================
        # LEFT HAND = ROTATION + PEEL
        # ==========================================================
        if left:
            idx = left[8]
            wrist = left[0]

            vx = idx.x - wrist.x
            vy = idx.y - wrist.y
            angle = math.atan2(vy, vx)

            if base_left_angle is None:
                base_left_angle = angle

            delta = angle - base_left_angle
            newRot = -delta * PARAMS["rot_sensitivity"]

            middle = left[12]
            palm = left[9]

            openness = middle.y - palm.y
            openness_norm = (0.30 - openness) / 0.30
            newPeel = max(0, min(1, openness_norm))
        else:
            base_left_angle = None

        # ==========================================================
        # RIGHT HAND = ZOOM + DRAG + FREEZE
        # ==========================================================
        if right:
            thumb = right[4]
            idx = right[8]

            dx = (idx.x - thumb.x) * w
            dy = (idx.y - thumb.y) * h
            dist = (dx*dx + dy*dy) ** 0.5

            if base_right_pinch is None:
                base_right_pinch = dist

            pinch_ratio = dist / base_right_pinch
            pinch_ratio = max(PARAMS["zoom_min"], min(PARAMS["zoom_max"], pinch_ratio))

            newScale = (
                (1 - PARAMS["zoom_sensitivity"]) * gesture_state["scale"] +
                PARAMS["zoom_sensitivity"] * pinch_ratio
            )

            f_up = lambda t,p: finger_up(right, t, p)
            th = f_up(4,3); i = f_up(8,6); m = f_up(12,10)
            r = f_up(16,14); p = f_up(20,18)

            palm_open = th and i and m and r and p

            if palm_open:
                palm_open_time += 0.03
            else:
                palm_open_time = 0

            freeze_rotation = palm_open_time >= PARAMS["freeze_hold_time"]

            if freeze_rotation:
                newRot = gesture_state["rotation"]

            indexOnly = i and not m and not r and not p
            if indexOnly:
                drag = True
                dragX = idx.x
                dragY = idx.y

                dragX = (1 - PARAMS["drag_smooth"]) * prev_drag_x + PARAMS["drag_smooth"] * dragX
                dragY = (1 - PARAMS["drag_smooth"]) * prev_drag_y + PARAMS["drag_smooth"] * dragY

                prev_drag_x = dragX
                prev_drag_y = dragY

        else:
            base_right_pinch = None
            palm_open_time = 0

        if left:
            if detect_two_finger_lock(left):
                if 'base_vec' not in gesture_state:
                    gesture_state['base_vec'] = {
                        'vx': left[8].x - left[0].x,
                        'vy': left[8].y - left[0].y,
                        'vz': (left[8].z - left[0].z) if hasattr(left[8], "z") else 0
                    }

                rotX, rotY, rotZ = calculate_xyz_rotation(left, gesture_state['base_vec'])

                new_rot_x = rotX
                new_rot_y = rotY
                new_rot_z = rotZ

                gesture_state["rot_x"] = new_rot_x
                gesture_state["rot_y"] = new_rot_y
                gesture_state["rot_z"] = new_rot_z




        # ==========================================================
        # APPLY STATE
        # ==========================================================
        alpha = PARAMS["smooth_alpha"]
        with state_lock:
            gesture_state["scale"] = (1 - alpha) * gesture_state["scale"] + alpha * newScale
            gesture_state["rotation"] = (1 - alpha) * gesture_state["rotation"] + alpha * newRot
            gesture_state["peel"] = (1 - alpha) * gesture_state["peel"] + alpha * newPeel

            gesture_state["drag_active"] = drag
            gesture_state["drag_x"] = dragX
            gesture_state["drag_y"] = dragY

        ok, jpeg = cv2.imencode(".jpg", frame)
        if ok:
            with frame_lock:
                last_frame = jpeg.tobytes()

        time.sleep(0.03)

# FLASK ROUTES

@app.route("/")
def index():
    start_camera_thread()   # <-- YOU MUST ADD THIS LINE
    return render_template("index.html")

@app.route("/video_feed")
def video_feed():
    def stream():
        while True:
            with frame_lock:
                frame = last_frame
            if frame:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            time.sleep(0.03)

    return Response(stream(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/status")
def status():
    with state_lock:
        return jsonify(dict(gesture_state))


@app.route("/upload", methods=["POST"])
def upload():
    # Diagnostic logging to help debug missing POSTs from the client
    try:
        print("--- /upload called ---")
        print("Content-Type:", request.content_type)
        print("Files keys:", list(request.files.keys()))
        print("Form keys:", list(request.form.keys()))

        if "objfile" not in request.files:
            return jsonify(error="no file in request.files"), 400

        file = request.files["objfile"]
        if file.filename == "":
            return jsonify(error="empty filename"), 400

        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        print("✅ Saved:", save_path)
        return jsonify(path=filename)

    except Exception as e:
        print("Upload error:", repr(e))
        return jsonify(error=str(e)), 500

@app.route("/uploads/<path:name>")
def serve_upload(name):
    full = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(full):
        return "Not Found", 404
    return send_file(full)

# ==========================================================
if __name__ == "__main__":
    # Run without the reloader for predictable single-process behavior during debugging
    app.run(debug=False)