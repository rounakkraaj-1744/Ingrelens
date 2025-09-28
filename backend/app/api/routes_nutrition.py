from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.api.routes_auth import get_current_user
from app.services.nutrition_service import NutritionCalculatorService

router = APIRouter()

@router.get("/profile")
async def get_nutrition_profile(current_user: User = Depends(get_current_user)):
    """Get user's nutrition profile and targets"""
    return {
        "user_id": current_user.id,
        "goal": current_user.goal,
        "activity_level": current_user.activity_level,
        "bmr": current_user.bmr,
        "tdee": current_user.tdee,
        "target_calories": current_user.target_calories,
        "target_macros": {
            "protein_g": current_user.target_protein_g,
            "carbs_g": current_user.target_carbs_g,
            "fats_g": current_user.target_fats_g
        },
        "physical_stats": {
            "current_weight_kg": current_user.current_weight_kg,
            "target_weight_kg": current_user.target_weight_kg,
            "height_cm": current_user.height_cm,
            "age": current_user.age,
            "gender": current_user.gender
        }
    }

@router.post("/recalculate")
async def recalculate_nutrition_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Recalculate user's nutrition profile"""
    if not all([current_user.current_weight_kg, current_user.height_cm, current_user.age, current_user.gender]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required profile information (weight, height, age, gender)"
        )
    
    updated_user = NutritionCalculatorService.update_user_nutrition_profile(db, current_user)
    
    return {
        "message": "Nutrition profile updated successfully",
        "bmr": updated_user.bmr,
        "tdee": updated_user.tdee,
        "target_calories": updated_user.target_calories,
        "target_macros": {
            "protein_g": updated_user.target_protein_g,
            "carbs_g": updated_user.target_carbs_g,
            "fats_g": updated_user.target_fats_g
        }
    }

@router.post("/calculate")
async def calculate_nutrition_stats(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str = "moderate",
    goal: str = "maintain"
):
    """Calculate nutrition stats for given parameters (without saving to user)"""
    if gender.lower() not in ['male', 'female']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gender must be 'male' or 'female'"
        )
    
    if activity_level not in NutritionCalculatorService.ACTIVITY_MULTIPLIERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Activity level must be one of: {list(NutritionCalculatorService.ACTIVITY_MULTIPLIERS.keys())}"
        )
    
    bmr = NutritionCalculatorService.calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = NutritionCalculatorService.calculate_tdee(bmr, activity_level)
    target_calories = NutritionCalculatorService.calculate_target_calories(tdee, goal, weight_kg, weight_kg)
    macros = NutritionCalculatorService.calculate_macros(target_calories, goal)
    
    return {
        "inputs": {
            "weight_kg": weight_kg,
            "height_cm": height_cm,
            "age": age,
            "gender": gender,
            "activity_level": activity_level,
            "goal": goal
        },
        "results": {
            "bmr": round(bmr, 1),
            "tdee": round(tdee, 1),
            "target_calories": round(target_calories, 1),
            "target_macros": macros
        },
        "formulas_used": {
            "bmr": "Mifflin-St Jeor Equation",
            "tdee": f"BMR × {NutritionCalculatorService.ACTIVITY_MULTIPLIERS[activity_level]} (activity multiplier)",
            "macros": f"Based on {goal} goal ratios"
        }
    }