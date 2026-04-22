# gesture_engine/rotation.py

import math

def detect_two_finger_lock(hand):
    """Return True if index + middle are extended."""
    index_up = hand[8].y < hand[6].y
    middle_up = hand[12].y < hand[10].y
    return index_up and middle_up

def calculate_xyz_rotation(hand, base_vector):
    """Return rotation deltas in X,Y,Z based on finger orientation."""
    index = hand[8]
    wrist = hand[0]

    vx = index.x - wrist.x
    vy = index.y - wrist.y
    vz = (index.z - wrist.z) if hasattr(index, "z") else 0

    angle_x = (vy - base_vector['vy']) * 4.0
    angle_y = (vx - base_vector['vx']) * 4.0
    angle_z = (vz - base_vector['vz']) * 4.0

    return angle_x, angle_y, angle_z