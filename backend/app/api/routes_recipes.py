from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.db.database import get_db
from app.db.models import User, DetectionLog
from app.schemas import Recipe
from app.api.routes_auth import get_current_user
from app.services.recipe_service import RecipeRecommendationService

router = APIRouter()

@router.post("/recommend")
async def recommend_recipes(
    ingredients: List[str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get recipe recommendations based on detected ingredients
    """
    try:
        recipe_service = RecipeRecommendationService()
        
        recommendations = recipe_service.find_matching_recipes(
            detected_ingredients=ingredients,
            user=current_user,
            limit=limit
        )
        
        if recommendations:
            recipe_ids = [rec["recipe"]["name"] for rec in recommendations[:5]]
            
            last_detection = db.query(DetectionLog)\
                .filter(DetectionLog.user_id == current_user.id)\
                .order_by(DetectionLog.created_at.desc())\
                .first()
            
            if last_detection:
                last_detection.recommended_recipe_ids = json.dumps(recipe_ids)
                db.commit()
        
        return {
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "user_goal": current_user.goal,
            "ingredients_provided": ingredients
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recipe recommendation failed: {str(e)}"
        )

@router.get("/search")
async def search_recipes(
    query: Optional[str] = None,
    tags: Optional[str] = None,
    max_calories: Optional[int] = None,
    min_protein: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Search recipes with filters
    """
    recipe_service = RecipeRecommendationService()
    
    filtered_recipes = []
    for recipe_data in recipe_service.sample_recipes:
        if query and query.lower() not in recipe_data["name"].lower():
            continue
        
        if tags and tags.lower() not in recipe_data.get("tags", "").lower():
            continue
        
        if max_calories and recipe_data.get("calories_per_serving", 0) > max_calories:
            continue
        
        if min_protein and recipe_data.get("protein_g", 0) < min_protein:
            continue
        
        filtered_recipes.append(recipe_data)
    
    return {
        "recipes": filtered_recipes[:limit],
        "total_count": len(filtered_recipes),
        "filters_applied": {
            "query": query,
            "tags": tags,
            "max_calories": max_calories,
            "min_protein": min_protein
        }
    }

@router.get("/popular")
async def get_popular_recipes(
    current_user: User = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    """Get popular recipes based on user goal"""
    recipe_service = RecipeRecommendationService()
    
    goal_filtered = []
    for recipe_data in recipe_service.sample_recipes:
        tags = recipe_data.get("tags", "")
        
        if current_user.goal == "bulk" and "high-protein" in tags:
            goal_filtered.append(recipe_data)
        elif current_user.goal == "cut" and ("low-calorie" in tags or "high-protein" in tags):
            goal_filtered.append(recipe_data)
        else:
            goal_filtered.append(recipe_data)
    
    return {
        "recipes": goal_filtered[:limit],
        "user_goal": current_user.goal,
        "personalized": True
    }