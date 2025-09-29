from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.db.database import get_db
from app.db.models import User, DetectionLog
from app.schemas import Recipe
from app.api.routes_auth import get_current_user
from app.services.recipe_service import groq_recipe_service

router = APIRouter()

@router.post("/generate")
async def generate_recipes_from_ingredients(ingredients: List[str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db), recipe_count: int = Query(5, ge=1, le=10)):
    if not ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one ingredient is required"
        )
    
    try:
        recipe_response = groq_recipe_service.generate_recipes(
            ingredients=ingredients,
            user=current_user,
            recipe_count=recipe_count
        )
        
        if recipe_response.get("recipes"):
            recipe_names = [recipe["name"] for recipe in recipe_response["recipes"][:5]]
            
            detection_log = DetectionLog(
                user_id=current_user.id,
                detected_ingredients=json.dumps(ingredients),
                confidence_scores=json.dumps([1.0] * len(ingredients)),
                recommended_recipe_ids=json.dumps(recipe_names)
            )
            db.add(detection_log)
            db.commit()
        
        return {
            "success": True,
            "ingredients_used": ingredients,
            "recipes": recipe_response["recipes"],
            "generation_method": recipe_response["generation_method"],
            "total_recipes": recipe_response["total_count"],
            "user_personalization": {
                "goal": current_user.goal,
                "target_calories": current_user.target_calories,
                "target_protein_g": current_user.target_protein_g
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recipe generation failed: {str(e)}"
        )

@router.post("/meal-plan")
async def generate_meal_plan(ingredients: List[str], current_user: User = Depends(get_current_user), days: int = Query(3, ge=1, le=7)):
    try:
        meal_plan_response = groq_recipe_service.generate_meal_plan(
            ingredients=ingredients,
            user=current_user,
            days=days
        )
        
        return {
            "success": True,
            "meal_plan": meal_plan_response.get("meal_plan", []),
            "days": days,
            "generation_method": meal_plan_response.get("generation_method"),
            "user_goal": current_user.goal,
            "ingredients_used": ingredients
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Meal plan generation failed: {str(e)}"
        )

@router.post("/suggest-ingredients")
async def suggest_complementary_ingredients(base_ingredients: List[str], current_user: User = Depends(get_current_user)):
    if not groq_recipe_service.client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service unavailable"
        )
    
    try:
        prompt = f"""
                    Given these ingredients: {', '.join(base_ingredients)}
                    
                    Suggest 5-8 additional common ingredients that would:
                    1. Complement these ingredients well
                    2. Help create complete, balanced meals
                    3. Are commonly available in grocery stores
                    
                    Consider the user's goal: {current_user.goal or 'general health'}
                    
                    Return JSON format:
                    {{
                    "suggested_ingredients": [
                        {{
                        "name": "ingredient name",
                        "reason": "why this ingredient complements the existing ones",
                        "category": "protein|vegetable|grain|dairy|spice|other"
                        }}
                    ]
                    }}
                """
        
        response = groq_recipe_service.client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional chef and nutritionist."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        suggestions = json.loads(response.choices[0].message.content)
        
        return {
            "base_ingredients": base_ingredients,
            "suggestions": suggestions.get("suggested_ingredients", []),
            "user_goal": current_user.goal
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingredient suggestion failed: {str(e)}"
        )

@router.get("/history")
async def get_recipe_generation_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = Query(20, ge=1, le=100)):
    history_logs = db.query(DetectionLog)\
        .filter(DetectionLog.user_id == current_user.id)\
        .filter(DetectionLog.recommended_recipe_ids.isnot(None))\
        .order_by(DetectionLog.created_at.desc())\
        .limit(limit)\
        .all()
    
    history = []
    for log in history_logs:
        try:
            ingredients = json.loads(log.detected_ingredients) if log.detected_ingredients else []
            recipes = json.loads(log.recommended_recipe_ids) if log.recommended_recipe_ids else []
            
            history.append({
                "id": log.id,
                "ingredients": ingredients,
                "generated_recipes": recipes,
                "created_at": log.created_at,
                "generation_type": "ai_generated"
            })
        except json.JSONDecodeError:
            continue
    
    return {
        "history": history,
        "total_count": len(history)
    }