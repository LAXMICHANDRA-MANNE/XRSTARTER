import pybullet as p
import pybullet_data
import time

class IRMAPhysics:
    def __init__(self):
        # Direct mode runs without a window (Three.js is our window)
        self.client = p.connect(p.DIRECT)
        p.setAdditionalSearchPath(pybullet_data.getDataPath())
        p.setGravity(0, 0, -9.81)

        # Create a physical representation of your rocket
        self.shape = p.createCollisionShape(p.GEOM_CYLINDER, radius=0.3, height=2.0)
        self.body = p.createMultiBody(baseMass=2.0, baseCollisionShapeIndex=self.shape, basePosition=[0, 0, 5])

    def apply_pull(self, target_pos, strength=100.0):
        """Applies a magnetic force pulling the rocket toward your hand."""
        current_pos, _ = p.getBasePositionAndOrientation(self.body)
        direction = [t - c for t, c in zip(target_pos, current_pos)]
        
        # Apply force to the center of mass
        p.applyExternalForce(self.body, -1, [d * strength for d in direction], current_pos, p.WORLD_FRAME)

    def step(self):
        p.stepSimulation()
        pos, ori = p.getBasePositionAndOrientation(self.body)
        return {"pos": pos, "rot": p.getEulerFromQuaternion(ori)}