from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Dict, List, Optional


@dataclass(frozen=True)
class FoodEntry:
    name: str
    canonical_name: str
    category: str
    subcategory: str
    calories_per_100g: float
    protein_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float = 0
    allergens: tuple[str, ...] = ()
    dietary_tags: tuple[str, ...] = ()
    alternatives: tuple[str, ...] = ()


class FoodCatalogService:
    def __init__(self) -> None:
        self.catalog: List[FoodEntry] = [
            FoodEntry("tomato", "tomato", "vegetable", "fruiting", 18, 0.9, 3.9, 0.2, fiber_g=1.2, dietary_tags=("vegan", "gluten-free"), alternatives=("cherry tomatoes", "roma tomato")),
            FoodEntry("onion", "onion", "vegetable", "allium", 40, 1.1, 9.3, 0.1, fiber_g=1.7, dietary_tags=("vegan", "gluten-free"), alternatives=("shallot", "spring onion")),
            FoodEntry("garlic", "garlic", "vegetable", "allium", 149, 6.4, 33.1, 0.5, fiber_g=2.1, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("spinach", "spinach", "vegetable", "leafy_green", 23, 2.9, 3.6, 0.4, fiber_g=2.2, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("bell pepper", "bell pepper", "vegetable", "fruiting", 31, 1.0, 6.0, 0.3, fiber_g=2.1, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("mushroom", "mushroom", "vegetable", "fungi", 22, 3.1, 3.3, 0.3, fiber_g=1.0, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("chicken breast", "chicken breast", "protein", "poultry", 165, 31.0, 0.0, 3.6, dietary_tags=("gluten-free",), alternatives=("turkey breast", "tofu")),
            FoodEntry("salmon", "salmon", "protein", "fish", 208, 20.0, 0.0, 13.0, dietary_tags=("gluten-free",), allergens=("fish",), alternatives=("trout", "mackerel")),
            FoodEntry("egg", "egg", "protein", "eggs", 155, 13.0, 1.1, 11.0, allergens=("egg",), dietary_tags=("gluten-free",), alternatives=("egg whites", "tofu scramble")),
            FoodEntry("greek yogurt", "greek yogurt", "dairy", "cultured", 59, 10.0, 3.6, 0.4, allergens=("dairy",), dietary_tags=("vegetarian",), alternatives=("skyr", "cottage cheese")),
            FoodEntry("quinoa", "quinoa", "grain", "pseudo_grain", 120, 4.4, 21.3, 1.9, fiber_g=2.8, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("rice", "rice", "grain", "cereal", 130, 2.7, 28.0, 0.3, fiber_g=0.4, dietary_tags=("vegan", "gluten-free"), alternatives=("cauliflower rice", "quinoa")),
            FoodEntry("bread", "bread", "grain", "baked", 265, 9.0, 49.0, 3.2, allergens=("gluten",), alternatives=("wrap", "seed crackers")),
            FoodEntry("avocado", "avocado", "fat", "fruit_fat", 160, 2.0, 8.5, 14.7, fiber_g=6.7, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("olive oil", "olive oil", "fat", "oil", 884, 0.0, 0.0, 100.0, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("paneer", "paneer", "protein", "dairy_cheese", 265, 18.0, 1.2, 20.8, allergens=("dairy",), dietary_tags=("vegetarian",), alternatives=("tofu", "halloumi")),
            FoodEntry("tofu", "tofu", "protein", "soy", 76, 8.0, 1.9, 4.8, allergens=("soy",), dietary_tags=("vegan", "gluten-free")),
            FoodEntry("oats", "oats", "grain", "breakfast", 389, 16.9, 66.3, 6.9, fiber_g=10.6, dietary_tags=("vegan",), allergens=("gluten",)),
            FoodEntry("banana", "banana", "fruit", "tropical", 89, 1.1, 22.8, 0.3, fiber_g=2.6, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("apple", "apple", "fruit", "pome", 52, 0.3, 13.8, 0.2, fiber_g=2.4, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("lentils", "lentils", "protein", "legume", 116, 9.0, 20.1, 0.4, fiber_g=7.9, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("beans", "beans", "protein", "legume", 127, 8.7, 22.8, 0.5, fiber_g=6.4, dietary_tags=("vegan", "gluten-free")),
            FoodEntry("pasta", "pasta", "grain", "noodle", 131, 5.0, 25.0, 1.1, allergens=("gluten",)),
            FoodEntry("yogurt", "yogurt", "dairy", "cultured", 61, 3.5, 4.7, 3.3, allergens=("dairy",)),
        ]

    def find(self, query: str) -> Optional[FoodEntry]:
        q = query.lower().strip()
        for item in self.catalog:
            if q == item.name or q == item.canonical_name or q in item.name or item.name in q:
                return item
        return None

    def suggest_substitutions(self, query: str) -> List[Dict[str, str]]:
        found = self.find(query)
        if not found:
            return []
        return [{"name": alt, "reason": f"Close substitute for {found.name}", "category": found.category} for alt in found.alternatives[:3]]

    def normalize_items(self, items: List[str]) -> List[Dict[str, object]]:
        results = []
        for item in items:
            found = self.find(item)
            if found:
                results.append(asdict(found))
            else:
                results.append({
                    "name": item,
                    "canonical_name": item.lower().strip(),
                    "category": "unknown",
                    "subcategory": "unknown",
                    "calories_per_100g": 0.0,
                    "protein_g": 0.0,
                    "carbs_g": 0.0,
                    "fats_g": 0.0,
                    "fiber_g": 0.0,
                    "allergens": [],
                    "dietary_tags": [],
                })
        return results

    def recommendations_for_goal(self, goal: Optional[str]) -> List[Dict[str, str]]:
        goal = (goal or "maintain").lower()
        if goal == "cut":
            return [
                {"item": "Chicken breast", "reason": "High protein and lean", "priority": "high"},
                {"item": "Greek yogurt", "reason": "Protein dense snack", "priority": "high"},
                {"item": "Leafy greens", "reason": "Low calorie volume", "priority": "high"},
            ]
        if goal == "bulk":
            return [
                {"item": "Quinoa", "reason": "Calorie-dense complex carb", "priority": "high"},
                {"item": "Peanut butter", "reason": "Energy dense healthy fat", "priority": "high"},
                {"item": "Oats", "reason": "Easy breakfast calories", "priority": "high"},
            ]
        return [
            {"item": "Eggs", "reason": "Balanced, versatile protein", "priority": "medium"},
            {"item": "Tofu", "reason": "Lean plant protein", "priority": "medium"},
            {"item": "Brown rice", "reason": "Simple meal base", "priority": "medium"},
        ]

food_catalog_service = FoodCatalogService()
