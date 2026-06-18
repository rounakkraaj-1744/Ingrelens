import sys
import os
from pathlib import Path
import time
from typing import List, Dict
import json
from app.services.food_catalog_service import food_catalog_service
from app.services.meal_analysis_service import meal_analysis_service

ml_path = Path(__file__).parent.parent.parent / "ml"
sys.path.append(str(ml_path))

try:
    from src.inference import IngredientDetector
except ImportError as e:
    print(f"Warning: Could not import IngredientDetector: {e}")
    IngredientDetector = None

class IngredientDetectionService:
    def __init__(self):
        self.detector = None
        self._initialize_detector()
    
    def _initialize_detector(self):
        """Initialize the ML model"""
        try:
            if IngredientDetector is None:
                print("IngredientDetector not available")
                return
                
            model_path = ml_path / "models" / "ingredient_detector.pt"
            config_path = ml_path / "config" / "detector_config.yml"
            
            if not model_path.exists():
                print(f"Model not found at {model_path}")
                return
                
            if not config_path.exists():
                print(f"Config not found at {config_path}")
                return
            
            self.detector = IngredientDetector(str(model_path), str(config_path))
            print("Ingredient detector initialized successfully")
            
        except Exception as e:
            print("Failed to initialize detector:",e)
            self.detector = None
    
    def detect_ingredients(self, image_bytes: bytes) -> Dict:
        """
        Detect ingredients from image bytes
        Returns detection results with timing info
        """
        start_time = time.time()
        
        try:
            if self.detector is None:
                ingredient_names = ["tomato", "onion", "garlic", "spinach"]
                ingredients = []
                for index, name in enumerate(ingredient_names):
                    catalog = food_catalog_service.find(name)
                    ingredients.append({
                        "ingredient": catalog.canonical_name if catalog else name,
                        "display_name": catalog.name if catalog else name,
                        "category": catalog.category if catalog else "unknown",
                        "subcategory": catalog.subcategory if catalog else "unknown",
                        "confidence": round(0.95 - index * 0.05, 2),
                        "bbox": [80 + index * 60, 80, 150 + index * 60, 150],
                        "nutrition_hint": {
                            "calories_per_100g": catalog.calories_per_100g if catalog else 0,
                            "protein_g": catalog.protein_g if catalog else 0,
                        },
                    })
                meal_summary = meal_analysis_service.analyze([item["ingredient"] for item in ingredients], goal="maintain")
                return {
                    "ingredients": ingredients,
                    "detected_count": len(ingredients),
                    "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                    "status": "mock_data",
                    "meal_summary": meal_summary,
                    "suggestions": meal_summary["suggestions"],
                }
            
            detections = self.detector.predict_from_bytes(image_bytes)
            
            processing_time = (time.time() - start_time) * 1000
            
            return {
                "ingredients": detections,
                "detected_count": len(detections),
                "processing_time_ms": round(processing_time, 2),
                "status": "success",
                "meal_summary": meal_analysis_service.analyze([d.get("ingredient", "") for d in detections]),
                "suggestions": ["Confirm the detected items to improve the estimate."]
            }
            
        except Exception as e:
            return {
                "ingredients": [],
                "detected_count": 0,
                "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                "error": str(e),
                "status": "error"
            }
    
    def is_available(self) -> bool:
        """Check if detection service is available"""
        return self.detector is not None
