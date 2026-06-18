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
    status: Optional[str] = None
    meal_summary: Optional[Dict[str, object]] = None
    suggestions: Optional[List[str]] = None

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

class FoodMatch(BaseModel):
    name: str
    canonical_name: str
    category: str
    subcategory: str
    calories_per_100g: float
    protein_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float = 0
    allergens: List[str] = []
    dietary_tags: List[str] = []

class MealComponent(BaseModel):
    name: str
    canonical_name: str
    estimated_grams: float
    confidence: float
    nutrition: Dict[str, float]

class MealAnalysis(BaseModel):
    meal_name: str
    meal_type: str
    total_nutrition: Dict[str, float]
    components: List[MealComponent]
    confidence: float
    alternatives: List[Dict[str, str]]
    warnings: List[str]
    suggestions: List[str]

class PantryRecommendation(BaseModel):
    item: str
    reason: str
    priority: str
    expires_in_days: Optional[int] = None

class MealLogCreate(BaseModel):
    meal_name: str
    meal_type: str = "snack"
    source: str = "manual"
    ingredients: List[str] = []
    nutrition_summary: Dict[str, float] = {}
    confidence: float = 0.5
    notes: Optional[str] = None

class WeeklyInsight(BaseModel):
    period: str
    avg_calories: float
    avg_protein: float
    target_calories: Optional[float] = None
    target_protein: Optional[float] = None
    adherence_score: float
    top_foods: List[str]
    recommendations: List[str]

class PantryItemRecordCreate(BaseModel):
    external_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    quantity: float = 1
    unit: str = "item"
    expiry_date: Optional[str] = None
    status: str = "fresh"

class PantryItemRecord(BaseModel):
    id: int
    external_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    quantity: float
    unit: str
    expiry_date: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecipeLikeSync(BaseModel):
    recipe_id: str
    liked: bool = True
