import torch
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import yaml
import json
from typing import List, Dict, Tuple

class IngredientDetector:
    def __init__(self, model_path: str, config_path: str):
        self.config = self.load_config(config_path)
        self.model = YOLO(model_path)
        self.classes = self.config['dataset']['classes']
        self.conf_threshold = self.config['model']['conf_threshold']
        
    def load_config(self, config_path: str):
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for YOLO inference"""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    def predict(self, image_path: str) -> List[Dict]:
        """
        Detect ingredients in image
        Returns list of detected ingredients with confidence scores
        """
        try:
            results = self.model(image_path, conf=self.conf_threshold)
            
            detections = []
            for r in results:
                boxes = r.boxes
                if boxes is not None:
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        if class_id < len(self.classes):
                            ingredient_name = self.classes[class_id]
                            
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            
                            detections.append({
                                'ingredient': ingredient_name,
                                'confidence': confidence,
                                'bbox': [x1, y1, x2, y2]
                            })
            
            return detections
        
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            return []
    
    def predict_from_bytes(self, image_bytes: bytes) -> List[Dict]:
        """Predict ingredients from image bytes (for API usage)"""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Could not decode image from bytes")
            
            results = self.model(image, conf=self.conf_threshold)
            
            detections = []
            for r in results:
                boxes = r.boxes
                if boxes is not None:
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        if class_id < len(self.classes):
                            ingredient_name = self.classes[class_id]
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            
                            detections.append({
                                'ingredient': ingredient_name,
                                'confidence': confidence,
                                'bbox': [x1, y1, x2, y2]
                            })
            
            return detections
            
        except Exception as e:
            print(f"Error during prediction from bytes: {str(e)}")
            return []

if __name__ == "__main__":
    detector = IngredientDetector(
        'ml/models/ingredient_detector.pt',
        'ml/config/detector_config.yml'
    )
    
    results = detector.predict('ml/data/test_image.jpg')
    print("Detected ingredients:", results)