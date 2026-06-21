from fastapi import APIRouter, HTTPException, Header
from database import tasks_collection
from utils.auth_helper import decode_token
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
import json

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
def get_user_id(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

@router.post("/prioritize")
async def prioritize_tasks(authorization: str = Header(None)):
    user_id = get_user_id(authorization)

    tasks = []
    async for task in tasks_collection.find({"user_id": user_id, "completed": False}):
        tasks.append({
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task.get("description", ""),
            "priority": task.get("priority", "medium"),
            "deadline": task.get("deadline", "none"),
            "tags": task.get("tags", [])
        })

    if not tasks:
        return {"message": "No pending tasks to prioritize", "prioritized": []}

    task_list = "\n".join([
        f"{i+1}. Title: {t['title']}, Priority: {t['priority']}, Deadline: {t['deadline']}, Tags: {t['tags']}, Description: {t['description']}"
        for i, t in enumerate(tasks)
    ])

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a productivity assistant. Always respond with valid JSON only. No extra text, no markdown, no explanation outside the JSON."
            },
            {
                "role": "user",
                "content": f"""Analyze these tasks and return a prioritized order with reasoning.

Tasks:
{task_list}

Return ONLY a JSON array like this:
[
  {{"id": "task_id_here", "title": "task title", "reason": "why this should be done first"}},
  {{"id": "task_id_here", "title": "task title", "reason": "why this is second"}}
]

Use the exact task ids provided. Consider deadlines, priority levels, and logical work order."""
            }
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    raw = completion.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    prioritized = json.loads(raw)
    return {"prioritized": prioritized}