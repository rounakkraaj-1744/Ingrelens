from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from pathlib import Path

# routes
from app.api.routes_auth import router as auth_router
from app.api.routes_detect import router as detect_router
from app.api.routes_recipes import router as recipes_router
from app.api.routes_nutrition import router as nutrition_router

from app.db.database import engine, Base
from app.services.detect_service import IngredientDetectionService

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriLens API",
    description="AI-powered nutrition and recipe recommendation system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        app.state.detector = IngredientDetectionService()
        print("Ingredient detection service initialized")
    except Exception as e:
        print("Failed to initialize services: ",e)
        app.state.detector = None

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(detect_router, prefix="/api/detect", tags=["Detection"])
app.include_router(recipes_router, prefix="/api/recipes", tags=["Recipes"])
app.include_router(nutrition_router, prefix="/api/nutrition", tags=["Nutrition"])

@app.get("/")
async def root():
    return {
        "message": "NutriLens API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ml_service": "ready" if app.state.detector else "unavailable"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)