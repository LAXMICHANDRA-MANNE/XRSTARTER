import math

class GestureController:
    def __init__(self):
        self.prev_dist = None
        self.scale = 1.0
        self.rotation = 0.0

    def distance(self, lm, i, j, w, h):
        x1, y1 = lm[i].x * w, lm[i].y * h
        x2, y2 = lm[j].x * w, lm[j].y * h
        return math.dist([x1, y1], [x2, y2])

    def update(self, hands, w, h):
        if not hands:
            return self.scale, self.rotation
        lm = hands[0]  # first hand
        pinch = self.distance(lm, 4, 8, w, h)  # thumb tip to index tip
        if self.prev_dist is None:
            self.prev_dist = pinch
        diff = pinch - self.prev_dist
        self.scale += diff * 0.005
        self.scale = max(0.1, min(5, self.scale))
        self.rotation += diff * 0.02
        self.prev_dist = pinch
        return self.scale, self.rotation