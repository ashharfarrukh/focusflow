from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.tasks import router as tasks_router
from routes.ai import router as ai_router 

app = FastAPI(title="FocusFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai_router, prefix="/ai", tags=["AI"])

@app.get("/")
def root():
    return {"message": "FocusFlow API is running 🚀"}