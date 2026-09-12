import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Plus, Flame, Check, Lightbulb, Heart, ShieldCheck } from 'lucide-react';
import { FoodDatabaseItem, MealType, LoggedFoodItem } from '../types';
import { FOOD_DATABASE } from '../data/foodDatabase';

interface Props {
  remainingCalories: number;
  consumedCalories: number;
  targetCalories: number;
  onAddFood: (food: LoggedFoodItem) => void;
}

export const SmartSuggestions: React.FC<Props> = ({
  remainingCalories,
  consumedCalories,
  targetCalories,
  onAddFood,
}) => {
  // Select smart suggestions based on user state
  const suggestions = React.useMemo(() => {
    // Curate tailored picks from the dataset
    const candidateIds = [
      { id: 'IND0097_SAL', reason: 'High fiber, zero cholesterol snack', meal: 'snacks' as MealType },
      { id: 'IND0080', reason: 'High protein (34g) for muscle preservation', meal: 'dinner' as MealType },
      { id: 'IND0046', reason: 'Light & comforting low-fat lentil bowl', meal: 'dinner' as MealType },
      { id: 'IND0074', reason: 'Hydrating digestive probiotic with only 45 kcal', meal: 'lunch' as MealType },
      { id: 'IND0111', reason: 'Natural sweetness with digestive papain enzyme', meal: 'snacks' as MealType },
      { id: 'IND0005', reason: 'Iron & calcium rich slow-release ragi carbs', meal: 'breakfast' as MealType },
      { id: 'IND0092', reason: 'Steamed protein snack, very low oil', meal: 'snacks' as MealType },
      { id: 'IND0106', reason: 'Under 190 kcal controlled sweet craving', meal: 'cheat_meal' as MealType },
    ];

    return candidateIds
      .map(c => {
        const food = FOOD_DATABASE.find(f => f.id === c.id);
        if (!food) return null;
        return {
          food,
          reason: c.reason,
          targetMeal: c.meal,
        };
      })
      .filter((item): item is { food: FoodDatabaseItem; reason: string; targetMeal: MealType } => item !== null);
  }, []);

  const handleQuickAdd = (food: FoodDatabaseItem, mealType: MealType) => {
    const item: LoggedFoodItem = {
      id: 'sugg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      foodId: food.id,
      name: food.name,
      mealType: mealType,
      servingQuantity: 1,
      servingUnit: food.servingSize,
      grams: food.servingGrams,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddFood(item);
  };

  return (
    <div id="smart-suggestions-section" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Smart Meal & Food Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Personalized ideas from your dataset to keep you within your {targetCalories} kcal goal
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          {remainingCalories > 0 ? `${remainingCalories} kcal budget left` : 'Budget met for today'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {suggestions.slice(0, 4).map(({ food, reason, targetMeal }) => (
          <div
            key={food.id}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/70 to-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {targetMeal.replace('_', ' ')}
                </span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {food.calories} kcal
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {food.name}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {reason}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                P: {food.protein}g • C: {food.carbs}g
              </span>

              <button
                type="button"
                onClick={() => handleQuickAdd(food, targetMeal)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title={`Add to ${targetMeal}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
