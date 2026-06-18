const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type WeeklyInsights = {
  period: string;
  avg_calories: number;
  avg_protein: number;
  target_calories?: number | null;
  target_protein?: number | null;
  adherence_score: number;
  top_foods: string[];
  recommendations: string[];
};

export async function fetchWeeklyInsights(token: string) {
  return request<WeeklyInsights>('/api/insights/weekly', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function searchFood(query: string) {
  return request<{ query: string; result: unknown }>(`/api/food/search?q=${encodeURIComponent(query)}`);
}

export async function analyzeFoods(items: string[], goal?: string) {
  return request('/api/food/analyze', {
    method: 'POST',
    body: JSON.stringify({ items, goal }),
  });
}

export async function logMeal(payload: {
  meal_name: string;
  meal_type?: string;
  source?: string;
  ingredients?: string[];
  nutrition_summary?: Record<string, number>;
  confidence?: number;
  notes?: string;
}, token: string) {
  return request('/api/meals/log', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
