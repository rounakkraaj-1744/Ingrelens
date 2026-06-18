import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchCurrentUser,
  updateCurrentUser,
  fetchPantryItems,
  syncPantryItems,
  fetchRecipeLikes,
  syncRecipeLikes,
} from '@/lib/api';

export type Goal = 'bulk' | 'cut' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Ingredient = {
  name: string;
  confidence: number;
  selected: boolean;
};

export type RecipeItem = {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: number;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  liked: boolean;
  tags: string[];
  ingredients: string[];
  instructions: string[];
};

export type PantryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: 'fresh' | 'expiring' | 'expired';
};

type AppProfile = {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | '';
  weight: number;
  targetWeight: number;
  height: number;
  activityLevel: ActivityLevel;
  dietaryPreferences: string[];
  fitnessGoal: Goal;
  dailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  streak: number;
};

type AppState = {
  profile: AppProfile;
  setProfile: (profile: Partial<AppProfile>) => void;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  detectedIngredients: Ingredient[];
  setDetectedIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  recipes: RecipeItem[];
  setRecipes: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  pantryItems: PantryItem[];
  toggleRecipeLike: (id: string) => void;
  setRecipeLike: (id: string, liked: boolean) => void;
  selectedIngredientNames: string[];
  setSelectedIngredientNames: (names: string[]) => void;
  updateScanFromIngredients: (ingredients: Ingredient[]) => void;
  addPantryItemsFromScan: (ingredients: Ingredient[]) => void;
};

const initialProfile: AppProfile = {
  name: '',
  email: '',
  age: 0,
  gender: '',
  weight: 0,
  targetWeight: 0,
  height: 0,
  activityLevel: 'moderate',
  dietaryPreferences: [],
  fitnessGoal: 'maintain',
  dailyCalories: 0,
  targetProtein: 0,
  targetCarbs: 0,
  targetFats: 0,
  streak: 0,
};

const AppContext = createContext<AppState | null>(null);
const STORAGE_KEY = 'nutrilens.app-state.v1';
const AUTH_KEY = 'nutrilens.auth-token.v1';

