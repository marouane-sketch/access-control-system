import cv2
import numpy as np
import os

model_path = os.path.join("backend", "models", "face_detection_yunet_2023mar.onnx")

def check():
    if not os.path.exists(model_path):
        print("Model not found")
        return

    detector = cv2.FaceDetectorYN.create(
        model=model_path,
        config="",
        input_size=(320, 320),
        score_threshold=0.6,
        nms_threshold=0.3,
        top_k=5000
    )

    # 1. Blank image (No face)
    img = np.zeros((320, 320, 3), dtype=np.uint8)
    ret = detector.detect(img)
    print(f"Detect(Blank) type: {type(ret)}")
    print(f"Detect(Blank) len: {len(ret)}")
    print(f"Detect(Blank) [0]: {ret[0]}")
    print(f"Detect(Blank) [1]: {ret[1]}")

    # 2. Dummy Face (Just to see structure if we can trigger it, but simple rect might fail)
    # We won't simulate a real face easily, but we just want to know strict return types.
    
if __name__ == "__main__":
    check()
