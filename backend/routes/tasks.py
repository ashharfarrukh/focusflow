from fastapi import APIRouter, HTTPException, Header
from models.task import TaskCreate, TaskUpdate
from database import tasks_collection
from utils.auth_helper import decode_token
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def get_user_id(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

def serialize_task(task):
    task["_id"] = str(task["_id"])
    return task

@router.post("/")
async def create_task(task: TaskCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    new_task = {
        "user_id": user_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "deadline": task.deadline,
        "tags": task.tags,
        "completed": False,
        "created_at": datetime.utcnow().isoformat()
    }
    result = await tasks_collection.insert_one(new_task)
    new_task["_id"] = str(result.inserted_id)
    return new_task

@router.get("/")
async def get_tasks(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    tasks = []
    async for task in tasks_collection.find({"user_id": user_id}):
        tasks.append(serialize_task(task))
    return tasks

@router.put("/{task_id}")
async def update_task(task_id: str, task: TaskUpdate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    update_data = {k: v for k, v in task.dict().items() if v is not None}
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {"$set": update_data}
    )
    return {"message": "Task updated"}

@router.delete("/{task_id}")
async def delete_task(task_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    await tasks_collection.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
    return {"message": "Task deleted"}