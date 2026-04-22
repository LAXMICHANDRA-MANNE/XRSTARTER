import mediapipe as mp
import cv2

class HandTracker:
    def __init__(self):
        import mediapipe as mp
        self.hands = mp.solutions.hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

    def get_hands(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = self.hands.process(rgb)
        if not res.multi_hand_landmarks:
            return []
        hands = []
        for hand in res.multi_hand_landmarks:
            hands.append(hand.landmark)
        return hands