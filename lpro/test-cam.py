import cv2, time

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Camera failed to open")
    exit()

print("✅ Camera opened! Streaming...")

while True:
    ok, frame = cap.read()
    if not ok:
        print("❌ Lost camera frame!")
        break

    cv2.imshow("CAM TEST", frame)
    if cv2.waitKey(1) == 27:  # ESC to exit
        break

cap.release()
cv2.destroyAllWindows()