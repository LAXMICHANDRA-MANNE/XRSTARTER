rm -rf mediapipe_env						
python3.10 -m venv gesture_env	
source gesture_env/bin/activate				
python --version								
Python 3.10.x									
pip install opencv-python mediapipe flask numpy	
python app.py