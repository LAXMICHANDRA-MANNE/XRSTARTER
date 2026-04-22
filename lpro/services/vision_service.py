from flask import Blueprint, jsonify, Response
import cv2
import time
import math
import threading
import mediapipe as mp

try:
    from gesture_engine.rotation import detect_two_finger_lock, calculate_xyz_rotation
except ImportError:
    pass # Falback if missing

vision_bp = Blueprint('vision_service', __name__)

# ==========================================================
# OPEN CV AND ML PARAMS
# ==========================================================
PARAMS = {
    "zoom_min": 0.7,
    "zoom_max": 5.0,
    "zoom_sensitivity": 0.65,
    "rot_sensitivity": 0.45,
    "peel_sensitivity": 0.85,
    "drag_smooth": 0.55,
    "freeze_hold_time": 0.85,
    "smooth_alpha": 0.90,
}

gesture_state = {
    "scale": 1.0,
    "rotation": 0.0,
    "peel": 0.0,
    "drag_active": False,
    "drag_x": 0.5,
    "drag_y": 0.5,
    "action": None,
    "action_payload": {},
    "cum_rot_x": 0.0,
    "cum_rot_y": 0.0,
    "cum_pan_x": 0.0,
    "cum_pan_y": 0.0
}

state_lock = threading.Lock()
frame_lock = threading.Lock()
last_frame = None
camera_running = False

def finger_up(hand, tip_idx, pip_idx):
    return hand[tip_idx].y < hand[pip_idx].y

def start_camera_thread():
    global camera_running, last_frame
    if camera_running: return
    camera_running = True
    threading.Thread(target=gesture_camera_loop, daemon=True).start()

def stop_camera_thread():
    global camera_running
    camera_running = False

