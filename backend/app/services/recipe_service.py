import os
import json
from typing import List, Dict, Optional
from groq import Groq
from sqlalchemy.orm import Session
from app.db.models import Recipe, User
import logging

logger = logging.getLogger(__name__)

class GroqRecipeService:
    
    def __init__(self):
        self.client = None
        self._initialize_groq_client()
        
    def _initialize_groq_client(self):
        """Initialize Groq client"""
        try:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                logger.warning("GROQ_API_KEY not found in environment variables")
                return
                
            self.client = Groq(api_key=api_key)
            logger.info("Groq client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self.client = None

    def generate_recipes(
        self, 
        ingredients: List[str], 
        user: Optional[User] = None,
        recipe_count: int = 5
    ) -> Dict:
        """
        Generate personalized recipes using Groq LLM based on detected ingredients
        """
        if not self.client:
            return self._fallback_recipes(ingredients, user, recipe_count)
        
        try:
            prompt = self._build_recipe_prompt(ingredients, user, recipe_count)
            
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional nutritionist and chef AI assistant. Generate healthy, practical recipes with accurate nutritional information in valid JSON format."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.7,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            recipes_data = json.loads(response_text)
            
            processed_recipes = self._process_generated_recipes(
                recipes_data, 
                ingredients, 
                user
            )
            
            return {
                "recipes": processed_recipes,
                "generation_method": "groq_llm",
                "model_used": "llama-3.1-70b-versatile",
                "total_count": len(processed_recipes),
                "user_goal": user.goal if user else "general"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Groq response: {e}")
            return self._fallback_recipes(ingredients, user, recipe_count)
            
        except Exception as e:
            logger.error(f"Error generating recipes with Groq: {e}")
            return self._fallback_recipes(ingredients, user, recipe_count)

    def _build_recipe_prompt(
        self, 
        ingredients: List[str], 
        user: Optional[User], 
        recipe_count: int
    ) -> str:
        """Build a detailed prompt for recipe generation"""
        
        ingredients_text = ", ".join(ingredients)
        
        user_context = ""
        if user:
            user_context = f"""
                            USER PROFILE:
                                - Goal: {user.goal or 'maintain weight'}
                                - Gender: {user.gender or 'not specified'}
                                - Age: {user.age or 'not specified'}
                                - Activity Level: {user.activity_level or 'moderate'}
                            """
            
            if user.target_calories:
                user_context += f"- Target Calories/day: {user.target_calories}\n"
            if user.target_protein_g:
                user_context += f"- Target Protein/day: {user.target_protein_g}g\n"
        
        goal_instructions = ""
        if user and user.goal == "bulk":
            goal_instructions = """
                                    GOAL-SPECIFIC REQUIREMENTS:
                                    - Focus on high-calorie, protein-rich recipes (400+ calories per serving)
                                    - Include complex carbohydrates for energy
                                    - Aim for 25-35g protein per recipe
                                    - Include healthy fats
                                """
        elif user and user.goal == "cut":
            goal_instructions = """
                                    GOAL-SPECIFIC REQUIREMENTS:
                                    - Focus on low-calorie, high-protein recipes (200-350 calories per serving)
                                    - Emphasize lean proteins and vegetables
                                    - Minimize refined carbohydrates
                                    - Aim for 20-30g protein per recipe
                                """
        else:
            goal_instructions = """
                                    GOAL-SPECIFIC REQUIREMENTS:
                                    - Balanced nutrition (300-400 calories per serving)
                                    - Include all macronutrients in healthy proportions
                                    - Aim for 15-25g protein per recipe
                                """

        prompt = f"""
                    Generate {recipe_count} healthy, practical recipes using primarily these available ingredients: {ingredients_text}

                    {user_context}

                    {goal_instructions}

                    REQUIREMENTS:
                    1. Each recipe should use at least 2-3 of the provided ingredients as main components
                    2. You may suggest common pantry ingredients (salt, pepper, oil, etc.) if needed
                    3. Provide accurate nutritional information per serving
                    4. Include prep time, cook time, and number of servings
                    5. Give clear, step-by-step instructions
                    6. Suggest recipe tags (e.g., "high-protein", "quick", "vegetarian")

                    RESPONSE FORMAT - Return a valid JSON object with this exact structure:
                    {{
                    "recipes": [
                        {{
                        "name": "Recipe Name",
                        "description": "Brief description",
                        "ingredients": [
                            {{
                            "name": "ingredient name",
                            "amount": "quantity",
                            "unit": "measurement unit"
                            }}
                        ],
                        "instructions": [
                            "Step 1...",
                            "Step 2...",
                            "Step 3..."
                        ],
                        "nutrition_per_serving": {{
                            "calories": 0,
                            "protein_g": 0,
                            "carbs_g": 0,
                            "fats_g": 0,
                            "fiber_g": 0
                        }},
                        "prep_time_minutes": 0,
                        "cook_time_minutes": 0,
                        "servings": 0,
                        "tags": ["tag1", "tag2"],
                        "difficulty": "easy|medium|hard",
                        "primary_ingredients": ["ingredient1", "ingredient2"]
                        }}
                    ]
                    }}

                    Make the recipes creative yet practical, focusing on nutrition and taste!
                """
        
        return prompt

    def _process_generated_recipes(self, recipes_data: Dict, original_ingredients: List[str], user: Optional[User]) -> List[Dict]:
        processed_recipes = []
        
        if "recipes" not in recipes_data:
            logger.warning("No 'recipes' key found in generated data")
            return []
        
        for recipe in recipes_data["recipes"]:
            try:
                primary_ingredients = recipe.get("primary_ingredients", [])
                matched_ingredients = [
                    ing for ing in primary_ingredients 
                    if any(orig.lower() in ing.lower() or ing.lower() in orig.lower() 
                          for orig in original_ingredients)
                ]
                
                match_score = len(matched_ingredients) / max(len(primary_ingredients), 1)
                
                nutrition_alignment = self._calculate_nutrition_alignment_groq(
                    recipe, user
                )
                processed_recipe = {
                    **recipe,
                    "match_score": round(match_score, 2),
                    "matched_ingredients": matched_ingredients,
                    "nutrition_alignment": nutrition_alignment,
                    "generation_method": "groq_llm"
                }
                
                processed_recipes.append(processed_recipe)
                
            except Exception as e:
                logger.warning(f"Error processing recipe: {e}")
                continue
        
        processed_recipes.sort(
            key=lambda x: (
                x.get("match_score", 0) * 0.6 + 
                x.get("nutrition_alignment", {}).get("overall_score", 0) * 0.4
            ),
            reverse=True
        )
        
        return processed_recipes

    def _calculate_nutrition_alignment_groq(self, recipe: Dict, user: Optional[User]) -> Dict[str, float]:
        
        if not user or not user.goal:
            return {"overall_score": 0.5, "details": "No user goals specified"}
        
        nutrition = recipe.get("nutrition_per_serving", {})
        recipe_calories = nutrition.get("calories", 0)
        recipe_protein = nutrition.get("protein_g", 0)
        
        if user.goal == "bulk":
            calorie_score = min(1.0, recipe_calories / 450)
            protein_score = min(1.0, recipe_protein / 30)
        elif user.goal == "cut":
            calorie_score = max(0.1, 1.0 - max(0, recipe_calories - 350) / 200)
            protein_score = min(1.0, recipe_protein / 25)
        else:
            calorie_score = 1.0 - abs(recipe_calories - 375) / 375
            protein_score = min(1.0, recipe_protein / 20)
        
        calorie_score = max(0, min(1, calorie_score))
        protein_score = max(0, min(1, protein_score))
        
        overall_score = (calorie_score + protein_score) / 2
        
        return {
            "overall_score": round(overall_score, 2),
            "calorie_score": round(calorie_score, 2),
            "protein_score": round(protein_score, 2),
            "details": f"Goal: {user.goal}, Calories: {recipe_calories}, Protein: {recipe_protein}g"
        }

    def _fallback_recipes(self, ingredients: List[str], user: Optional[User], recipe_count: int) -> Dict:
        logger.info("Using fallback static recipes")
        
        fallback_recipes = [
            {
                "name": "Simple Vegetable Stir Fry",
                "description": "Quick and healthy stir fry with available vegetables",
                "ingredients": [
                    {"name": "mixed vegetables", "amount": "2", "unit": "cups"},
                    {"name": "oil", "amount": "1", "unit": "tbsp"},
                    {"name": "salt", "amount": "1", "unit": "tsp"}
                ],
                "instructions": [
                    "Heat oil in a pan over medium-high heat",
                    "Add vegetables and stir-fry for 5-7 minutes",
                    "Season with salt and serve hot"
                ],
                "nutrition_per_serving": {
                    "calories": 120,
                    "protein_g": 4,
                    "carbs_g": 15,
                    "fats_g": 6,
                    "fiber_g": 4
                },
                "prep_time_minutes": 10,
                "cook_time_minutes": 10,
                "servings": 2,
                "tags": ["quick", "vegetarian", "healthy"],
                "difficulty": "easy",
                "primary_ingredients": ingredients[:3],
                "match_score": 0.8,
                "nutrition_alignment": {"overall_score": 0.7}
            }
        ]
        
        return {
            "recipes": fallback_recipes,
            "generation_method": "static_fallback",
            "total_count": len(fallback_recipes),
            "user_goal": user.goal if user else "general"
        }

    def generate_meal_plan(self, ingredients: List[str], user: Optional[User], days: int = 3) -> Dict:        
        if not self.client:
            return {"error": "Groq service unavailable", "meal_plan": []}
        
        try:
            prompt = self._build_meal_plan_prompt(ingredients, user, days)
            
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional nutritionist creating meal plans. Generate practical, balanced meal plans in valid JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.6,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            meal_plan_data = json.loads(response_text)
            
            return {
                "meal_plan": meal_plan_data,
                "generation_method": "groq_llm",
                "days": days,
                "user_goal": user.goal if user else "general"
            }
            
        except Exception as e:
            logger.error(f"Error generating meal plan: {e}")
            return {"error": str(e), "meal_plan": []}

    def _build_meal_plan_prompt(self, ingredients: List[str], user: Optional[User], days: int) -> str:
        ingredients_text = ", ".join(ingredients)
        user_info = ""
        
        if user:
            user_info = f"""
                            USER PROFILE:
                            - Goal: {user.goal or 'maintain'}
                            - Daily Calorie Target: {user.target_calories or 'not specified'}
                            - Daily Protein Target: {user.target_protein_g or 'not specified'}g
                        """

        return f"""
                    Create a {days}-day meal plan using these available ingredients: {ingredients_text}

                    {user_info}

                    Generate breakfast, lunch, and dinner for each day. Use the available ingredients creatively while ensuring nutritional balance.

                    Return JSON format:
                    {{
                    "meal_plan": [
                        {{
                        "day": 1,
                        "meals": {{
                            "breakfast": {{"name": "...", "calories": 0, "protein_g": 0}},
                            "lunch": {{"name": "...", "calories": 0, "protein_g": 0}},
                            "dinner": {{"name": "...", "calories": 0, "protein_g": 0}}
                        }},
                        "daily_totals": {{"calories": 0, "protein_g": 0}}
                        }}
                    ]
                    }}
                """
groq_recipe_service = GroqRecipeService()