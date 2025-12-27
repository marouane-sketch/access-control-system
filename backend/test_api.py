import requests
import cv2
import numpy as np
import os
import time

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health...", end="")
    try:
        res = requests.get(f"{BASE_URL}/health")
        print(f" {res.status_code} - {res.json()}")
    except Exception as e:
        print(f" FAILED: {e}")

def test_challenge():
    print("Testing Challenge...", end="")
    res = requests.post(f"{BASE_URL}/auth/challenge")
    if res.status_code == 200:
        nonce = res.json().get("nonce")
        print(f" OK (Nonce: {nonce})")
        return nonce
    else:
        print(f" FAIL {res.status_code}")
        return None

def test_register():
    print("Testing Registration...", end="")
    username = f"test_user_{int(time.time())}"
    res = requests.post(f"{BASE_URL}/auth/register", data={"username": username, "role": "USER"})
    if res.status_code == 200:
        print(f" OK (User: {username})")
        return username
    else:
        print(f" FAIL {res.status_code} - {res.text}")
        return None

def create_dummy_face():
    # Create a blank image (Face detection will fail, but API should accept upload)
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.rectangle(img, (100, 100), (200, 200), (255, 255, 255), -1)
    cv2.imwrite("dummy_face.jpg", img)
    return "dummy_face.jpg"

def test_enroll(username):
    print("Testing Enroll (Expect Fail due to dummy img)...", end="")
    img_path = create_dummy_face()
    with open(img_path, "rb") as f:
        res = requests.post(f"{BASE_URL}/auth/enroll", data={"username": username}, files={"image": f})
    
    # We expect 400 because dummy image has no face
    if res.status_code == 400 and "No face detected" in res.text:
        print(" OK (Correctly rejected dummy face)")
    else:
        print(f" STATUS: {res.status_code} (Response: {res.text})")

    if os.path.exists(img_path):
        os.remove(img_path)

if __name__ == "__main__":
    print(f"--- Testing Backend at {BASE_URL} ---")
    
    # 1. Health
    # Note: Backend might not be running if we didn't start it in separate process.
    # This script assumes 'uvicorn main:app' is running.
    # Since we can't easily start a daemon in this environment without blocking, 
    # we might skip actual execution if port is closed, or use tool to start it.
    
    try:
        test_health()
        nonce = test_challenge()
        user = test_register()
        if user:
            test_enroll(user)
    except requests.exceptions.ConnectionError:
        print("\n[!] Backend not running. Run 'uvicorn main:app --reload' in backend/ directory.")
