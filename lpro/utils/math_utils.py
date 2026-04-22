import numpy as np

class OneEuroFilter:
    def __init__(self, freq, mincutoff=1.0, beta=0.0, dcutoff=1.0):
        self.freq = freq
        self.mincutoff = mincutoff
        self.beta = beta
        self.dcutoff = dcutoff
        self.x_prev = None
        self.dx_prev = 0

    def _alpha(self, cutoff):
        te = 1.0 / self.freq
        tau = 1.0 / (2 * np.pi * cutoff)
        return 1.0 / (1.0 + tau / te)

    def filter(self, x):
        if self.x_prev is None:
            self.x_prev = x
            return x
        
        dx = (x - self.x_prev) * self.freq
        edx = self._alpha(self.dcutoff) * dx + (1 - self._alpha(self.dcutoff)) * self.dx_prev
        cutoff = self.mincutoff + self.beta * abs(edx)
        
        out = self._alpha(cutoff) * x + (1 - self._alpha(cutoff)) * self.x_prev
        self.x_prev, self.dx_prev = out, edx
        return out