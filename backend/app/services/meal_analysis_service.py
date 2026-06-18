from __future__ import annotations

from collections import Counter
from typing import Dict, List, Optional

from app.services.food_catalog_service import food_catalog_service


class MealAnalysisService:
    def analyze(self, items: List[str], goal: Optional[str] = None) -> Dict[str, object]:
        normalized = food_catalog_service.normalize_items(items)
        components = []
        total = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fats_g": 0.0, "fiber_g": 0.0}
        warnings: List[str] = []

        for item in normalized:
            grams = 150.0 if item["category"] != "fat" else 15.0
            multiplier = grams / 100.0
            nutrition = {
                "calories": round(item["calories_per_100g"] * multiplier, 1),
                "protein_g": round(item["protein_g"] * multiplier, 1),
                "carbs_g": round(item["carbs_g"] * multiplier, 1),
                "fats_g": round(item["fats_g"] * multiplier, 1),
                "fiber_g": round(item.get("fiber_g", 0.0) * multiplier, 1),
            }
            for k in total:
                total[k] += nutrition[k]
            components.append(
                {
                    "name": item["name"],
                    "canonical_name": item["canonical_name"],
                    "estimated_grams": grams,
                    "confidence": 0.86 if item["category"] != "unknown" else 0.45,
                    "nutrition": nutrition,
                }
            )
            if item["category"] == "unknown":
                warnings.append(f"Could not map {item['name']} to the catalog")

        goal = (goal or "maintain").lower()
        suggestions = self._build_suggestions(total, goal)
        alternatives = food_catalog_service.recommendations_for_goal(goal)
        meal_type = self._infer_meal_type(normalized)
        confidence = 0.92 if not warnings else 0.68

        return {
            "meal_name": f"{meal_type.title()} analysis",
            "meal_type": meal_type,
            "total_nutrition": {k: round(v, 1) for k, v in total.items()},
            "components": components,
            "confidence": confidence,
            "alternatives": alternatives[:3],
            "warnings": warnings,
            "suggestions": suggestions,
        }

    def _infer_meal_type(self, items: List[Dict[str, object]]) -> str:
        names = " ".join(item["canonical_name"] for item in items).lower()
        if any(token in names for token in ("oats", "banana", "yogurt")):
            return "breakfast"
        if any(token in names for token in ("salad", "spinach", "greens")):
            return "lunch"
        if any(token in names for token in ("pasta", "rice", "quinoa", "chicken", "salmon", "tofu")):
            return "dinner"
        return "snack"

    def _build_suggestions(self, total: Dict[str, float], goal: str) -> List[str]:
        suggestions = []
        if goal == "cut" and total["calories"] > 500:
            suggestions.append("Reduce the calorie density by trimming sauces and oils.")
        if total["protein_g"] < 20:
            suggestions.append("Add a protein anchor such as chicken, tofu, eggs, or Greek yogurt.")
        if total["fiber_g"] < 8:
            suggestions.append("Increase fiber with greens, legumes, or whole grains.")
        if not suggestions:
            suggestions.append("This meal is reasonably balanced for your goal.")
        return suggestions


meal_analysis_service = MealAnalysisService()
