# backend-python/main.py
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config.db import close_pool, create_pool
from routes.admin_routes import router as admin_router
from routes.auth_routes import router as auth_router
from routes.claim_routes import router as claim_router
from routes.offer_routes import router as offer_router

load_dotenv()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the DB pool on startup and close it on shutdown."""
    await create_pool()
    yield
    await close_pool()


app = FastAPI(title="Offer.com API", lifespan=lifespan)

# Allow the React frontend to communicate without CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files (mirrors Express's express.static)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register all route groups
app.include_router(auth_router, prefix="/api/auth")
app.include_router(offer_router, prefix="/api/offers")
app.include_router(claim_router, prefix="/api/claims")
app.include_router(admin_router, prefix="/api/admin")


@app.get("/")
async def root():
    return "Welcome to the Offer.com API!"
