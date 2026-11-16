from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, tasks

app = FastAPI(
    title="Task Manager API",
    description="REST API для керування задачами: авторизація через JWT, "
    "власні задачі користувача, фільтри, пошук і пагінація.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/health", tags=["service"])
def health():
    return {"status": "ok"}
