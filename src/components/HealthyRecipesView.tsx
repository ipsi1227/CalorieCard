import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Utensils, 
  Clock, 
  Flame, 
  Sparkles, 
  Plus, 
  Check, 
  ChevronRight, 
  Heart, 
  BookOpen, 
  Leaf, 
  ShieldCheck,
  X,
  ChefHat
} from 'lucide-react';
import { HEALTHY_RECIPES, HealthyRecipe } from '../data/healthyRecipes';
import { LoggedFoodItem, MealType } from '../types';

interface Props {
  onLogRecipeToDiary: (item: LoggedFoodItem) => void;
  onNavigateToDiary: () => void;
}

export const HealthyRecipesView: React.FC<Props> = ({
  onLogRecipeToDiary,
  onNavigateToDiary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRecipeModal, setActiveRecipeModal] = useState<HealthyRecipe | null>(null);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [logSuccessToast, setLogSuccessToast] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Recipes' },
    { id: 'high_protein', label: '⚡ High Protein (20g-38g)' },
    { id: 'fat_loss', label: '🔥 Fat Loss Essentials' },
    { id: 'quick_easy', label: '⏱️ Quick & Easy (<15 min)' },
    { id: 'indian_comfort', label: '🍲 Indian Healthy Comfort' },
    { id: 'salads_bowls', label: '🥗 Salads & Bowls' },
    { id: 'breakfast_smoothie', label: '🥣 Power Breakfasts' },
  ];

  const filteredRecipes = useMemo(() => {
    let list = HEALTHY_RECIPES;

    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const handleOpenLogModal = (recipe: HealthyRecipe) => {
    setActiveRecipeModal(recipe);
    setTargetMealType(recipe.defaultMealType);
    setPortionMultiplier(1);
  };

  const handleConfirmLog = () => {
    if (!activeRecipeModal) return;

    const logged: LoggedFoodItem = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      foodId: activeRecipeModal.id,
      name: activeRecipeModal.title,
      mealType: targetMealType,
      servingQuantity: portionMultiplier,
      servingUnit: `${activeRecipeModal.servingGrams}g serving`,
      grams: Math.round(activeRecipeModal.servingGrams * portionMultiplier),
      calories: Math.round(activeRecipeModal.calories * portionMultiplier),
      protein: Number((activeRecipeModal.protein * portionMultiplier).toFixed(1)),
      carbs: Number((activeRecipeModal.carbs * portionMultiplier).toFixed(1)),
      fat: Number((activeRecipeModal.fat * portionMultiplier).toFixed(1)),
      fiber: Number((activeRecipeModal.fiber * portionMultiplier).toFixed(1)),
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCheatMeal: false,
    };

    onLogRecipeToDiary(logged);
    setActiveRecipeModal(null);
    setLogSuccessToast(`Added "${activeRecipeModal.title}" to your ${targetMealType}!`);
    setTimeout(() => setLogSuccessToast(null), 3500);
  };

  return (
    <div id="healthy-recipes-view" className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {logSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{logSuccessToast}</span>
            <button
              type="button"
              onClick={onNavigateToDiary}
              className="ml-2 text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              View Diary
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Nutrient-Dense Superfoods & Fat Loss Kitchen</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Super Healthy Recipes for <span className="text-emerald-300">Lasting Fat Loss</span>
          </h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Delicious, high-protein, Indian & global recipes crafted with accurate calories, macros, and satiety-boosting nutrients. Each meal includes cooking steps and can be logged directly into your diary with a single click.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search healthy recipes (e.g., paneer, soya, dal, chicken, quinoa, oats, salad)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200">
            <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No recipes found matching your search</h3>
            <p className="text-xs text-slate-500 mt-1">Try another ingredient keyword or reset category filter.</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Header info & tags */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors">
                      {recipe.title}
                    </h3>
                  </div>

                  {/* Calories Pill */}
                  <div className="text-right shrink-0 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200/70">
                    <div className="flex items-center justify-end gap-1 text-base font-black text-amber-900">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{recipe.calories}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase">kcal / serving</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {recipe.subtitle}
                </p>

                {/* Macro Badges */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Protein</span>
                    <span className="text-xs font-black text-emerald-700">{recipe.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Carbs</span>
                    <span className="text-xs font-black text-amber-700">{recipe.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Fat</span>
                    <span className="text-xs font-black text-purple-700">{recipe.fat}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Fiber</span>
                    <span className="text-xs font-black text-sky-700">{recipe.fiber}g</span>
                  </div>
                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins total</span>
                  </div>
                  <span>•</span>
                  <span>{recipe.servingGrams}g portion</span>
                </div>

                {/* Health Benefits Snippet */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Key Health Benefits
                  </span>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                    {recipe.healthBenefits.slice(0, 2).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveRecipeModal(recipe)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Recipe & Steps</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLogModal(recipe)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Log to Diary</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recipe Details & Log Modal */}
      <AnimatePresence>
        {activeRecipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {activeRecipeModal.tags[0]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {activeRecipeModal.prepTimeMinutes + activeRecipeModal.cookTimeMinutes} mins
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {activeRecipeModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{activeRecipeModal.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRecipeModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Nutrition breakdown */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 text-lg font-black">
                      <Flame className="w-5 h-5 fill-amber-400" />
                      <span>{Math.round(activeRecipeModal.calories * portionMultiplier)} kcal</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {Math.round(activeRecipeModal.servingGrams * portionMultiplier)}g serving ({portionMultiplier}x portion)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Protein</span>
                      <span className="font-extrabold text-emerald-400">
                        {Number((activeRecipeModal.protein * portionMultiplier).toFixed(1))}g
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Carbs</span>
                      <span className="font-extrabold text-amber-400">
                        {Number((activeRecipeModal.carbs * portionMultiplier).toFixed(1))}g
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Fat</span>
                      <span className="font-extrabold text-purple-400">
                        {Number((activeRecipeModal.fat * portionMultiplier).toFixed(1))}g
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Fiber</span>
                      <span className="font-extrabold text-sky-400">
                        {Number((activeRecipeModal.fiber * portionMultiplier).toFixed(1))}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Benefits */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Scientific Health Benefits</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeRecipeModal.healthBenefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    <span>Ingredients Required</span>
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                    {activeRecipeModal.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step by Step Cooking Instructions */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-emerald-600" />
                    <span>Step-by-Step Preparation</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    {activeRecipeModal.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef Tip */}
                {activeRecipeModal.chefTip && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Nutritionist & Chef Secret:</strong>
                      <span>{activeRecipeModal.chefTip}</span>
                    </div>
                  </div>
                )}

                {/* Log to Diary Configuration */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                  <div className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>Log to Today's Diary</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Meal Section:</label>
                      <select
                        value={targetMealType}
                        onChange={(e) => setTargetMealType(e.target.value as MealType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="breakfast">☕ Breakfast</option>
                        <option value="lunch">🍲 Lunch</option>
                        <option value="dinner">🌙 Dinner</option>
                        <option value="snacks">🥨 Snacks</option>
                        <option value="cheat_meal">🍕 Cheat Meal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Portion Multiplier:</label>
                      <div className="flex items-center gap-1.5">
                        {[0.5, 1, 1.5, 2].map((mult) => (
                          <button
                            key={mult}
                            type="button"
                            onClick={() => setPortionMultiplier(mult)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              portionMultiplier === mult
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveRecipeModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log {Math.round(activeRecipeModal.calories * portionMultiplier)} kcal to {targetMealType}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
