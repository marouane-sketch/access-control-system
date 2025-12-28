import requests
import time
import cv2
import numpy as np
import os

BASE_URL = "http://localhost:8000"

def create_dummy_image():
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite("test_face.jpg", img)
    return "test_face.jpg"

def test_failure_threshold():
    print(f"--- Testing Failure Threshold (3x) at {BASE_URL} ---")
    
    img_path = create_dummy_image()

    try:
        # 1. Reset/Check Status
        status = requests.get(f"{BASE_URL}/api/status").json()
        if status['locked']:
             print("System locked. Waiting...", status)
             # Wait out the lock if needed, or just warn
    
        # 2. Perform 3 Failed Attempts
        for i in range(1, 4):
            print(f"[Attempt {i}] Sending Face (Expect Fail)...")
            res = requests.post(f"{BASE_URL}/auth/challenge")
            if res.status_code != 200:
                print(f"FAILED to get challenge: {res.status_code}")
                # likely locked
                break
                
            nonce = res.json().get("nonce")
            
            with open(img_path, "rb") as f:
                res = requests.post(
                    f"{BASE_URL}/auth/verify", 
                    data={"nonce": nonce}, 
                    files={"image": f}
                )
                print(f"    Response: {res.status_code} {res.json().get('message')}")

    except Exception as e:
        print(f"Error: {e}")

    # 3. Check Lock Status
    status = requests.get(f"{BASE_URL}/api/status").json()
    print(f"[Final] Status: {status}")

    if status.get("locked"):
        print("SUCCESS: System is Locked after failures.")
    else:
        print("FAILURE: System NOT Locked.")

    if os.path.exists(img_path):
        os.remove(img_path)

if __name__ == "__main__":
    test_failure_threshold()
