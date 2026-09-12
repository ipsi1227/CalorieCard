import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Plus, 
  Flame, 
  Utensils, 
  Sparkles, 
  Pizza, 
  Check, 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  Layers,
  Calculator,
  RefreshCw,
  Scale,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { FoodDatabaseItem, MealType, LoggedFoodItem } from '../types';
import { FOOD_DATABASE, searchFoodDatabase } from '../data/foodDatabase';
import { 
  calculateCaloriesAccurately, 
  calculateCaloriesFromMacros, 
  CalculationResult 
} from '../utils/calorieCalculator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetMealType: MealType;
  onAddFood: (foodItem: LoggedFoodItem) => void;
}

export const FoodSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetMealType,
  onAddFood,
}) => {
  const [selectedMeal, setSelectedMeal] = useState<MealType>(targetMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dataset' | 'custom'>('dataset');
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedPackagedBrand, setSelectedPackagedBrand] = useState<string>('all');

  // Custom food form states
  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('1 serving');
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [customCalories, setCustomCalories] = useState<number>(120);
  const [customProtein, setCustomProtein] = useState<number>(4);
  const [customCarbs, setCustomCarbs] = useState<number>(20);
  const [customFat, setCustomFat] = useState<number>(2);
  const [customFiber, setCustomFiber] = useState<number>(2);
  const [autoCalculateEnabled, setAutoCalculateEnabled] = useState<boolean>(true);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  // Sync targetMealType when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMeal(targetMealType);
      setSearchQuery('');
      setSelectedFood(null);
      setPortionMultiplier(1);
    }
  }, [isOpen, targetMealType]);

  // Live Auto-Calculation for Custom Food
  useEffect(() => {
    if (!autoCalculateEnabled || !customName.trim()) {
      if (!customName.trim()) {
        setCalculationResult(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      const result = calculateCaloriesAccurately(customName, customServing, customGrams > 0 ? customGrams : undefined);
      setCalculationResult(result);
      setCustomCalories(result.calories);
      setCustomProtein(result.protein);
      setCustomCarbs(result.carbs);
      setCustomFat(result.fat);
      setCustomFiber(result.fiber);
      if (result.servingGrams && (!customGrams || customGrams === 100)) {
        setCustomGrams(result.servingGrams);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [customName, autoCalculateEnabled]);

  // Manual Trigger for Auto-Calculate
  const handleTriggerAutoCalculate = () => {
    if (!customName.trim()) return;
    const result = calculateCaloriesAccurately(customName, customServing, customGrams);
    setCalculationResult(result);
    setCustomCalories(result.calories);
    setCustomProtein(result.protein);
    setCustomCarbs(result.carbs);
    setCustomFat(result.fat);
    setCustomFiber(result.fiber);
    if (result.servingGrams) {
      setCustomGrams(result.servingGrams);
    }
  };

  // Quick weight adjustment for custom food
  const handleQuickGramsSelect = (grams: number) => {
    setCustomGrams(grams);
    const result = calculateCaloriesAccurately(customName || 'custom item', customServing, grams);
    setCalculationResult(result);
    setCustomCalories(result.calories);
    setCustomProtein(result.protein);
    setCustomCarbs(result.carbs);
    setCustomFat(result.fat);
    setCustomFiber(result.fiber);
  };

  // Recalculate Calories strictly from entered Macros using Atwater equation
  const handleRecalculateFromMacros = () => {
    const atwaterCalories = calculateCaloriesFromMacros(customProtein, customCarbs, customFat);
    setCustomCalories(atwaterCalories);
  };

  // Filtered dataset items
  const filteredItems = useMemo(() => {
    let list = searchFoodDatabase(searchQuery);

    if (categoryFilter === 'packaged_foods') {
      list = list.filter(item => 
        Boolean(item.brand) || 
        item.category.toLowerCase().includes('package') || 
        item.category.toLowerCase().includes('biscuit') || 
        item.category.toLowerCase().includes('noodle') || 
        item.category.toLowerCase().includes('frozen') ||
        item.category.toLowerCase().includes('chips') ||
        item.category.toLowerCase().includes('cereal')
      );
      if (selectedPackagedBrand !== 'all') {
        const brandQuery = selectedPackagedBrand.toLowerCase();
        list = list.filter(item => 
          (item.brand && item.brand.toLowerCase().includes(brandQuery)) ||
          item.name.toLowerCase().includes(brandQuery) ||
          item.category.toLowerCase().includes(brandQuery)
        );
      }
    } else if (categoryFilter === 'indian_chains') {
      list = list.filter(item => Boolean(item.restaurant) || item.category.toLowerCase().includes('india') || item.category.toLowerCase().includes('taco') || item.category.toLowerCase().includes('domino'));
      if (selectedRestaurant !== 'all') {
        list = list.filter(item => item.restaurant?.toLowerCase() === selectedRestaurant.toLowerCase());
      }
    } else if (categoryFilter === 'fruits_veggies') {
      list = list.filter(item => 
        item.category.toLowerCase().includes('fruit') || 
        item.category.toLowerCase().includes('veg') ||
        item.category.toLowerCase().includes('salad') ||
        item.name.toLowerCase().includes('apple') ||
        item.name.toLowerCase().includes('banana') ||
        item.name.toLowerCase().includes('orange') ||
        item.name.toLowerCase().includes('spinach') ||
        item.name.toLowerCase().includes('broccoli') ||
        item.name.toLowerCase().includes('carrot') ||
        item.name.toLowerCase().includes('tomato') ||
        item.name.toLowerCase().includes('potato')
      );
    } else if (categoryFilter === 'cheat') {
      list = list.filter(item => item.isCheatMeal || item.mealTags.includes('cheat_meal'));
    } else if (categoryFilter === 'breakfast') {
      list = list.filter(item => item.mealTags.includes('breakfast'));
    } else if (categoryFilter === 'lunch_dinner') {
      list = list.filter(item => item.mealTags.includes('lunch') || item.mealTags.includes('dinner'));
    } else if (categoryFilter === 'high_protein') {
      list = list.filter(item => item.protein >= 10);
    } else if (categoryFilter === 'snacks') {
      list = list.filter(item => item.mealTags.includes('snacks'));
    }

    if (categoryFilter !== 'indian_chains' && selectedRestaurant !== 'all') {
      list = list.filter(item => item.restaurant?.toLowerCase() === selectedRestaurant.toLowerCase());
    }

    return list.slice(0, 50);
  }, [searchQuery, categoryFilter, selectedRestaurant, selectedPackagedBrand]);

  const handleSelectFood = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
    setPortionMultiplier(1);
  };

  const handleConfirmAddSelected = () => {
    if (!selectedFood) return;

    const logged: LoggedFoodItem = {
      id: 'food-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      foodId: selectedFood.id,
      name: selectedFood.name,
      mealType: selectedMeal,
      servingQuantity: portionMultiplier,
      servingUnit: selectedFood.servingSize,
      grams: Math.round(selectedFood.servingGrams * portionMultiplier),
      calories: Math.round(selectedFood.calories * portionMultiplier),
      protein: Number((selectedFood.protein * portionMultiplier).toFixed(1)),
      carbs: Number((selectedFood.carbs * portionMultiplier).toFixed(1)),
      fat: Number((selectedFood.fat * portionMultiplier).toFixed(1)),
      fiber: Number((selectedFood.fiber * portionMultiplier).toFixed(1)),
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCheatMeal: selectedMeal === 'cheat_meal' || selectedFood.isCheatMeal,
      restaurant: selectedFood.restaurant,
      brand: selectedFood.brand,
    };

    onAddFood(logged);
    onClose();
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const logged: LoggedFoodItem = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      foodId: 'custom-entry',
      name: customName.trim(),
      mealType: selectedMeal,
      servingQuantity: 1,
      servingUnit: customServing.trim() || `${customGrams}g`,
      grams: customGrams || 100,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCustom: true,
      isCheatMeal: selectedMeal === 'cheat_meal',
    };

    onAddFood(logged);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="food-search-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="food-search-modal-card"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
                  CalorieCard Food Logger
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Log Food Item</span>
                  {selectedMeal === 'cheat_meal' && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <Pizza className="w-3 h-3" />
                      Cheat Meal
                    </span>
                  )}
                </h2>
              </div>
              <button
                id="close-food-modal-btn"
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Selector Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-x-auto text-xs scrollbar-none">
              {(['breakfast', 'lunch', 'dinner', 'snacks', 'cheat_meal'] as MealType[]).map((meal) => {
                const isSelected = selectedMeal === meal;
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setSelectedMeal(meal)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? meal === 'cheat_meal'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {meal === 'breakfast' && <Coffee className="w-3.5 h-3.5" />}
                    {meal === 'lunch' && <Sun className="w-3.5 h-3.5" />}
                    {meal === 'dinner' && <Moon className="w-3.5 h-3.5" />}
                    {meal === 'snacks' && <Apple className="w-3.5 h-3.5" />}
                    {meal === 'cheat_meal' && <Pizza className="w-3.5 h-3.5" />}
                    <span>{meal === 'cheat_meal' ? 'Cheat Meal' : meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-semibold px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dataset')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dataset'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Full Food Database (800+ Items)</span>
            </button>
            <button
              id="tab-custom-auto-calc"
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Custom Food & Auto-Calculator</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Auto-Calc
              </span>
            </button>
          </div>

          {/* Tab 1: Dataset Search */}
          {activeTab === 'dataset' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5">
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="food-database-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 800+ foods, fruits, veggies, recipes (e.g. apple, palak paneer, chicken)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'packaged_foods', label: '📦 Packaged (Good Day, Maggi, McCain...)' },
                  { id: 'indian_chains', label: '🍔 Fast Food (Taco Bell, Domino\'s, McD)' },
                  { id: 'fruits_veggies', label: '🍎 Fruits & Veggies' },
                  { id: 'breakfast', label: '☕ Breakfast' },
                  { id: 'lunch_dinner', label: '🍲 Lunch & Dinner' },
                  { id: 'cheat', label: '🍕 Cheat Treats' },
                  { id: 'high_protein', label: '⚡ High Protein' },
                  { id: 'snacks', label: '🥨 Snacks & Nuts' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(chip.id);
                      if (chip.id !== 'indian_chains') {
                        setSelectedRestaurant('all');
                      }
                      if (chip.id !== 'packaged_foods') {
                        setSelectedPackagedBrand('all');
                      }
                    }}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                      categoryFilter === chip.id
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Packaged Food Brand Selector Pills */}
              {categoryFilter === 'packaged_foods' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px] bg-slate-50 p-2 rounded-2xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 uppercase text-[10px] pl-1 shrink-0">Brand:</span>
                  {[
                    { id: 'all', label: 'All Packaged' },
                    { id: 'Britannia', label: '🍪 Britannia (Good Day)' },
                    { id: 'Nestlé Maggi', label: '🍜 Nestlé Maggi' },
                    { id: 'McCain', label: '🍟 McCain' },
                    { id: 'Parle', label: '🍪 Parle (Parle-G)' },
                    { id: "Lay's", label: '🥔 Lay\'s Chips' },
                    { id: 'Kurkure', label: '🌶️ Kurkure' },
                    { id: 'Cadbury', label: '🍫 Cadbury (Silk)' },
                    { id: 'Amul', label: '🧈 Amul Butter / Cheese' },
                    { id: 'Oreo', label: '🍪 Oreo' },
                    { id: 'Sunfeast', label: '🍪 Sunfeast Dark Fantasy' },
                    { id: 'Epigamia', label: '🥣 Epigamia Yogurt' },
                    { id: "Kellogg's", label: '🥣 Kellogg\'s & Oats' },
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setSelectedPackagedBrand(brand.id)}
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                        selectedPackagedBrand === brand.id
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Fast Food Chain Brand Selector Pills */}
              {categoryFilter === 'indian_chains' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px] bg-slate-50 p-2 rounded-2xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 uppercase text-[10px] pl-1 shrink-0">Brand:</span>
                  {[
                    { id: 'all', label: 'All Brands' },
                    { id: 'Taco Bell', label: '🌮 Taco Bell' },
                    { id: "Domino's Pizza", label: '🍕 Domino\'s' },
                    { id: "McDonald's", label: '🍟 McDonald\'s' },
                    { id: 'Subway', label: '🥪 Subway' },
                    { id: 'KFC', label: '🍗 KFC' },
                    { id: 'Burger King', label: '👑 Burger King' },
                    { id: "Haldiram's", label: '🍛 Haldiram\'s' },
                    { id: 'Starbucks India', label: '☕ Starbucks' },
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setSelectedRestaurant(brand.id)}
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                        selectedRestaurant === brand.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Results List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[44vh]">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No matching food items found</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Try another keyword or switch to Custom Food to auto-calculate it instantly!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomName(searchQuery);
                        setActiveTab('custom');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Calculate "{searchQuery || 'Custom Food'}"</span>
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedFood?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFood(item)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                            {item.restaurant && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                {item.restaurant}
                              </span>
                            )}
                            {item.brand && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {item.brand}
                              </span>
                            )}
                            {item.isCheatMeal && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Cheat
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.servingSize} ({item.servingGrams}g)</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1 font-medium">
                            <span className="text-emerald-700 font-bold">P: {item.protein}g</span>
                            <span className="text-amber-700 font-bold">C: {item.carbs}g</span>
                            <span className="text-purple-700 font-bold">F: {item.fat}g</span>
                            {item.fiber > 0 && <span className="text-sky-700">Fiber: {item.fiber}g</span>}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div>
                            <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{item.calories}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">kcal</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Portion Multiplier & Add Button */}
              {selectedFood && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800"
                >
                  <div className="text-xs">
                    <div className="font-bold text-white text-sm">{selectedFood.name}</div>
                    <div className="text-slate-400">
                      Total:{' '}
                      <span className="text-emerald-400 font-extrabold text-sm">
                        {Math.round(selectedFood.calories * portionMultiplier)} kcal
                      </span>{' '}
                      • {Math.round(selectedFood.servingGrams * portionMultiplier)}g
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setPortionMultiplier(Math.max(0.25, portionMultiplier - 0.25))}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xs font-bold text-emerald-300">
                        {portionMultiplier}x
                      </span>
                      <button
                        type="button"
                        onClick={() => setPortionMultiplier(portionMultiplier + 0.25)}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      id="confirm-add-food-btn"
                      type="button"
                      onClick={handleConfirmAddSelected}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to {selectedMeal.replace('_', ' ')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Tab 2: Custom Food & Live Auto-Calculator */}
          {activeTab === 'custom' && (
            <form onSubmit={handleAddCustomFood} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Highlight Header */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3">
                <Calculator className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-sm text-emerald-950">
                    Automatic Calorie & Macro Calculator
                  </span>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    Type what you ate (e.g. <span className="font-semibold underline">"2 apples"</span>, <span className="font-semibold underline">"150g grilled chicken"</span>, <span className="font-semibold underline">"1 bowl dal tadka"</span>, or <span className="font-semibold underline">"banana with peanut butter"</span>). CalorieCard automatically calculates exact calories, protein, carbs, fat, and fiber!
                  </p>
                </div>
              </div>

              {/* Food Input with Auto-calc badge */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Food Name or Meal Description
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCalculateEnabled}
                      onChange={(e) => setAutoCalculateEnabled(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span>Live Auto-Calculate</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="custom-food-name-input"
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. 2 apples, 200g paneer tikka, 1 slice pizza, bowl of oatmeal..."
                    required
                    className="w-full pl-3.5 pr-28 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerAutoCalculate}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-400" />
                    <span>Calculate</span>
                  </button>
                </div>
              </div>

              {/* Live Calculation Results Card */}
              {calculationResult && customName.trim() && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        calculationResult.confidence === 'exact'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : calculationResult.confidence === 'high'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {calculationResult.confidence === 'exact' ? '✓ Exact Database Match' : calculationResult.confidence === 'high' ? '✓ High-Accuracy Match' : '⚡ Smart Density Estimate'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {customGrams}g Portion
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-lg">
                      <Flame className="w-4 h-4 fill-emerald-400" />
                      <span>{customCalories} kcal</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {calculationResult.explanation}
                  </p>

                  {/* Macro breakdown badges */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="bg-slate-800/80 p-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Protein</span>
                      <span className="text-xs font-black text-emerald-400">{customProtein}g</span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
                      <span className="text-xs font-black text-amber-400">{customCarbs}g</span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Fat</span>
                      <span className="text-xs font-black text-purple-400">{customFat}g</span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Fiber</span>
                      <span className="text-xs font-black text-sky-400">{customFiber}g</span>
                    </div>
                  </div>

                  {/* Quick portion chips */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none text-[11px]">
                    <span className="text-slate-400 text-[10px] font-semibold uppercase mr-1">Quick Portions:</span>
                    {[50, 100, 150, 200, 250, 350].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleQuickGramsSelect(g)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                          customGrams === g
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {g}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Serving Details & Grams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    placeholder="e.g. 1 medium apple, 1 bowl, 2 pieces"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                    <span>Weight / Grams</span>
                    <span className="text-[11px] text-slate-400 font-normal">Accurate scaling</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={2500}
                      value={customGrams}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomGrams(val);
                        if (autoCalculateEnabled && customName.trim()) {
                          const res = calculateCaloriesAccurately(customName, customServing, val);
                          setCalculationResult(res);
                          setCustomCalories(res.calories);
                          setCustomProtein(res.protein);
                          setCustomCarbs(res.carbs);
                          setCustomFat(res.fat);
                          setCustomFiber(res.fiber);
                        }
                      }}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">g</span>
                  </div>
                </div>
              </div>

              {/* Editable Nutrient Inputs with Atwater formula check */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Calculated Macronutrients & Energy:</span>
                  <button
                    type="button"
                    onClick={handleRecalculateFromMacros}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                  >
                    Sync Calories to 4P + 4C + 9F
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Calories (kcal)
                    </label>
                    <input
                      id="custom-food-calories-input"
                      type="number"
                      min={0}
                      max={5000}
                      value={customCalories}
                      onChange={(e) => setCustomCalories(Number(e.target.value))}
                      required
                      className="w-full px-2.5 py-2 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/30 text-sm font-black text-emerald-900 focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFat}
                      onChange={(e) => setCustomFat(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Fiber (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFiber}
                      onChange={(e) => setCustomFiber(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-custom-food-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log {customName || 'Custom Food'} ({customCalories} kcal)</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
