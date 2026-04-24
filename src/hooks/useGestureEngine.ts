import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results, Landmark } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface GestureState {
  scale: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  pan_x: number;
  pan_y: number;
  peel: number;
  action: string | null;
}

const PARAMS = {
  zoom_min: 0.7,
  zoom_max: 5.0,
  zoom_sensitivity: 0.65,
  drag_smooth: 0.55,
  smooth_alpha: 0.90,
};

export const useGestureEngine = (videoRef?: React.RefObject<HTMLVideoElement>, isProd: boolean = true) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1.0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    pan_x: 0,
    pan_y: 0,
    peel: 0,
    action: null
  });

  const stateRef = useRef({
    scale: 1.0,
    cum_rot_x: 0,
    cum_rot_y: 0,
    cum_rot_z: 0,
    cum_pan_x: 0,
    cum_pan_y: 0,
    peel: 0,
    base_right_pinch: null as number | null,
    is_rotating: false,
    last_rot_x: 0.5,
    last_rot_y: 0.5,
    last_angle: 0,
    is_panning: false,
    last_pan_x: 0.5,
    last_pan_y: 0.5,
    drag_active: false,
    drag_x: 0.5,
    drag_y: 0.5,
    tap_count: 0,
    last_tap_time: 0,
    last_action_time: 0
  });

  const calculateAngle = (p1: Landmark, p2: Landmark) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  };

  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const calculateDistance = (p1: Landmark, p2: Landmark) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const isFingerUp = (hand: Landmark[], tip: number, pip: number) => {
    return hand[tip].y < hand[pip].y;
  };

  const onResults = useCallback((results: Results) => {
    let left: Landmark[] | null = null;
    let right: Landmark[] | null = null;

    if (results.multiHandLandmarks && results.multiHandedness) {
      results.multiHandedness.forEach((handedness, idx) => {
        // Correct labels for non-mirrored camera
        if (handedness.label === 'Left') left = results.multiHandLandmarks[idx];
        else if (handedness.label === 'Right') right = results.multiHandLandmarks[idx];
      });
    }

    const s = stateRef.current;
    const t_now = Date.now() / 1000;
    
    let newScale = s.scale;
    let newPeel = s.peel;
    let detected_action: string | null = null;

    if (left) {
      const middle = left[12];
      const palm = left[9];
      const openness = middle.y - palm.y;
      const openness_norm = (0.30 - openness) / 0.30;
      newPeel = Math.max(0, Math.min(1, openness_norm));

      const pinchDist = calculateDistance(left[8], left[4]);
      if (pinchDist < 0.05) {
        if (!s.is_panning) {
          s.is_panning = true;
          s.last_pan_x = left[8].x;
          s.last_pan_y = left[8].y;
        } else {
          // Invert X because camera is not mirrored
          s.cum_pan_x -= (left[8].x - s.last_pan_x) * 2.5;
          s.cum_pan_y += (left[8].y - s.last_pan_y) * 2.5;
          s.last_pan_x = left[8].x;
          s.last_pan_y = left[8].y;
        }
      } else {
        s.is_panning = false;
      }
    } else {
      s.is_panning = false;
    }

    let r_closed = false;
    if (right) {
      const dist = calculateDistance(right[8], right[4]);
      const angle = calculateAngle(right[4], right[8]);
      
      if (s.base_right_pinch === null) s.base_right_pinch = dist;
      
      let pinch_ratio = dist / s.base_right_pinch;
      pinch_ratio = Math.max(PARAMS.zoom_min, Math.min(PARAMS.zoom_max, pinch_ratio));
      newScale = ((1 - PARAMS.zoom_sensitivity) * s.scale + PARAMS.zoom_sensitivity * pinch_ratio);

      const r_th = isFingerUp(right, 4, 3);
      const r_i = isFingerUp(right, 8, 6);
      const r_m = isFingerUp(right, 12, 10);
      const r_r = isFingerUp(right, 16, 14);
      const r_p = isFingerUp(right, 20, 18);
      
      r_closed = !r_th && !r_i && !r_m && !r_r && !r_p;

      if (dist < 0.06) {
        if (!s.is_rotating) {
          s.is_rotating = true;
          s.last_rot_x = right[8].x;
          s.last_rot_y = right[8].y;
          s.last_angle = angle;

          if (t_now - s.last_tap_time < 0.6) {
            s.tap_count += 1;
            if (s.tap_count === 2) {
              detected_action = "double_tap";
              s.tap_count = 0;
            }
          } else {
            s.tap_count = 1;
          }
          s.last_tap_time = t_now;
        } else {
          s.cum_rot_x += (right[8].y - s.last_rot_y) * 4.5;
          // Invert X rotation because camera is not mirrored
          s.cum_rot_y -= (right[8].x - s.last_rot_x) * 4.5;
          
          // Rotation Z (Roll)
          const angleDiff = angle - s.last_angle;
          if (Math.abs(angleDiff) < 1.0) { // Filter out jumpy values
            s.cum_rot_z += angleDiff * 2.0;
          }
          
          s.last_rot_x = right[8].x;
          s.last_rot_y = right[8].y;
          s.last_angle = angle;
        }
      } else {
        s.is_rotating = false;
      }

      if (r_closed && t_now - s.last_action_time > 2.0) {
        detected_action = "crush";
        s.last_action_time = t_now;
      }
    } else {
      s.base_right_pinch = null;
      r_closed = false;
      s.is_rotating = false;
    }

    if (detected_action) {
      s.last_action_time = t_now;
    }

    const alpha = PARAMS.smooth_alpha;
    s.scale = (1 - alpha) * s.scale + alpha * newScale;
    s.peel = (1 - alpha) * s.peel + alpha * newPeel;

    setGestureState({
      scale: s.scale,
      rotation_x: s.cum_rot_x,
      rotation_y: s.cum_rot_y,
      rotation_z: s.cum_rot_z,
      pan_x: s.cum_pan_x,
      pan_y: s.cum_pan_y,
      peel: s.peel,
      action: detected_action
    });

  }, []);

  useEffect(() => {
    // MediaPipe uses the video element locally.
    if (!videoRef?.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      camera.stop();
      hands.close();
    };
  }, [videoRef, isProd, onResults]);

  return gestureState;
};
