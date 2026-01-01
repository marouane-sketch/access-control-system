"""
Automatic model downloader for Biometric Access Control System.

- Downloads required ONNX models at startup if missing
- Keeps GitHub repository lightweight
- Cloud-friendly (Railway / Render / Docker)
"""

import os
import urllib.request
from pathlib import Path

# -------------------------------------------------------------------
# Resolve absolute path to /backend/models
# -------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------------
# Required models (name -> download URL)
# -------------------------------------------------------------------
MODELS = {
    "face_detection_yunet_2023mar.onnx": (
        "https://raw.githubusercontent.com/opencv/opencv_zoo/main/models/"
        "face_detection_yunet/face_detection_yunet_2023mar.onnx"
    ),
    "w600k_r50.onnx": (
        "https://huggingface.co/maze/faceX/resolve/main/w600k_r50.onnx"
    ),
}

# -------------------------------------------------------------------
# Download logic
# -------------------------------------------------------------------
def download_model(filename: str, url: str) -> None:
    destination = MODELS_DIR / filename

    if destination.exists():
        print(f"[✓] Model already present: {filename}")
        return

    try:
        print(f"[↓] Downloading {filename}...")
        urllib.request.urlretrieve(url, destination)
        print(f"[✓] Successfully downloaded: {filename}")
    except Exception as e:
        raise RuntimeError(
            f"Failed to download model '{filename}'. Error: {e}"
        )

# -------------------------------------------------------------------
# Entry point (executed on import)
# -------------------------------------------------------------------
def ensure_models():
    for name, url in MODELS.items():
        download_model(name, url)

# Automatically run on import
ensure_models()
