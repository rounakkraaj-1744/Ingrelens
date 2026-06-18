import React, { createContext, useContext, useMemo, useState } from 'react';

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
  detectedIngredients: Ingredient[];
  setDetectedIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  recipes: RecipeItem[];
  setRecipes: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  pantryItems: PantryItem[];
  toggleRecipeLike: (id: string) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState(initialProfile);
  const [detectedIngredients, setDetectedIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [selectedIngredientNames, setSelectedIngredientNamesState] = useState<string[]>([]);

  const setProfile = (patch: Partial<AppProfile>) => {
    setProfileState((current) => ({ ...current, ...patch }));
  };

  const toggleRecipeLike = (id: string) => {
    setRecipes((current) =>
      current.map((recipe) => (recipe.id === id ? { ...recipe, liked: !recipe.liked } : recipe))
    );
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
      detectedIngredients,
      setDetectedIngredients,
      recipes,
      setRecipes,
      pantryItems,
      toggleRecipeLike,
      selectedIngredientNames,
      setSelectedIngredientNames: setSelectedIngredientNamesState,
      updateScanFromIngredients,
      addPantryItemsFromScan,
    }),
    [profile, detectedIngredients, recipes, pantryItems, selectedIngredientNames]
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
