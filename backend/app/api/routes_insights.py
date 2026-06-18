from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

from app.db.database import get_db
from app.api.routes_auth import get_current_user
from app.db.models import MealLog, User

router = APIRouter()


@router.get("/weekly")
async def weekly_insights(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meal_logs = db.query(MealLog).filter(MealLog.user_id == current_user.id).order_by(MealLog.created_at.desc()).limit(30).all()
    calories = []
    protein = []
    food_counter = Counter()
    for log in meal_logs:
        try:
            summary = json.loads(log.nutrition_summary) if log.nutrition_summary else {}
        except json.JSONDecodeError:
            summary = {}
        calories.append(float(summary.get("calories", 0)))
        protein.append(float(summary.get("protein_g", 0)))
        try:
            ingredients = json.loads(log.ingredients) if log.ingredients else []
            food_counter.update([str(item) for item in ingredients])
        except json.JSONDecodeError:
            pass

    avg_calories = round(sum(calories) / max(len(calories), 1), 1)
    avg_protein = round(sum(protein) / max(len(protein), 1), 1)
    adherence = 0.0
    if current_user.target_calories:
        adherence = max(0.0, 1 - abs(avg_calories - current_user.target_calories) / current_user.target_calories)
    if current_user.target_protein_g:
        adherence = (adherence + max(0.0, min(1.0, avg_protein / current_user.target_protein_g))) / 2
    return {
        "period": "last_30_entries",
        "avg_calories": avg_calories,
        "avg_protein": avg_protein,
        "target_calories": current_user.target_calories,
        "target_protein": current_user.target_protein_g,
        "adherence_score": round(adherence, 2),
        "top_foods": [item for item, _ in food_counter.most_common(5)],
        "recommendations": [
            "Increase protein density at breakfast.",
            "Track more meals consistently for better trend accuracy.",
        ],
    }
