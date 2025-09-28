import sys
import os
from pathlib import Path
import time
from typing import List, Dict
import json

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
                return {
                    "ingredients": [
                        {"ingredient": "tomato", "confidence": 0.85, "bbox": [100, 100, 200, 200]},
                        {"ingredient": "onion", "confidence": 0.78, "bbox": [220, 150, 300, 230]}
                    ],
                    "detected_count": 2,
                    "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                    "status": "mock_data"
                }
            
            detections = self.detector.predict_from_bytes(image_bytes)
            
            processing_time = (time.time() - start_time) * 1000
            
            return {
                "ingredients": detections,
                "detected_count": len(detections),
                "processing_time_ms": round(processing_time, 2),
                "status": "success"
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