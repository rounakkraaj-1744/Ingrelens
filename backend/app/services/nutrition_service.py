from typing import Dict, Tuple
from sqlalchemy.orm import Session
from app.db.models import User

class NutritionCalculatorService:
    ACTIVITY_MULTIPLIERS = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725, 
        'very_active': 1.9 
    }
    
    @staticmethod
    def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
        Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
        Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
        """
        base_bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age
        
        if gender.lower() == 'male':
            return base_bmr + 5
        else:
            return base_bmr - 161
    
    @staticmethod
    def calculate_tdee(bmr: float, activity_level: str) -> float:
        """Calculate Total Daily Energy Expenditure"""
        multiplier = NutritionCalculatorService.ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
        return bmr * multiplier
    
    @staticmethod
    def calculate_target_calories(tdee: float, goal: str, current_weight: float, target_weight: float) -> float:
        """Calculate target calories based on goal"""
        if goal == 'bulk':
            surplus = min(500, max(300, current_weight * 5))
            return tdee + surplus
        elif goal == 'cut':
            deficit = min(500, max(300, current_weight * 5))
            return tdee - deficit
        else:
            return tdee
    
    @staticmethod
    def calculate_macros(target_calories: float, goal: str) -> Dict[str, float]:
        """Calculate target macronutrients in grams"""
        if goal == 'bulk':
            protein_ratio = 0.30
            carbs_ratio = 0.40 
            fats_ratio = 0.30 
        elif goal == 'cut':
            protein_ratio = 0.35 
            carbs_ratio = 0.30  
            fats_ratio = 0.35  
        else: 
            protein_ratio = 0.25  
            carbs_ratio = 0.45 
            fats_ratio = 0.30     

        protein_g = (target_calories * protein_ratio) / 4
        carbs_g = (target_calories * carbs_ratio) / 4
        fats_g = (target_calories * fats_ratio) / 9
        
        return {
            'protein_g': round(protein_g, 1),
            'carbs_g': round(carbs_g, 1),
            'fats_g': round(fats_g, 1)
        }
    
    @staticmethod
    def update_user_nutrition_profile(db: Session, user: User) -> User:
        """Calculate and update user's nutrition profile"""
        if not all([user.current_weight_kg, user.height_cm, user.age, user.gender]):
            return user
        
        bmr = NutritionCalculatorService.calculate_bmr(
            user.current_weight_kg, 
            user.height_cm, 
            user.age, 
            user.gender
        )
        
        tdee = NutritionCalculatorService.calculate_tdee(bmr, user.activity_level or 'moderate')
        
        target_calories = NutritionCalculatorService.calculate_target_calories(
            tdee, 
            user.goal or 'maintain',
            user.current_weight_kg,
            user.target_weight_kg or user.current_weight_kg
        )
        
        macros = NutritionCalculatorService.calculate_macros(target_calories, user.goal or 'maintain')
        
        user.bmr = round(bmr, 1)
        user.tdee = round(tdee, 1)
        user.target_calories = round(target_calories, 1)
        user.target_protein_g = macros['protein_g']
        user.target_carbs_g = macros['carbs_g']
        user.target_fats_g = macros['fats_g']
        
        db.commit()
        db.refresh(user)
        
        return user