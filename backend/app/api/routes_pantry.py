from fastapi import APIRouter, Body
from typing import List, Dict, Optional

from app.services.pantry_service import pantry_service

router = APIRouter()


@router.post("/recommendations")
async def pantry_recommendations(items: List[Dict[str, object]] = Body(default_factory=list), goal: Optional[str] = None):
    return {"recommendations": pantry_service.build_recommendations(items, goal)}
