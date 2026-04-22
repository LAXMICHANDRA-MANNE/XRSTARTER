import numpy as np
from utils.math_utils import KalmanFilter 

class AdvancedHandController:
    def __init__(self):
        
        self.filters = {
            'x': KalmanFilter(0.001, 0.1),
            'y': KalmanFilter(0.001, 0.1),
            'z': KalmanFilter(0.001, 0.1),
            'scale': KalmanFilter(0.0001, 0.05)
        }
        self.active_hand_id = None # Locks onto one hand to prevent "jumping"

    def process_hands(self, hands, w, h):
        if not hands:
            return None # Logic to "Hold" last known position
        
        # 1. Hand Locking: Always stick to the most stable hand
        # This prevents the "Left hand enters, object disappears" bug
        main_hand = hands[0] 
        
        # 2. Extract Landmarks
        wrist = main_hand[0]
        index_tip = main_hand[8]
        
        # 3. Apply Kalman Smoothing (The "PUBG" Feel)
        smooth_x = self.filters['x'].update(index_tip.x)
        smooth_y = self.filters['y'].update(index_tip.y)
        
        return {
            "x": smooth_x,
            "y": smooth_y,
            "grabbing": self.check_pinch(main_hand)
        }

    def check_pinch(self, hand):
        # Use Euclidean distance for 100% precision
        dist = np.linalg.norm([hand[4].x - hand[8].x, hand[4].y - hand[8].y])
        return dist < 0.05 # Strict threshold for "Click"