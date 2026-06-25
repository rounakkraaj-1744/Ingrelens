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

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type UserProfile = {
  id: number;
  email: string;
  is_active: boolean;
  gender?: 'male' | 'female' | null;
  age?: number | null;
  height_cm?: number | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;
  goal?: 'bulk' | 'cut' | 'maintain' | null;
  activity_level?: string | null;
  bmr?: number | null;
  tdee?: number | null;
  target_calories?: number | null;
  target_protein_g?: number | null;
  target_carbs_g?: number | null;
  target_fats_g?: number | null;
  created_at: string;
};

export async function registerUser(payload: {
  email: string;
  password: string;
  gender?: string;
  age?: number;
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  goal?: string;
  activity_level?: string;
}) {
  return request<AuthToken>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(email: string, password: string) {
  const params = new URLSearchParams({ email, password });
  return request<AuthToken>(`/api/auth/login?${params.toString()}`, {
    method: 'POST',
  });
}

export async function fetchCurrentUser(token: string) {
  return request<UserProfile>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCurrentUser(token: string, payload: Partial<{
  gender: string;
  age: number;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  goal: string;
  activity_level: string;
}>) {
  return request<UserProfile>('/api/auth/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
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

export type MealHistoryItem = {
  id: number;
  meal_name: string;
  meal_type: string;
  source: string;
  ingredients: string[];
  nutrition_summary: Record<string, number>;
  confidence: number;
  created_at: string;
};

export async function fetchWeeklyInsights(token: string) {
  return request<WeeklyInsights>('/api/insights/weekly', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchMealHistory(token: string) {
  return request<{ history: MealHistoryItem[] }>('/api/meals/history', {
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

export async function logScan(payload: {
  ingredients: string[];
  confidence_scores: number[];
  meal_summary?: Record<string, unknown>;
}, token: string) {
  return request('/api/detect/history', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export type PantryItemRecord = {
  external_id?: string | null;
  name: string;
  category?: string | null;
  quantity: number;
  unit: string;
  expiry_date?: string | null;
  status: string;
};

export async function fetchPantryItems(token: string) {
  return request<{ items: PantryItemRecord[] }>('/api/pantry', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function syncPantryItems(token: string, items: PantryItemRecord[]) {
  return request<{ items: PantryItemRecord[] }>('/api/pantry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(items),
  });
}

export async function fetchRecipeLikes(token: string) {
  return request<{ likes: { recipe_id: string; liked: boolean }[] }>('/api/recipe-likes', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function syncRecipeLikes(token: string, items: { recipe_id: string; liked: boolean }[]) {
  return request('/api/recipe-likes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(items),
  });
}

export async function detectIngredients(imageUri: string, token: string) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  const response = await fetch(`${BASE_URL}/api/detect/ingredients`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json();
}

export async function generateRecipes(ingredients: string[], token: string) {
  return request<{ recipes: any[] }>('/api/recipes/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(ingredients),
  });
}

