from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from app.services.food_catalog_service import food_catalog_service
from app.services.meal_analysis_service import meal_analysis_service

router = APIRouter()


@router.get("/search")
async def search_foods(q: str = Query(..., min_length=1)):
    result = food_catalog_service.find(q)
    return {"query": q, "result": result.__dict__ if result else None}


@router.post("/analyze")
async def analyze_foods(items: List[str], goal: Optional[str] = None):
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one item is required")
    return meal_analysis_service.analyze(items, goal=goal)


@router.get("/substitutions")
async def substitutions(item: str):
    return {"item": item, "substitutions": food_catalog_service.suggest_substitutions(item)}


@router.get("/recommendations")
async def recommendations(goal: Optional[str] = None):
    return {"goal": goal or "maintain", "recommendations": food_catalog_service.recommendations_for_goal(goal)}

