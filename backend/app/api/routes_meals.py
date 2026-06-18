from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.api.routes_auth import get_current_user
from app.db.database import get_db
from app.db.models import MealLog, User
from app.schemas import MealLogCreate

router = APIRouter()


@router.post("/log")
async def log_meal(meal: MealLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not meal.meal_name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Meal name is required")

    meal_log = MealLog(
        user_id=current_user.id,
        meal_name=meal.meal_name,
        meal_type=meal.meal_type,
        source=meal.source,
        ingredients=json.dumps(meal.ingredients),
        nutrition_summary=json.dumps(meal.nutrition_summary),
        confidence=meal.confidence,
        notes=meal.notes,
    )
    db.add(meal_log)
    db.commit()
    db.refresh(meal_log)

    return {
        "id": meal_log.id,
        "meal_name": meal_log.meal_name,
        "meal_type": meal_log.meal_type,
        "source": meal_log.source,
        "created_at": meal_log.created_at,
    }


@router.get("/history")
async def meal_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 50):
    logs = db.query(MealLog).filter(MealLog.user_id == current_user.id).order_by(MealLog.created_at.desc()).limit(limit).all()
    return {
        "history": [
            {
                "id": log.id,
                "meal_name": log.meal_name,
                "meal_type": log.meal_type,
                "source": log.source,
                "ingredients": json.loads(log.ingredients) if log.ingredients else [],
                "nutrition_summary": json.loads(log.nutrition_summary) if log.nutrition_summary else {},
                "confidence": log.confidence,
                "created_at": log.created_at,
            }
            for log in logs
        ]
    }