def gesture_camera_loop():
    global last_frame

    cap = None
    for cam_id in [0, 1, 2, -1]:
        test = cv2.VideoCapture(cam_id)
        time.sleep(0.8)
        if test.isOpened():
            test.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            test.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            test.set(cv2.CAP_PROP_FPS, 30)
            test.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            cap = test
            break
        test.release()

    if cap is None:
        return

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.6, min_tracking_confidence=0.6)

    base_left_angle = None
    base_right_pinch = None
    
    wrist_history_right = []
    wrist_history_left = []
    
    prev_drag_x = 0.5
    prev_drag_y = 0.5
    
    last_rot_x = 0.5
    last_rot_y = 0.5
    is_rotating = False
    
    last_pan_x = 0.5
    last_pan_y = 0.5
    is_panning = False

    last_action_time = 0
    tap_count = 0
    last_tap_time = 0

    while camera_running:
        for _ in range(3):
            cap.grab()
            
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
                if label == "Left": left = lm
                else: right = lm

        newScale = 1.0
        newRot = gesture_state["rotation"]
        newPeel = 0.0
        drag = False
        dragX = 0.5
        dragY = 0.5
        
        detected_action = None
        action_payload = {}
        t_now = time.time()
        
        if left:
            wrist_history_left.append({'x': left[0].x, 'y': left[0].y, 't': t_now})
            if len(wrist_history_left) > 10: wrist_history_left.pop(0)
            
            idx = left[8]
            wrist = left[0]
            vx = idx.x - wrist.x
            vy = idx.y - wrist.y
            angle = math.atan2(vy, vx)

            if base_left_angle is None: base_left_angle = angle
            delta = angle - base_left_angle
            newRot = -delta * PARAMS["rot_sensitivity"]

            middle = left[12]
            palm = left[9]
            openness = middle.y - palm.y
            openness_norm = (0.30 - openness) / 0.30
            newPeel = max(0, min(1, openness_norm))
            
            f_up = lambda t,p: finger_up(left, t, p)
            l_th = f_up(4,3); l_i = f_up(8,6); l_m = f_up(12,10); l_r = f_up(16,14); l_p = f_up(20,18)
            l_closed = not l_th and not l_i and not l_m and not l_r and not l_p
            l_palm_up = left[0].y > left[9].y and left[0].z < left[9].z
            
            if l_i and l_m and l_r and l_p and abs(left[8].x - left[0].x) < 0.1:
                if t_now - last_action_time > 2.0:
                    detected_action = "shush"
                    last_action_time = t_now
                    
            l_pinch_dist = ((left[8].x - left[4].x)*w)**2 + ((left[8].y - left[4].y)*h)**2
            if l_pinch_dist < 2000:
                if not is_panning:
                    is_panning = True
                    last_pan_x = left[8].x
                    last_pan_y = left[8].y
                else:
                    dx = left[8].x - last_pan_x
                    dy = left[8].y - last_pan_y
                    gesture_state["cum_pan_x"] += dx * 2.5
                    gesture_state["cum_pan_y"] += dy * 2.5
                    last_pan_x = left[8].x
                    last_pan_y = left[8].y
            else:
                is_panning = False
                
        else:
            base_left_angle = None
            wrist_history_left.clear()
            l_closed = False
            is_panning = False

        if right:
            wrist_history_right.append({'x': right[0].x, 'y': right[0].y, 't': t_now})
            if len(wrist_history_right) > 10: wrist_history_right.pop(0)
            
            thumb = right[4]
            idx = right[8]
            dist = ((idx.x - thumb.x)*w)**2 + ((idx.y - thumb.y)*h)**2
            dist = dist ** 0.5

            if base_right_pinch is None: base_right_pinch = dist
            pinch_ratio = dist / base_right_pinch
            pinch_ratio = max(PARAMS["zoom_min"], min(PARAMS["zoom_max"], pinch_ratio))
            
            newScale = ((1 - PARAMS["zoom_sensitivity"]) * gesture_state["scale"] + PARAMS["zoom_sensitivity"] * pinch_ratio)

            f_up = lambda t,p: finger_up(right, t, p)
            r_th = f_up(4,3); r_i = f_up(8,6); r_m = f_up(12,10); r_r = f_up(16,14); r_p = f_up(20,18)
            r_palm_open = r_th and r_i and r_m and r_r and r_p
            r_closed = not r_th and not r_i and not r_m and not r_r and not r_p
            r_index_only = r_i and not r_m and not r_r and not r_p

            if dist < 2000:
                if not is_rotating:
                    is_rotating = True
                    last_rot_x = right[8].x
                    last_rot_y = right[8].y
                    
                    if t_now - last_tap_time < 0.6:
                        tap_count += 1
                        if tap_count == 2:
                            detected_action = "double_tap"
                            tap_count = 0
                    else:
                        tap_count = 1
                    last_tap_time = t_now
                else:
                    dx = right[8].x - last_rot_x
                    dy = right[8].y - last_rot_y
                    gesture_state["cum_rot_x"] += dy * 3.5
                    gesture_state["cum_rot_y"] += dx * 3.5
                    last_rot_x = right[8].x
                    last_rot_y = right[8].y
            else:
                is_rotating = False

            if r_index_only:
                drag = True
                dragX = (1 - PARAMS["drag_smooth"]) * prev_drag_x + PARAMS["drag_smooth"] * idx.x
                dragY = (1 - PARAMS["drag_smooth"]) * prev_drag_y + PARAMS["drag_smooth"] * idx.y
                prev_drag_x = dragX
                prev_drag_y = dragY
                
            if r_closed and (not left or l_closed) and t_now - last_action_time > 2.0:
                detected_action = "crush"
                last_action_time = t_now

            if r_palm_open:
                pass 

            if len(wrist_history_right) > 5 and r_palm_open:
                dx = wrist_history_right[-1]['x'] - wrist_history_right[0]['x']
                dt = wrist_history_right[-1]['t'] - wrist_history_right[0]['t']
                if dt > 0 and abs(dx/dt) > 2.5:
                    if t_now - last_action_time > 1.0:
                        detected_action = "wipe"
                        action_payload = {"direction": "right" if dx > 0 else "left"}
                        last_action_time = t_now
                        
            if r_palm_open:
                bbox_size = abs(right[0].y - right[12].y)
                if bbox_size > 0.4 and t_now - last_action_time > 1.0:
                    detected_action = "pull"
                    last_action_time = t_now
                elif bbox_size < 0.1 and t_now - last_action_time > 1.0:
                    detected_action = "push"
                    last_action_time = t_now

        else:
            base_right_pinch = None
            wrist_history_right.clear()
            r_closed = False

        if left and right and t_now - last_action_time > 2.0:
            if l_closed and r_closed:
                if len(wrist_history_left)>5 and len(wrist_history_right)>5:
                    dx_l = wrist_history_left[-1]['x'] - wrist_history_left[0]['x']
                    dx_r = wrist_history_right[-1]['x'] - wrist_history_right[0]['x']
                    dt = wrist_history_left[-1]['t'] - wrist_history_left[0]['t']
                    if dt > 0 and dx_l < -1.5*dt and dx_r > 1.5*dt:
                        detected_action = "explode"
                        last_action_time = t_now
                        
            elif (not l_closed) and (not r_closed):
                if len(wrist_history_left)>5 and len(wrist_history_right)>5:
                    dx_l = wrist_history_left[-1]['x'] - wrist_history_left[0]['x']
                    dx_r = wrist_history_right[-1]['x'] - wrist_history_right[0]['x']
                    dt = wrist_history_left[-1]['t'] - wrist_history_left[0]['t']
                    if dt > 0 and dx_l > 1.5*dt and dx_r < -1.5*dt:
                        detected_action = "collapse"
                        last_action_time = t_now

        try:
            if left and detect_two_finger_lock(left):
                if 'base_vec' not in gesture_state:
                    gesture_state['base_vec'] = {
                        'vx': left[8].x - left[0].x,
                        'vy': left[8].y - left[0].y,
                        'vz': left[8].z - left[0].z
                    }
                rotX, rotY, rotZ = calculate_xyz_rotation(left, gesture_state['base_vec'])
                gesture_state["rot_x"] = rotX
                gesture_state["rot_y"] = rotY
                gesture_state["rot_z"] = rotZ
        except Exception:
            pass

        alpha = PARAMS["smooth_alpha"]
        with state_lock:
            gesture_state["scale"] = (1 - alpha) * gesture_state["scale"] + alpha * newScale
            gesture_state["rotation"] = (1 - alpha) * gesture_state["rotation"] + alpha * newRot
            gesture_state["peel"] = (1 - alpha) * gesture_state["peel"] + alpha * newPeel
            gesture_state["drag_active"] = drag
            gesture_state["drag_x"] = dragX
            gesture_state["drag_y"] = dragY
            
            if detected_action:
                gesture_state["action"] = detected_action
                gesture_state["action_payload"] = action_payload
            else:
                gesture_state["action"] = None
                gesture_state["action_payload"] = {}

        ok, jpeg = cv2.imencode(".jpg", frame)
        if ok:
            with frame_lock:
                last_frame = jpeg.tobytes()

        time.sleep(0.01)

    if cap:
        cap.release()
    cv2.destroyAllWindows()


# ==========================================================
# BLUEPRINT HTTP API ROUTES
# ==========================================================
@vision_bp.route("/video_feed")
def video_feed():
    def stream():
        while True:
            with frame_lock:
                frame = last_frame
            if frame:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            time.sleep(0.03)
    return Response(stream(), mimetype="multipart/x-mixed-replace; boundary=frame")

@vision_bp.route("/status")
def status():
    with state_lock:
        return jsonify(dict(gesture_state))

@vision_bp.route("/stop_camera", methods=["POST", "OPTIONS"])
def stop_camera():
    stop_camera_thread()
    resp = jsonify({"status": "stopped"})
    resp.headers.add("Access-Control-Allow-Origin", "*")
    return resp

@vision_bp.route("/start_camera", methods=["POST", "OPTIONS"])
def start_camera():
    start_camera_thread()
    resp = jsonify({"status": "started"})
    resp.headers.add("Access-Control-Allow-Origin", "*")
    return resp
