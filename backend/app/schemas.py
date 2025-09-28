from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    gender: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = 'moderate'

class UserUpdate(BaseModel):
    gender: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    gender: Optional[str]
    age: Optional[int]
    height_cm: Optional[float]
    current_weight_kg: Optional[float]
    target_weight_kg: Optional[float]
    goal: Optional[str]
    activity_level: Optional[str]
    bmr: Optional[float]
    tdee: Optional[float]
    target_calories: Optional[float]
    target_protein_g: Optional[float]
    target_carbs_g: Optional[float]
    target_fats_g: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class IngredientDetection(BaseModel):
    ingredient: str
    confidence: float
    bbox: List[float]

class DetectionResponse(BaseModel):
    ingredients: List[IngredientDetection]
    detected_count: int
    processing_time_ms: float

class RecipeBase(BaseModel):
    name: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: int = 1
    calories_per_serving: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fats_g: Optional[float] = None
    ingredients: str
    tags: Optional[str] = None

class Recipe(RecipeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecipeRecommendation(BaseModel):
    recipe: Recipe
    match_score: float
    matched_ingredients: List[str]
    missing_ingredients: List[str]
    nutrition_alignment: Dict[str, float]