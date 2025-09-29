from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pathlib import Path

# routes
from app.api.routes_auth import router as auth_router
from app.api.routes_detect import router as detect_router
from app.api.routes_recipes import router as recipes_router
from app.api.routes_nutrition import router as nutrition_router

# database
from app.db.database import engine, Base
from app.services.detect_service import IngredientDetectionService
from app.services.recipe_service import groq_recipe_service

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriLens AI API",
    description="AI-powered nutrition and recipe recommendation system with Groq LLM",
    version="2.0.0"
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
        
        if groq_recipe_service.client:
            print("Groq recipe generation service initialized")
        else:
            print("Groq service unavailable - check GROQ_API_KEY")
        
    except Exception as e:
        print(f"Failed to initialize services: {e}")

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(detect_router, prefix="/api/detect", tags=["Detection"])
app.include_router(recipes_router, prefix="/api/recipes", tags=["AI Recipes"])
app.include_router(nutrition_router, prefix="/api/nutrition", tags=["Nutrition"])

@app.get("/")
async def root():
    return {
        "message": "NutriLens AI API",
        "version": "2.0.0",
        "features": [
            "Ingredient Detection",
            "AI Recipe Generation",
            "Personalized Nutrition",
            "Meal Planning"
        ],
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "ml_detection": "ready" if app.state.detector else "unavailable",
            "groq_recipes": "ready" if groq_recipe_service.client else "unavailable"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)