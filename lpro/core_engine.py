from flask import Flask, render_template
from flask_socketio import SocketIO
import cv2
import threading
import mediapipe as mp
from utils.math_utils import OneEuroFilter

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# High-Precision Trackers
filters = { 'x': OneEuroFilter(30), 'y': OneEuroFilter(30), 'z': OneEuroFilter(30) }

def camera_worker():
    cap = cv2.VideoCapture(0)
    mp_hands = mp.solutions.hands.Hands(max_num_hands=1, min_detection_confidence=0.8)
    
    while True:
        success, frame = cap.read()
        if not success: continue
        
        results = mp_hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0].landmark
            # Stabilize the Index Tip (ID 8)
            raw_x, raw_y = hand[8].x, hand[8].y
            clean_x = filters['x'].filter(raw_x)
            clean_y = filters['y'].filter(raw_y)
            
            # PUSH TO FRONTEND INSTANTLY
            socketio.emit('hand_update', {'x': clean_x, 'y': clean_y, 'active': True})
        else:
            socketio.emit('hand_update', {'active': False})

threading.Thread(target=camera_worker, daemon=True).start()

if __name__ == '__main__':
    socketio.run(app, port=5000)