from fastapi import APIRouter, HTTPException
from models.user import UserRegister, UserLogin
from database import users_collection
from utils.auth_helper import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed
    }
    result = await users_collection.insert_one(new_user)
    token = create_token({"sub": str(result.inserted_id)})
    return {"token": token, "name": user.name, "email": user.email}

@router.post("/login")
async def login(user: UserLogin):
    found = await users_collection.find_one({"email": user.email})
    if not found or not verify_password(user.password, found["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token({"sub": str(found["_id"])})
    return {"token": token, "name": found["name"], "email": found["email"]}