# from motor.motor_asyncio import AsyncIOMotorClient
# from dotenv import load_dotenv
# import os

# load_dotenv()

# MONGODB_URL = os.getenv("MONGODB_URL")

# client = AsyncIOMotorClient(MONGODB_URL)
# db = client.focusflow

# users_collection = db.get_collection("users")
# tasks_collection = db.get_collection("tasks")

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
db = client.focusflow

users_collection = db.get_collection("users")
tasks_collection = db.get_collection("tasks")