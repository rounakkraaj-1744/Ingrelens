from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

from app.services.food_catalog_service import food_catalog_service


class PantryService:
    def build_recommendations(self, pantry_items: List[Dict[str, object]], goal: str | None = None) -> List[Dict[str, object]]:
        recommendations: List[Dict[str, object]] = []
        for item in pantry_items:
            expiry = item.get("expiryDate") or item.get("expiry_date")
            expires_in = None
            if expiry:
                try:
                    expires_in = (datetime.fromisoformat(str(expiry)) - datetime.now(timezone.utc).astimezone()).days
                except Exception:
                    expires_in = None
            if expires_in is not None and expires_in <= 3:
                recommendations.append({
                    "item": item.get("name", "unknown"),
                    "reason": "Use soon to reduce waste",
                    "priority": "high",
                    "expires_in_days": max(expires_in, 0),
                })

        recommendations.extend(food_catalog_service.recommendations_for_goal(goal))
        return recommendations[:10]


pantry_service = PantryService()
