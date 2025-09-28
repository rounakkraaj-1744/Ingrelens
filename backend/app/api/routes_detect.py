from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import json
from typing import List

from app.db.database import get_db
from app.db.models import User, DetectionLog
from app.schemas import DetectionResponse
from app.api.routes_auth import get_current_user
from app.services.detect_service import IngredientDetectionService

router = APIRouter()

@router.post("/ingredients", response_model=DetectionResponse)
async def detect_ingredients(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect ingredients in uploaded image
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        image_bytes = await file.read()
        
        from app.main import app
        detector: IngredientDetectionService = app.state.detector
        
        if not detector:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Detection service not available"
            )
        
        detection_result = detector.detect_ingredients(image_bytes)
        
        detection_log = DetectionLog(
            user_id=current_user.id,
            detected_ingredients=json.dumps([ing["ingredient"] for ing in detection_result["ingredients"]]),
            confidence_scores=json.dumps([ing["confidence"] for ing in detection_result["ingredients"]]),
            image_path=None 
        )
        db.add(detection_log)
        db.commit()
        
        return DetectionResponse(
            ingredients=detection_result["ingredients"],
            detected_count=detection_result["detected_count"],
            processing_time_ms=detection_result["processing_time_ms"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Detection failed: {str(e)}"
        )

@router.get("/history")
async def get_detection_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get user's detection history"""
    detections = db.query(DetectionLog)\
        .filter(DetectionLog.user_id == current_user.id)\
        .order_by(DetectionLog.created_at.desc())\
        .limit(limit)\
        .all()
    
    history = []
    for detection in detections:
        history.append({
            "id": detection.id,
            "ingredients": json.loads(detection.detected_ingredients) if detection.detected_ingredients else [],
            "confidence_scores": json.loads(detection.confidence_scores) if detection.confidence_scores else [],
            "created_at": detection.created_at
        })
    
    return {"history": history, "total_count": len(history)}