type PersistedState = {
  profile: AppProfile;
  detectedIngredients: Ingredient[];
  recipes: RecipeItem[];
  pantryItems: PantryItem[];
  selectedIngredientNames: string[];
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState(initialProfile);
  const [detectedIngredients, setDetectedIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [selectedIngredientNames, setSelectedIngredientNamesState] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(AUTH_KEY)])
      .then(async ([payload, token]) => {
        if (!active) return;
        if (token) {
          setAuthTokenState(token);
          try {
            const remote = await fetchCurrentUser(token);
            if (!active) return;
            setProfileState({
              ...initialProfile,
              name: remote.email.split('@')[0],
              email: remote.email,
              age: remote.age ?? 0,
              gender: remote.gender ?? '',
              weight: remote.current_weight_kg ?? 0,
              targetWeight: remote.target_weight_kg ?? 0,
              height: remote.height_cm ?? 0,
              activityLevel: (remote.activity_level as AppProfile['activityLevel']) ?? 'moderate',
              dietaryPreferences: [],
              fitnessGoal: (remote.goal as Goal) ?? 'maintain',
              dailyCalories: remote.target_calories ?? 0,
              targetProtein: remote.target_protein_g ?? 0,
              targetCarbs: remote.target_carbs_g ?? 0,
              targetFats: remote.target_fats_g ?? 0,
              streak: 0,
            });
            try {
              const [remotePantry, remoteLikes] = await Promise.all([
                fetchPantryItems(token),
                fetchRecipeLikes(token),
              ]);
              if (!active) return;
              if (remotePantry.items?.length) {
                setPantryItems(
                  remotePantry.items.map((item) => ({
                    id: item.external_id || String(item.name),
                    name: item.name,
                    category: item.category || 'Detected',
                    quantity: item.quantity,
                    unit: item.unit,
                    expiryDate: item.expiry_date || new Date().toISOString(),
                    status: (item.status as PantryItem['status']) || 'fresh',
                  }))
                );
              }
              if (remoteLikes.likes?.length) {
                setRecipes((current) =>
                  current.map((recipe) => {
                    const liked = remoteLikes.likes.find((like) => like.recipe_id === recipe.id);
                    return liked ? { ...recipe, liked: liked.liked } : recipe;
                  })
                );
              }
            } catch {
              // fall back to local cache
            }
          } catch {
            if (payload) {
              const parsed = JSON.parse(payload) as Partial<PersistedState>;
              if (parsed.profile) setProfileState({ ...initialProfile, ...parsed.profile });
              if (parsed.detectedIngredients) setDetectedIngredients(parsed.detectedIngredients);
              if (parsed.recipes) setRecipes(parsed.recipes);
              if (parsed.pantryItems) setPantryItems(parsed.pantryItems);
              if (parsed.selectedIngredientNames) setSelectedIngredientNamesState(parsed.selectedIngredientNames);
            }
          }
        } else if (payload) {
          const parsed = JSON.parse(payload) as Partial<PersistedState>;
          if (parsed.profile) setProfileState({ ...initialProfile, ...parsed.profile });
          if (parsed.detectedIngredients) setDetectedIngredients(parsed.detectedIngredients);
          if (parsed.recipes) setRecipes(parsed.recipes);
          if (parsed.pantryItems) setPantryItems(parsed.pantryItems);
          if (parsed.selectedIngredientNames) setSelectedIngredientNamesState(parsed.selectedIngredientNames);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedState = {
      profile,
      detectedIngredients,
      recipes,
      pantryItems,
      selectedIngredientNames,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [hydrated, profile, detectedIngredients, recipes, pantryItems, selectedIngredientNames]);

  useEffect(() => {
    if (!hydrated || !authToken) return;
    if (pantryItems.length === 0) return;
    syncPantryItems(
      authToken,
      pantryItems.map((item) => ({
        external_id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiryDate,
        status: item.status,
      }))
    ).catch(() => {});
  }, [hydrated, authToken, pantryItems]);

  useEffect(() => {
    if (!hydrated || !authToken) return;
    const likes = recipes.map((recipe) => ({ recipe_id: recipe.id, liked: recipe.liked }));
    syncRecipeLikes(authToken, likes).catch(() => {});
  }, [hydrated, authToken, recipes]);

  useEffect(() => {
    if (!hydrated || !authToken || !profile.email) return;
    updateCurrentUser(authToken, {
      gender: profile.gender || undefined,
      age: profile.age || undefined,
      height_cm: profile.height || undefined,
      current_weight_kg: profile.weight || undefined,
      target_weight_kg: profile.targetWeight || undefined,
      goal: profile.fitnessGoal || undefined,
      activity_level: profile.activityLevel || undefined,
    }).catch(() => {});
  }, [hydrated, authToken, profile]);

  const setProfile = (patch: Partial<AppProfile>) => {
    setProfileState((current) => ({ ...current, ...patch }));
  };

  const setAuthToken = (token: string | null) => {
    setAuthTokenState(token);
    if (token) {
      AsyncStorage.setItem(AUTH_KEY, token).catch(() => {});
    } else {
      AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
    }
  };

  const toggleRecipeLike = (id: string) => {
    setRecipes((current) =>
      current.map((recipe) => (recipe.id === id ? { ...recipe, liked: !recipe.liked } : recipe))
    );
  };

  const setRecipeLike = (id: string, liked: boolean) => {
    setRecipes((current) => current.map((recipe) => (recipe.id === id ? { ...recipe, liked } : recipe)));
  };

  const updateScanFromIngredients = (ingredients: Ingredient[]) => {
    setDetectedIngredients(ingredients);
    setSelectedIngredientNamesState(
      ingredients.filter((ingredient) => ingredient.selected).map((ingredient) => ingredient.name)
    );
  };

  const addPantryItemsFromScan = (ingredients: Ingredient[]) => {
    const newItems = ingredients
      .filter((ingredient) => ingredient.selected)
      .map((ingredient, index) => ({
        id: `scan-${Date.now()}-${index}`,
        name: ingredient.name,
        category: 'Detected',
        quantity: 1,
        unit: 'item',
        expiryDate: '2026-06-30',
        status: 'fresh' as const,
      }));

    setPantryItems((current) => [...newItems, ...current]);
  };

  const value = useMemo<AppState>(
    () => ({
      profile,
      setProfile,
      authToken,
      setAuthToken,
      detectedIngredients,
      setDetectedIngredients,
      recipes,
      setRecipes,
      pantryItems,
      toggleRecipeLike,
      setRecipeLike,
      selectedIngredientNames,
      setSelectedIngredientNames: setSelectedIngredientNamesState,
      updateScanFromIngredients,
      addPantryItemsFromScan,
    }),
    [profile, authToken, detectedIngredients, recipes, pantryItems, selectedIngredientNames]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
