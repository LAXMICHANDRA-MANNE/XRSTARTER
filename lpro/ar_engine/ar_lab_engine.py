import cv2
from ar_engine.hand_tracker import HandTracker
from ar_engine.gesture_controller import GestureController

class ARLabEngine:
    def __init__(self):
        self.scale = 1.0
        self.rotation = 0.0
        self.position = [0, 0]
        self.model_path = None
        self.tracker = HandTracker()
        self.gestures = GestureController()
        self.cap = cv2.VideoCapture(0)

    def load_model(self, path):
        self.model_path = path

    def start_webcam(self):
        while True:
            ret, frame = self.cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            h, w = frame.shape[:2]

            hands = self.tracker.get_hands(frame)

            # Update gesture state
            self.scale, self.rotation = self.gestures.update(hands, w, h)

            # (IMPORTANT) No drawing, no imshow, no waitKey on macOS
            pass