from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.db.models import Recipe, User
from app.schemas import RecipeRecommendation
import json
import re

class RecipeRecommendationService:
    
    def __init__(self):
        self.sample_recipes = [
            {
                "name": "Vegetable Stir Fry",
                "description": "Quick and healthy vegetable stir fry",
                "instructions": "Heat oil, add vegetables, stir fry for 5-7 minutes",
                "prep_time_minutes": 10,
                "cook_time_minutes": 10,
                "servings": 2,
                "calories_per_serving": 180,
                "protein_g": 6,
                "carbs_g": 25,
                "fats_g": 8,
                "ingredients": "onion,carrot,spinach",
                "tags": "vegetarian,low-calorie,quick"
            },
            {
                "name": "Protein-Rich Omelette",
                "description": "High-protein breakfast omelette",
                "instructions": "Beat eggs, cook in pan, add vegetables",
                "prep_time_minutes": 5,
                "cook_time_minutes": 8,
                "servings": 1,
                "calories_per_serving": 320,
                "protein_g": 24,
                "carbs_g": 8,
                "fats_g": 22,
                "ingredients": "eggs,spinach,tomato",
                "tags": "high-protein,breakfast,quick"
            },
            {
                "name": "Chicken Rice Bowl",
                "description": "Balanced meal with chicken and rice",
                "instructions": "Cook rice, grill chicken, combine with vegetables",
                "prep_time_minutes": 15,
                "cook_time_minutes": 25,
                "servings": 1,
                "calories_per_serving": 450,
                "protein_g": 35,
                "carbs_g": 45,
                "fats_g": 12,
                "ingredients": "chicken,rice,carrot,spinach",
                "tags": "high-protein,balanced,meal-prep"
            }
        ]
    
    def find_matching_recipes(
        self, 
        detected_ingredients: List[str], 
        user: Optional[User] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Find recipes that match detected ingredients and user goals
        """
        recommendations = []
        
        for recipe_data in self.sample_recipes:
            recipe_ingredients = [ing.strip().lower() for ing in recipe_data["ingredients"].split(",")]
            detected_lower = [ing.lower() for ing in detected_ingredients]
            
            matched_ingredients = list(set(recipe_ingredients) & set(detected_lower))
            match_score = len(matched_ingredients) / len(recipe_ingredients) if recipe_ingredients else 0
            
            if match_score > 0:
                missing_ingredients = list(set(recipe_ingredients) - set(detected_lower))
                
                nutrition_alignment = self._calculate_nutrition_alignment(recipe_data, user)
                
                recommendations.append({
                    "recipe": recipe_data,
                    "match_score": match_score,
                    "matched_ingredients": matched_ingredients,
                    "missing_ingredients": missing_ingredients,
                    "nutrition_alignment": nutrition_alignment
                })
        
        recommendations.sort(
            key=lambda x: x["match_score"] * 0.6 + x["nutrition_alignment"]["overall_score"] * 0.4,
            reverse=True
        )
        
        return recommendations[:limit]
    
    def _calculate_nutrition_alignment(self, recipe_data: Dict, user: Optional[User]) -> Dict[str, float]:
        """
        Calculate how well recipe nutrition aligns with user goals
        """
        if not user or not user.goal:
            return {"overall_score": 0.5, "details": "No user goals specified"}
        
        recipe_calories = recipe_data.get("calories_per_serving", 0)
        recipe_protein = recipe_data.get("protein_g", 0)
        recipe_carbs = recipe_data.get("carbs_g", 0)
        recipe_fats = recipe_data.get("fats_g", 0)
        
        if user.goal == "bulk":
            calorie_score = min(1.0, recipe_calories / 400)
            protein_score = min(1.0, recipe_protein / 25)
        elif user.goal == "cut":
            calorie_score = max(0.1, 1.0 - (recipe_calories - 300) / 300) if recipe_calories > 300 else 1.0
            protein_score = min(1.0, recipe_protein / 20)
        else:
            calorie_score = 1.0 - abs(recipe_calories - 350) / 350
            protein_score = min(1.0, recipe_protein / 15)
        
        calorie_score = max(0, min(1, calorie_score))
        protein_score = max(0, min(1, protein_score))
        
        overall_score = (calorie_score + protein_score) / 2
        
        return {
            "overall_score": round(overall_score, 2),
            "calorie_score": round(calorie_score, 2),
            "protein_score": round(protein_score, 2),
            "details": f"Goal: {user.goal}, Calories: {recipe_calories}, Protein: {recipe_protein}g"
        }
    
    def get_recipes_by_ids(self, db: Session, recipe_ids: List[int]) -> List[Recipe]:
        """Get recipes from database by IDs"""
        return db.query(Recipe).filter(Recipe.id.in_(recipe_ids)).all()
    
    def seed_sample_recipes(self, db: Session):
        """Seed database with sample recipes"""
        for recipe_data in self.sample_recipes:
            existing = db.query(Recipe).filter(Recipe.name == recipe_data["name"]).first()
            if not existing:
                recipe = Recipe(**recipe_data)
                db.add(recipe)
        
        db.commit()