import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  FlaskConical, 
  Smile, 
  Frown, 
  Flame, 
  Check, 
  Clock, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { YUCK_TO_YUM_FOODS, YuckToYumFood } from '../data/yuckToYumFoods';
import { LoggedFoodItem, MealType } from '../types';

interface Props {
  onLogFoodToDiary: (item: LoggedFoodItem) => void;
  onNavigateToDiary: () => void;
}

export const YuckToYumView: React.FC<Props> = ({
  onLogFoodToDiary,
  onNavigateToDiary,
}) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>(YUCK_TO_YUM_FOODS[0].id);
  const [viewMode, setViewMode] = useState<'both' | 'yum_only'>('both');
  const [loggedToast, setLoggedToast] = useState<{ name: string; meal: string } | null>(null);

  const currentFood = YUCK_TO_YUM_FOODS.find(f => f.id === selectedFoodId) || YUCK_TO_YUM_FOODS[0];

  const handleLogFood = (mealType: MealType) => {
    const logged: LoggedFoodItem = {
      id: `${currentFood.id}-${Date.now()}`,
      foodId: currentFood.id,
      name: currentFood.yumRecipeName,
      mealType: mealType,
      servingQuantity: 1,
      servingUnit: currentFood.servingSize,
      grams: 200,
      calories: currentFood.calories,
      protein: currentFood.protein,
      carbs: currentFood.carbs,
      fat: currentFood.fat,
      fiber: currentFood.fiber,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogFoodToDiary(logged);
    setLoggedToast({ name: currentFood.yumRecipeName, meal: mealType });
    setTimeout(() => {
      setLoggedToast(null);
    }, 3000);
  };

  return (
    <div id="yuck-to-yum-section" className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {loggedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Logged to {loggedToast.meal.toUpperCase()}!</p>
              <p className="text-[11px] text-slate-300 truncate max-w-xs">{loggedToast.name}</p>
            </div>
            <button
              onClick={onNavigateToDiary}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer ml-2"
            >
              View Diary
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-rose-600 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/20 text-white border border-white/30 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              The Culinary Science Lab
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/30 text-amber-100 border border-amber-300/40">
              Transform "Yuck" Foods 🤢 ➔ "Yum" Delicacies 😋
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Never Force Yourself to Eat Bland Health Food Again
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            Hate bitter <strong>Karela</strong>, watery <strong>Lauki</strong>, sulfurous <strong>Broccoli</strong>, or cardboard <strong>Soya Chunks</strong>? Discover the biochemical cooking hacks (acid neutralization, Maillard flash-roasting, and osmotic moisture extraction) that turn nature’s healthiest foods into crave-worthy meals.
          </p>

          {/* 4 Golden Culinary Science Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-xs font-black text-amber-300 block">1. Acid Neutralizer</span>
              <span className="text-[11px] text-white/80">Amchur & lime chemically block bitter receptors</span>
            </div>
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-xs font-black text-emerald-300 block">2. Maillard Char</span>
              <span className="text-[11px] text-white/80">High dry heat caramelizes sugars & kills sulfur</span>
            </div>
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-xs font-black text-sky-300 block">3. Salt Osmosis</span>
              <span className="text-[11px] text-white/80">Sweats out acrid, bitter moisture completely</span>
            </div>
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-xs font-black text-purple-300 block">4. Lipid Coating</span>
              <span className="text-[11px] text-white/80">Roasted peanuts & curd wrap astringent enzymes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Food Picker Ribbon */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200/90 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-2">
          Select a Food You Dislike To See Its Makeover:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {YUCK_TO_YUM_FOODS.map((food) => {
            const isSelected = food.id === selectedFoodId;
            return (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelectedFoodId(food.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs scale-102'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{food.hindiName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}>
                  {food.foodName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Transformation Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: The "Yuck" Diagnosis (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-rose-50/70 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
                  <Frown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                    The "Yuck" Version
                  </h3>
                  <p className="text-[11px] text-rose-700 font-semibold">
                    Why your brain rejects {currentFood.hindiName}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-900">
                Score: {currentFood.yuckRating} / 10 🤢
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-rose-900 font-bold">The Standard Nightmare:</p>
              <p className="text-xs text-rose-800/90 leading-relaxed bg-white/60 p-3 rounded-2xl border border-rose-200/60 italic">
                "{currentFood.yuckReputation}"
              </p>
            </div>

            <div className="pt-2 border-t border-rose-200/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <Info className="w-3.5 h-3.5 text-rose-600" />
                <span>The Biological Mistake:</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Most people boil or steam these vegetables with plain salt. This releases bitter alkaloids, breaks cell walls into slimy water, and releases sulfur stench.
              </p>
            </div>
          </div>

          {/* The Science Hack Card */}
          <div className="bg-emerald-50/80 rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  The Food Science Fix
                </h3>
                <p className="text-[11px] text-emerald-700 font-semibold">How biochemistry saves the dish</p>
              </div>
            </div>

            <p className="text-xs text-emerald-900/90 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-emerald-200">
              {currentFood.scienceTrick}
            </p>

            <div className="bg-amber-100/80 rounded-2xl p-3 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Secret Weapon:
              </span>
              <p className="text-xs font-bold text-amber-950">{currentFood.secretWeapon}</p>
            </div>
          </div>
        </div>

        {/* Right Side: The "Yum" Masterpiece Recipe (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header with Title and Yum Score */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Smile className="w-3 h-3 text-emerald-600" />
                    The Yum Masterpiece
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Portion: {currentFood.servingSize}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {currentFood.yumRecipeName}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Flavor Profile: <strong className="text-emerald-700">{currentFood.flavorProfile}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 self-start sm:self-auto">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Yum Score</p>
                  <p className="text-lg font-black text-emerald-900">{currentFood.yumRating} / 10 😋</p>
                </div>
              </div>
            </div>

            {/* Description quote */}
            <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-100 text-xs text-amber-950 font-medium leading-relaxed">
              "{currentFood.yumDescription}"
            </div>

            {/* Nutritional Metrics */}
            <div className="grid grid-cols-5 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Calories</span>
                <span className="text-base font-black text-slate-900">{currentFood.calories}</span>
                <span className="text-[9px] text-slate-400 block">kcal</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Protein</span>
                <span className="text-base font-black text-emerald-600">{currentFood.protein}g</span>
                <span className="text-[9px] text-slate-400 block">clean</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Fat</span>
                <span className="text-base font-black text-amber-600">{currentFood.fat}g</span>
                <span className="text-[9px] text-slate-400 block">healthy</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Carbs</span>
                <span className="text-base font-black text-sky-600">{currentFood.carbs}g</span>
                <span className="text-[9px] text-slate-400 block">complex</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Fiber</span>
                <span className="text-base font-black text-teal-600">{currentFood.fiber}g</span>
                <span className="text-[9px] text-slate-400 block">gut happy</span>
              </div>
            </div>

            {/* Ingredients & Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Ingredients (5 cols) */}
              <div className="md:col-span-5 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Key Ingredients:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {currentFood.keyIngredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-[11px] font-medium leading-tight">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cooking Steps (7 cols) */}
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    How to Cook (The Magic Formula):
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentFood.prepTime}
                  </span>
                </div>
                <div className="space-y-2">
                  {currentFood.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-800">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar: Log to Diary */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Ready to transform this food in your diet?</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Log To:</span>
              <button
                type="button"
                onClick={() => handleLogFood('breakfast')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-all cursor-pointer"
              >
                Breakfast
              </button>
              <button
                type="button"
                onClick={() => handleLogFood('lunch')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-all cursor-pointer"
              >
                Lunch
              </button>
              <button
                type="button"
                onClick={() => handleLogFood('dinner')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-all cursor-pointer"
              >
                Dinner
              </button>
              <button
                type="button"
                onClick={() => handleLogFood('snacks')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Snack</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
