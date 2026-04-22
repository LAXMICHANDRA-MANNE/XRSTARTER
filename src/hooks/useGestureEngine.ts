import { useState, useEffect } from 'react';

export interface GestureState {
  scale: number;
  rotation: number;
  peel: number;
  drag_active: boolean;
  drag_x: number;
  drag_y: number;
  action: string | null;
  action_payload: any;
  cum_rot_x: number;
  cum_rot_y: number;
  cum_pan_x: number;
  cum_pan_y: number;
  rot_x?: number;
  rot_y?: number;
  rot_z?: number;
}

import { API_URLS } from '../config';

export function useGestureEngine() {
  const [gesture, setGesture] = useState<GestureState>({
    scale: 1,
    rotation: 0,
    peel: 0,
    drag_active: false,
    drag_x: 0.5,
    drag_y: 0.5,
    action: null,
    action_payload: {},
    cum_rot_x: 0,
    cum_rot_y: 0,
    cum_pan_x: 0,
    cum_pan_y: 0
  });

  useEffect(() => {
    let interval: any;
    
    async function fetchStatus() {
      try {
        const res = await fetch(`${API_URLS.PYTHON_ENGINE}/status`);
        if (res.ok) {
          const data = await res.json();
          setGesture(data);
        }
      } catch (err) {
        // silently ignore polling errors to not flood console
      }
    }

    interval = setInterval(fetchStatus, 50); // poll every 50ms for low latency
    return () => clearInterval(interval);
  }, []);

  return gesture;
}
