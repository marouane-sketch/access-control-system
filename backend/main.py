from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List
import uuid
import time
import numpy as np
from contextlib import asynccontextmanager

from face_service import FaceService, SIMILARITY_THRESHOLD

# --- Models ---
class UserRecord(BaseModel):
    id: str
    username: str
    role: str
    created_at: float
    embedding: Optional[List[float]] = None

class ChallengeResponse(BaseModel):
    nonce: str
    timestamp: float

class AuthResponse(BaseModel):
    authorized: bool
    similarity: float
    message: str
    user: Optional[Dict] = None

# --- Application State ---
users_db: Dict[str, UserRecord] = {}
nonces_db: Dict[str, float] = {} # nonce -> timestamp

# Initialize Service
face_service = FaceService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Biometric Access Control Backend...")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# CORS (Allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
def cleanup_nonces():
    now = time.time()
    expired = [k for k, v in nonces_db.items() if now - v > 60] # 60s TTL
    for k in expired:
        del nonces_db[k]

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "online", "models_loaded": face_service.recognizer_session is not None}

@app.post("/auth/challenge", response_model=ChallengeResponse)
def get_challenge():
    """Generate a cryptographic nonce to prevent replay attacks."""
    nonce = str(uuid.uuid4())
    nonces_db[nonce] = time.time()
    cleanup_nonces()
    return {"nonce": nonce, "timestamp": time.time()}

@app.post("/auth/register")
def register_user(username: str = Form(...), role: str = Form(...)):
    """Create a new user identity (without biometrics yet)."""
    # Check duplicate
    for u in users_db.values():
        if u.username == username:
            raise HTTPException(status_code=400, detail="Username already exists")

    user_id = str(uuid.uuid4())
    new_user = UserRecord(id=user_id, username=username, role=role, created_at=time.time())
    users_db[user_id] = new_user
    return new_user

@app.post("/auth/enroll")
async def enroll_face(
    username: str = Form(...), 
    image: UploadFile = File(...)
):
    """
    Enroll a user's face. 
    1. Detect Face
    2. Check Liveness/Quality
    3. Generate Embedding
    4. Store in DB
    """
    user_record = next((u for u in users_db.values() if u.username == username), None)
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    content = await image.read()
    img = face_service.process_image(content)

    # 1. Quality / Liveness
    is_live, msg = face_service.check_liveness(img)
    if not is_live:
        raise HTTPException(status_code=400, detail=f"Image Quality Check Failed: {msg}")

    # 2. Embedding
    embedding = face_service.get_embedding(img)
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected or confidence too low. Please realign.")
    
    # 3. Storage
    user_record.embedding = embedding.tolist()
    return {"success": True, "message": f"User {username} enrolled successfully."}

@app.post("/auth/verify")
async def verify_face(
    image: UploadFile = File(...),
    nonce: str = Form(...)
):
    """
    Verify a face against the database.
    1. Validate Nonce (Anti-Replay)
    2. Detect & Embed
    3. 1:N Match (Search all users)
    4. Return result
    """
    # 1. Nonce Check
    if nonce not in nonces_db:
        raise HTTPException(status_code=403, detail="Invalid or expired challenge (Replay Attack Protection)")
    del nonces_db[nonce] # Consume nonce

    content = await image.read()
    img = face_service.process_image(content)

    # 2. Quality Check
    is_live, msg = face_service.check_liveness(img)
    if not is_live:
       return {"authorized": False, "similarity": 0.0, "message": f"Liveness Check Failed: {msg}"}

    # 3. Embedding
    input_embedding = face_service.get_embedding(img)
    if input_embedding is None:
        return {"authorized": False, "similarity": 0.0, "message": "No face detected"}

    # 4. Matching (1:N)
    best_score = -1.0
    best_user = None

    for user in users_db.values():
        if user.embedding:
            db_embed = np.array(user.embedding)
            score = face_service.compute_similarity(input_embedding, db_embed)
            if score > best_score:
                best_score = score
                best_user = user

    # 5. Decision
    if best_score > SIMILARITY_THRESHOLD and best_user:
        return {
            "authorized": True,
            "similarity": float(best_score),
            "message": f"Welcome, {best_user.username}",
            "user": {"username": best_user.username, "role": best_user.role}
        }
    else:
        return {
            "authorized": False,
            "similarity": float(best_score),
            "message": "Access Denied: Face not recognized"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
