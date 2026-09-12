import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Flame, 
  Zap, 
  Moon, 
  Sparkles, 
  Clock, 
  Plus, 
  Check, 
  Filter, 
  ShieldCheck, 
  ArrowRight, 
  Award,
  ChevronDown,
  Info,
  Layers,
  Leaf,
  Drumstick,
  Egg
} from 'lucide-react';
import { INDIAN_DAILY_100_FOODS, IndianPowerFood } from '../data/indianDailyFoods100';
import { LoggedFoodItem, MealType } from '../types';

interface Props {
  onLogFoodToDiary: (item: LoggedFoodItem) => void;
  onNavigateToDiary: () => void;
}

export const IndianDailyFoodsView: React.FC<Props> = ({
  onLogFoodToDiary,
  onNavigateToDiary,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedEnergy, setSelectedEnergy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'fat' | 'time'>('protein');
  const [loggedNotification, setLoggedNotification] = useState<{ name: string; meal: string } | null>(null);
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);

  // Filtered & Sorted list
  const filteredFoods = useMemo(() => {
    return INDIAN_DAILY_100_FOODS.filter(food => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(q);
        const matchesRegional = food.regionalName?.toLowerCase().includes(q);
        const matchesHack = food.smartHack.toLowerCase().includes(q);
        const matchesTags = food.healthTags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesRegional && !matchesHack && !matchesTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && food.category !== selectedCategory) {
        return false;
      }

      // Diet
      if (selectedDiet !== 'all' && food.dietType !== selectedDiet) {
        return false;
      }

      // Energy Profile
      if (selectedEnergy !== 'all' && food.energyProfile !== selectedEnergy) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'protein') return b.protein - a.protein;
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'fat') return a.fat - b.fat;
      if (sortBy === 'time') return a.prepTimeMinutes - b.prepTimeMinutes;
      return 0;
    });
  }, [searchTerm, selectedCategory, selectedDiet, selectedEnergy, sortBy]);

  const handleLogFood = (food: IndianPowerFood, mealType: MealType) => {
    const logged: LoggedFoodItem = {
      id: `${food.id}-${Date.now()}`,
      foodId: food.id,
      name: food.name,
      mealType: mealType,
      servingQuantity: 1,
      servingUnit: food.servingUnit,
      grams: food.servingGrams,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogFoodToDiary(logged);
    setLoggedNotification({ name: food.name, meal: mealType });
    setTimeout(() => {
      setLoggedNotification(null);
    }, 3000);
  };

  const getEnergyBadge = (energy: string) => {
    if (energy.includes('All-Day')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <Flame className="w-3 h-3 text-amber-600" />
          Sustained Energy
        </span>
      );
    }
    if (energy.includes('Pre-Workout')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
          <Zap className="w-3 h-3 text-rose-600" />
          Pre-Workout Burst
        </span>
      );
    }
    if (energy.includes('Night')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
          <Moon className="w-3 h-3 text-indigo-600" />
          Nocturnal Repair
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
        <Sparkles className="w-3 h-3 text-emerald-600" />
        Midday Focus
      </span>
    );
  };

  const getDietIcon = (diet: string) => {
    switch (diet) {
      case 'vegan':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Leaf className="w-2.5 h-2.5" /> Vegan</span>;
      case 'veg':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"><Leaf className="w-2.5 h-2.5" /> Veg</span>;
      case 'eggitarian':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Egg className="w-2.5 h-2.5" /> Eggitarian</span>;
      case 'non_veg':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><Drumstick className="w-2.5 h-2.5" /> Non-Veg</span>;
      default:
        return null;
    }
  };

  return (
    <div id="indian-daily-foods-section" className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {loggedNotification && (
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
              <p className="text-xs font-bold text-white">Logged to {loggedNotification.meal.toUpperCase()}!</p>
              <p className="text-[11px] text-slate-300 truncate max-w-xs">{loggedNotification.name}</p>
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
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              100+ Indian Daily Staples Re-Engineered
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              ⚡ High Energy • 💧 Low Fat • 💪 High Protein
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Daily Indian Food, Supercharged for Zero Energy Slumps
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Everyday authentic home-cooked meals—from cheelas, poha, and rajma chawal to dal tadka, biryanis, and roadside chaats—scientifically optimized to deliver <span className="text-emerald-300 font-semibold">15g–38g clean protein</span>, <span className="text-teal-300 font-semibold">sustained glycemic energy</span>, and <span className="text-amber-300 font-semibold">under 5g–10g healthy fat</span>.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Protein Range</p>
              <p className="text-lg font-black text-emerald-300">12g – 38g</p>
              <p className="text-[10px] text-slate-400">per meal serving</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Cooking Fat</p>
              <p className="text-lg font-black text-teal-300">1/2 – 1 tsp</p>
              <p className="text-[10px] text-slate-400">ghee / cold pressed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Post-Meal Slump</p>
              <p className="text-lg font-black text-amber-300">Zero Crash</p>
              <p className="text-[10px] text-slate-400">slow-digesting fiber</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Total Database</p>
              <p className="text-lg font-black text-white">100+ Foods</p>
              <p className="text-[10px] text-slate-400">1-click logging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food (e.g., 'cheela', 'rajma', 'soya', 'paneer', 'biryani')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Sort:</span>
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSortBy('protein')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  sortBy === 'protein' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Highest Protein
              </button>
              <button
                onClick={() => setSortBy('calories')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  sortBy === 'calories' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lowest Cal
              </button>
              <button
                onClick={() => setSortBy('fat')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  sortBy === 'fat' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lowest Fat
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  sortBy === 'time' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fastest (<span className="hidden sm:inline">Prep</span>)
              </button>
            </div>
          </div>
        </div>

        {/* Categories & Diet Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Meal:</span>
          {[
            { id: 'all', label: 'All 100+' },
            { id: 'breakfast', label: '🌅 Breakfast' },
            { id: 'lunch', label: '🍛 Power Lunch' },
            { id: 'dinner', label: '🌙 Light Dinner' },
            { id: 'snacks', label: '☕ Smart Snacks' },
            { id: 'drinks_sides', label: '🥤 Tonics & Sides' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Diet:</span>
          {[
            { id: 'all', label: 'All Diets' },
            { id: 'veg', label: '🥦 Veg' },
            { id: 'vegan', label: '🌱 Vegan' },
            { id: 'eggitarian', label: '🍳 Egg' },
            { id: 'non_veg', label: '🍗 Non-Veg' },
          ].map(diet => (
            <button
              key={diet.id}
              onClick={() => setSelectedDiet(diet.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDiet === diet.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      {/* Showing counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredFoods.length}</strong> of 100+ Indian power foods
        </span>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
          💡 Click any food to expand cooking trick & 1-click log
        </span>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFoods.map((food) => {
          const isExpanded = expandedFoodId === food.id;

          return (
            <motion.div
              layout
              key={food.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3.5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getDietIcon(food.dietType)}
                    {getEnergyBadge(food.energyProfile)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {food.prepTimeMinutes}m
                  </span>
                </div>

                {/* Title & Regional Name */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {food.name}
                  </h3>
                  {food.regionalName && (
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      Desi style: {food.regionalName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Portion: {food.servingUnit}
                  </p>
                </div>

                {/* Macros Bar */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-900">{food.calories}</span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">kcal</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-emerald-700 font-black">
                        {food.protein}g <span className="text-[10px] font-normal text-slate-400">prot</span>
                      </span>
                      <span className="text-amber-700 font-black">
                        {food.fat}g <span className="text-[10px] font-normal text-slate-400">fat</span>
                      </span>
                      <span className="text-sky-700 font-black">
                        {food.carbs}g <span className="text-[10px] font-normal text-slate-400">carbs</span>
                      </span>
                    </div>
                  </div>

                  {/* Relative Macro Distribution Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                    <div 
                      style={{ width: `${Math.round((food.protein * 4 / food.calories) * 100)}%` }} 
                      className="bg-emerald-500 h-full" 
                      title={`Protein: ${food.protein}g`}
                    />
                    <div 
                      style={{ width: `${Math.round((food.fat * 9 / food.calories) * 100)}%` }} 
                      className="bg-amber-400 h-full" 
                      title={`Fat: ${food.fat}g`}
                    />
                    <div 
                      style={{ width: `${Math.round((food.carbs * 4 / food.calories) * 100)}%` }} 
                      className="bg-sky-400 h-full" 
                      title={`Carbs: ${food.carbs}g`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 pt-0.5">
                    <span>Fiber: {food.fiber}g</span>
                    <span className="text-emerald-600 font-bold">
                      {Math.round((food.protein * 4 / food.calories) * 100)}% calories from protein
                    </span>
                  </div>
                </div>

                {/* What makes it low-fat / high-protein vs traditional */}
                <div className="text-xs text-slate-600 bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/80 leading-relaxed">
                  <div className="font-bold text-emerald-900 flex items-center gap-1 mb-1 text-[11px] uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    How It's Re-Engineered
                  </div>
                  <p className="text-slate-700 text-xs">{food.traditionalDiff}</p>
                </div>

                {/* Collapsible Smart Cooking Hack */}
                <button
                  type="button"
                  onClick={() => setExpandedFoodId(isExpanded ? null : food.id)}
                  className="w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center justify-between py-1 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    Secret Desi Cooking Hack
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-amber-950 bg-amber-50 rounded-2xl p-3 border border-amber-200/80 leading-relaxed space-y-1.5"
                  >
                    <p className="font-bold text-[11px] uppercase tracking-wide text-amber-900">
                      💡 The Pro Science Hack:
                    </p>
                    <p className="text-amber-900/90">{food.smartHack}</p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons: 1-Click Log to Diary */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Log To:
                </span>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <button
                    type="button"
                    onClick={() => handleLogFood(food, 'breakfast')}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    title="Log to Breakfast"
                  >
                    B'fast
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogFood(food, 'lunch')}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    title="Log to Lunch"
                  >
                    Lunch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogFood(food, 'dinner')}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    title="Log to Dinner"
                  >
                    Dinner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogFood(food, 'snacks')}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-900 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                    title="Log to Snack"
                  >
                    Snack
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredFoods.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-3xl">🔍</p>
          <h3 className="text-lg font-bold text-slate-800">No matching Indian power foods found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for terms like "poha", "paneer", "rajma", "soya", "dal", or reset your category and diet filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDiet('all');
              setSelectedEnergy('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
