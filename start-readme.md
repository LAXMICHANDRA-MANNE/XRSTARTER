# How to Run the XRStarter Project

This project consists of three main components that need to run simultaneously:
1. **Frontend**: A React application using Vite (located in the root directory).
2. **Backend Server**: A Node.js backend using Express and Prisma (located in the `server` directory).
3. **Python Engine**: A Flask application for AR and gesture recognition (located in the `lpro` directory).
Vite React Frontend: http://localhost:5174/
Node/Express Backend: http://localhost:4000
Python Flask Engine: http://127.0.0.1:5000

## The Single Command

You can start all three components at the same time using `npx concurrently` with the following single command from the root of your project:

```bash
npx concurrently "npm run dev" "cd server && npm run dev" "cd lpro && source gesture_env/bin/activate && python app.py"
```

### Prerequisites Before Running

If this is your first time setting up the project, make sure you have installed all the dependencies for each part:

1. **Root (Frontend)**:
   ```bash
   npm install
   ```

2. **Server (Backend)**:
   ```bash
   cd server
   npm install
   ```

3. **LPro (Python Engine)**:
   ```bash
   cd lpro
   python3 -m venv gesture_env
   source gesture_env/bin/activate
   pip install opencv-python mediapipe flask numpy
   ```
