from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.routes_auth import get_current_user
from app.db.database import get_db
from app.db.models import PantryItemRecord, User
from app.schemas import PantryItemRecordCreate

router = APIRouter()


@router.get("")
async def list_pantry_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(PantryItemRecord).filter(PantryItemRecord.user_id == current_user.id).order_by(PantryItemRecord.created_at.desc()).all()
    return {"items": items}


@router.post("")
async def upsert_pantry_items(items: List[PantryItemRecordCreate], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = []
    for item in items:
        existing = None
        if item.external_id:
            existing = db.query(PantryItemRecord).filter(
                PantryItemRecord.user_id == current_user.id,
                PantryItemRecord.external_id == item.external_id,
            ).first()
        if existing:
            existing.name = item.name
            existing.category = item.category
            existing.quantity = item.quantity
            existing.unit = item.unit
            existing.expiry_date = item.expiry_date
            existing.status = item.status
            saved.append(existing)
        else:
            record = PantryItemRecord(
                user_id=current_user.id,
                external_id=item.external_id,
                name=item.name,
                category=item.category,
                quantity=item.quantity,
                unit=item.unit,
                expiry_date=item.expiry_date,
                status=item.status,
            )
            db.add(record)
            saved.append(record)
    db.commit()
    for record in saved:
        db.refresh(record)
    return {"items": saved}
