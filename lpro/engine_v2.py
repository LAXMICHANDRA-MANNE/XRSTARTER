import threading
import time
from flask import Flask, render_template
from flask_socketio import SocketIO
import pybullet as p
from utils.math_utils import OneEuroFilter # For high sensitivity

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# --- PHYSICS SETUP ---
p.connect(p.DIRECT)
rocket_id = p.createCollisionShape(p.GEOM_CYLINDER, radius=0.2, height=1.5)
body_id = p.createMultiBody(baseMass=1.0, baseCollisionShapeIndex=rocket_id, basePosition=[0, 0, 5])
p.setGravity(0, 0, -9.8)

# --- SENSITIVITY FILTERS ---
filter_x = OneEuroFilter(60)
filter_y = OneEuroFilter(60)

def physics_step():
    """ Runs at 60Hz for professional smoothness """
    while True:
        p.stepSimulation()
        pos, ori = p.getBasePositionAndOrientation(body_id)
        # Instant broadcast to Frontend via WebSockets
        socketio.emit('sync', {'pos': pos, 'ori': p.getEulerFromQuaternion(ori)})
        time.sleep(1/60)

@socketio.on('move_hand')
def on_move(data):
    # Apply 'Tractor Beam' force based on smoothed hand coordinates
    clean_x = filter_x.filter(data['x'])
    target_pos = [clean_x * 10, data['y'] * 10, 5]
    p.applyExternalForce(body_id, -1, target_pos, [0,0,0], p.WORLD_FRAME)

threading.Thread(target=physics_step, daemon=True).start()