from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.routes_auth import get_current_user
from app.db.database import get_db
from app.db.models import RecipeLikeRecord, User
from app.schemas import RecipeLikeSync

router = APIRouter()


@router.get("")
async def list_recipe_likes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    likes = db.query(RecipeLikeRecord).filter(RecipeLikeRecord.user_id == current_user.id).all()
    return {"likes": likes}


@router.post("")
async def sync_recipe_likes(items: List[RecipeLikeSync], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for item in items:
        existing = db.query(RecipeLikeRecord).filter(
            RecipeLikeRecord.user_id == current_user.id,
            RecipeLikeRecord.recipe_id == item.recipe_id,
        ).first()
        if existing:
            existing.liked = item.liked
        else:
            db.add(RecipeLikeRecord(user_id=current_user.id, recipe_id=item.recipe_id, liked=item.liked))
    db.commit()
    return {"ok": True}
