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
  name: 'Alex Johnson',
  email: 'alex@example.com',
  age: 28,
  gender: 'male',
  weight: 75,
  height: 180,
  activityLevel: 'moderate',
  dietaryPreferences: ['vegetarian'],
  fitnessGoal: 'cut',
  dailyCalories: 2000,
  targetProtein: 140,
  targetCarbs: 180,
  targetFats: 60,
  streak: 7,
};

const initialDetectedIngredients: Ingredient[] = [
  { name: 'Tomatoes', confidence: 95, selected: true },
  { name: 'Bell Peppers', confidence: 88, selected: true },
  { name: 'Onions', confidence: 92, selected: true },
  { name: 'Garlic', confidence: 78, selected: true },
  { name: 'Spinach', confidence: 85, selected: false },
  { name: 'Mushrooms', confidence: 82, selected: true },
];

const initialRecipes: RecipeItem[] = [
  {
    id: '1',
    title: 'Mediterranean Quinoa Bowl',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    time: '25 mins',
    servings: 2,
    calories: 420,
    protein: '18g',
    carbs: '45g',
    fat: '15g',
    difficulty: 'Easy',
    liked: false,
    tags: ['high-protein', 'meal-prep'],
    ingredients: ['quinoa', 'tomatoes', 'spinach', 'olive oil'],
    instructions: ['Cook the quinoa.', 'Sauté the vegetables.', 'Combine and finish with lemon.'],
  },
  {
    id: '2',
    title: 'Grilled Salmon with Asparagus',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    time: '20 mins',
    servings: 1,
    calories: 380,
    protein: '32g',
    carbs: '8g',
    fat: '24g',
    difficulty: 'Medium',
    liked: true,
    tags: ['omega-3', 'cut-friendly'],
    ingredients: ['salmon', 'asparagus', 'lemon'],
    instructions: ['Season the salmon.', 'Roast with asparagus.', 'Serve hot with lemon.'],
  },
];

const initialPantry: PantryItem[] = [
  { id: '1', name: 'Chicken Breast', category: 'Protein', quantity: 2, unit: 'lbs', expiryDate: '2026-06-26', status: 'fresh' },
  { id: '2', name: 'Bell Peppers', category: 'Vegetables', quantity: 3, unit: 'pieces', expiryDate: '2026-06-21', status: 'expiring' },
  { id: '3', name: 'Greek Yogurt', category: 'Dairy', quantity: 1, unit: 'container', expiryDate: '2026-06-20', status: 'expiring' },
  { id: '4', name: 'Quinoa', category: 'Grains', quantity: 500, unit: 'g', expiryDate: '2026-08-01', status: 'fresh' },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState(initialProfile);
  const [detectedIngredients, setDetectedIngredients] = useState(initialDetectedIngredients);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [pantryItems, setPantryItems] = useState(initialPantry);
  const [selectedIngredientNames, setSelectedIngredientNamesState] = useState<string[]>(
    initialDetectedIngredients.filter((ingredient) => ingredient.selected).map((ingredient) => ingredient.name)
  );

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
