export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'cheat_meal';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle';

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  startingWeight: number; // in kg
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  unit: 'metric' | 'imperial';
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProtein: number; // grams
  targetCarbs: number; // grams
  targetFat: number; // grams
  startDate?: string; // YYYY-MM-DD
  isConfigured: boolean;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  restaurant?: string; // e.g. "Domino's Pizza", "Taco Bell", "McDonald's", "Subway", "KFC"
  brand?: string; // e.g. "Britannia", "Nestlé Maggi", "McCain", "Lay's", "Amul", "Cadbury", "Haldiram's", "Parle", "Sunfeast", "Kellogg's"
  servingSize: string;
  servingGrams: number;
  calories: number; // kcal per serving
  protein: number; // g per serving
  carbs: number; // g per serving
  fat: number; // g per serving
  fiber: number; // g per serving
  vitamins?: {
    vitaminC?: number;
    calcium?: number;
    iron?: number;
    sodium?: number;
  };
  ingredients?: string;
  mealTags: MealType[];
  isCheatMeal?: boolean;
}

export interface LoggedFoodItem {
  id: string;
  foodId: string;
  name: string;
  restaurant?: string;
  brand?: string;
  mealType: MealType;
  servingQuantity: number;
  servingUnit: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timeAdded: string;
  isCustom?: boolean;
  isCheatMeal?: boolean;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  items: LoggedFoodItem[];
  waterMl?: number;
}

export interface MealTypeMeta {
  type: MealType;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  recommendedCaloriePct: number;
}
