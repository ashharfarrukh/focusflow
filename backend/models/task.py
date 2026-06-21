from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    deadline: Optional[str] = None
    tags: Optional[list] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[str] = None
    tags: Optional[list] = None
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    deadline: Optional[str]
    tags: list
    completed: bool
    created_at: str