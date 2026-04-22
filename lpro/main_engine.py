import eventlet
eventlet.monkey_patch() # Essential for real-time WebSockets

from flask import Flask, render_template
from flask_socketio import SocketIO
from physics_engine import IRMAPhysics
from ar_engine.hand_tracker import HandTracker
import cv2
import threading

app = Flask(__name__)
socketio = SocketIO(app, async_mode='eventlet')
physics = JARVISPhysics()
tracker = HandTracker()

def physics_worker():
    """Background thread to keep the simulation running at 60Hz."""
    while True:
        state = physics.step()
        socketio.emit('physics_sync', state)
        socketio.sleep(0.016)

@socketio.on('hand_update')
def on_hand_move(data):
    # Map raw 0-1 camera coords to physics world coords (-10 to 10)
    wx = (data['x'] - 0.5) * 20
    wy = (0.5 - data['y']) * 20
    
    # Apply Tractor Beam force if pinching
    if data['pinching']:
        physics.apply_pull([wx, wy, 5], strength=150.0)

# Start the physics thread
threading.Thread(target=physics_worker, daemon=True).start()

if __name__ == '__main__':
    socketio.run(app, port=5000)