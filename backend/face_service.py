import cv2
import numpy as np
import os
import onnxruntime as ort
from typing import Tuple, Optional, List

# Constants
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
FACE_DETECTION_MODEL = "face_detection_yunet_2023mar.onnx"
FACE_RECOGNITION_MODEL = "w600k_r50.onnx" # ArcFace r50
CONFIDENCE_THRESHOLD = 0.9
SIMILARITY_THRESHOLD = 0.5 # Cosine Similarity Threshold (Strict)

class FaceService:
    def __init__(self):
        self.detector = None
        self.recognizer_session = None
        self.input_name = None
        
        # Ensure model dir exists
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR, exist_ok=True)
            print(f"[{self.__class__.__name__}] WARNING: 'models' directory created at {MODEL_DIR}. Please place ONNX models there.")

        self._load_models()

    def _load_models(self):
        """
        Load OpenCV Face Detector and ONNX ArcFace model.
        """
        det_path = os.path.join(MODEL_DIR, FACE_DETECTION_MODEL)
        rec_path = os.path.join(MODEL_DIR, FACE_RECOGNITION_MODEL)

        # 1. Load Detector (OpenCV DNN FaceDetectorYN)
        # We use a try-except block to handle missing models gracefully during initial setup
        try:
            if os.path.exists(det_path):
                self.detector = cv2.FaceDetectorYN.create(
                    model=det_path,
                    config="",
                    input_size=(320, 320),
                    score_threshold=0.8,
                    nms_threshold=0.3,
                    top_k=5000
                )
                print(f"[{self.__class__.__name__}] Face Detector Loaded.")
            else:
                print(f"[{self.__class__.__name__}] ERROR: Detection model not found at {det_path}")
        except Exception as e:
            print(f"[{self.__class__.__name__}] Failed to load Face Detector: {e}")

        # 2. Load Recognizer (ONNX Runtime for ArcFace)
        try:
            if os.path.exists(rec_path):
                self.recognizer_session = ort.InferenceSession(rec_path)
                self.input_name = self.recognizer_session.get_inputs()[0].name
                print(f"[{self.__class__.__name__}] Face Recognizer Loaded.")
            else:
                print(f"[{self.__class__.__name__}] ERROR: Recognition model not found at {rec_path}")
        except Exception as e:
            print(f"[{self.__class__.__name__}] Failed to load Face Recognizer: {e}")

    def process_image(self, image_bytes: bytes) -> np.ndarray:
        """Convert raw bytes to OpenCV image."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img

    def check_liveness(self, img: np.ndarray) -> Tuple[bool, str]:
        """
        Basic server-side liveness checks.
        1. Blur Detection (Laplacian Variance)
        2. Exposure/Glare Check
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Check
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 20: # Threshold for blur (Adjusted for webcam)
            return False, f"Image too blurry (Score: {laplacian_var:.1f})"

        # 2. Brightness/Glare Check
        avg_brightness = np.mean(gray)
        if avg_brightness < 40:
            return False, "Image too dark"
        if avg_brightness > 220:
            return False, "Image too bright / potential glare"

        return True, "OK"

    def get_embedding(self, img: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect face, align, and extract embedding.
        """
        if self.detector is None or self.recognizer_session is None:
            # Fallback for dev environment without models: Return random mock embedding
            # REMOVE THIS IN PRODUCTION - STRICTLY FOR DEV SCAFFOLDING IF FILES MISSING
            print(f"[{self.__class__.__name__}] STRICT MODE: Models missing. Returning None.")
            return None

        h, w, _ = img.shape
        self.detector.setInputSize((w, h))
        
        # Detect
        faces = self.detector.detect(img)
        if faces[1] is None:
            return None

        # Take the face with highest confidence
        # faces[1] shape: [n_faces, 15] (coords, landmarks, confidence)
        best_face = faces[1][0]
        confidence = best_face[-1]
        
        if confidence < 0.6: # Filter low confidence
            return None

        # Alignment & Preprocessing for ArcFace (112x112)
        # Using simple crop for now, ideal world uses landmarks for Affine Trans
        x, y, w_box, h_box = map(int, best_face[:4])
        
        # Padding
        pad_x = int(w_box * 0.1)
        pad_y = int(h_box * 0.1)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(w, x + w_box + pad_x)
        y2 = min(h, y + h_box + pad_y)
        
        face_crop = img[y1:y2, x1:x2]
        if face_crop.size == 0:
            return None

        # Resize to ArcFace input (112, 112)
        face_resized = cv2.resize(face_crop, (112, 112))
        
        # Normalize (Standard ArcFace preprocessing: (x - 127.5) / 128.0)
        face_blob = (face_resized.astype(np.float32) - 127.5) / 127.5
        
        # CHW format
        face_blob = np.transpose(face_blob, (2, 0, 1))
        face_blob = np.expand_dims(face_blob, axis=0) # Batch dim

        # Inference
        embedding = self.recognizer_session.run(None, {self.input_name: face_blob})[0]
        
        # Flatten and Normalize Embedding
        embedding = embedding.flatten()
        norm = np.linalg.norm(embedding)
        return embedding / norm

    def compute_similarity(self, embed1: np.ndarray, embed2: np.ndarray) -> float:
        """Cosine Similarity"""
        return np.dot(embed1, embed2)
