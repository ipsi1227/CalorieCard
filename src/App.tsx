import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Plus, 
  Sparkles, 
  Scale, 
  Calendar, 
  Settings, 
  CheckCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ShieldAlert,
  BarChart3,
  Utensils,
  Zap,
  FlaskConical
} from 'lucide-react';
import { UserProfile, DayRecord, LoggedFoodItem, MealType, WeightRecord } from './types';
import { 
  DEFAULT_USER_PROFILE, 
  getTodayDateString, 
  shiftDateDays,
  getCleanInitialData,
  cleanLegacySeedData,
  generateSeedData,
  computeWeightLostStats 
} from './utils/nutritionCalculations';
import { UserProfileModal } from './components/UserProfileModal';
import { CalorieSummaryHeader } from './components/CalorieSummaryHeader';
import { MealSectionCard } from './components/MealSectionCard';
import { FoodSearchModal } from './components/FoodSearchModal';
import { SmartSuggestions } from './components/SmartSuggestions';
import { WeeklyCharts } from './components/WeeklyCharts';
import { WeightTrackerModal } from './components/WeightTrackerModal';
import { PersonalizedInsights } from './components/PersonalizedInsights';
import { HealthyRecipesView } from './components/HealthyRecipesView';
import { ExcessCalorieRecovery } from './components/ExcessCalorieRecovery';
import { IndianDailyFoodsView } from './components/IndianDailyFoodsView';
import { YuckToYumView } from './components/YuckToYumView';

const STORAGE_KEY_PROFILE = 'caloriecard_profile_v1';
const STORAGE_KEY_DAYS = 'caloriecard_days_v1';
const STORAGE_KEY_WEIGHTS = 'caloriecard_weights_v1';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.startDate) {
          parsed.startDate = getTodayDateString();
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      ...DEFAULT_USER_PROFILE,
      startDate: getTodayDateString(),
    };
  });

  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'tracker' | 'indian_100' | 'yuck_to_yum' | 'recipes' | 'recovery' | 'analytics'>('tracker');

  const [allDays, setAllDays] = useState<Record<string, DayRecord>>(() => {
    let raw: Record<string, DayRecord> | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAYS);
      if (saved) raw = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialProfile = {
      ...DEFAULT_USER_PROFILE,
      startDate: getTodayDateString(),
    };
    return cleanLegacySeedData(raw, null, initialProfile).days;
  });

  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>(() => {
    let raw: WeightRecord[] | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEIGHTS);
      if (saved) raw = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialProfile = {
      ...DEFAULT_USER_PROFILE,
      startDate: getTodayDateString(),
    };
    return cleanLegacySeedData(null, raw, initialProfile).weights;
  });

  // Modal controls
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(!profile.isConfigured);
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState<boolean>(false);
  const [activeMealForAdd, setActiveMealForAdd] = useState<MealType>('breakfast');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(allDays));
    } catch (e) {
      console.error(e);
    }
  }, [allDays]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WEIGHTS, JSON.stringify(weightHistory));
    } catch (e) {
      console.error(e);
    }
  }, [weightHistory]);

  // Current day record
  const currentDayRecord: DayRecord = allDays[currentDate] || {
    date: currentDate,
    items: [],
  };

  // Safe timezone-immune Date Navigation
  const handlePrevDay = () => {
    setCurrentDate(prev => shiftDateDays(prev, -1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => shiftDateDays(prev, 1));
  };

  const handleSelectDate = (date: string) => {
    setCurrentDate(date);
  };

  // Open Add Food Modal for a specific meal
  const handleOpenAddFood = (mealType: MealType) => {
    setActiveMealForAdd(mealType);
    setIsFoodSearchOpen(true);
  };

  // Add food item
  const handleAddFoodItem = (item: LoggedFoodItem) => {
    setAllDays(prev => {
      const existing = prev[currentDate] || { date: currentDate, items: [] };
      const updatedItems = [...existing.items, item];
      
      // Calculate new total calories
      const totalCal = updatedItems.reduce((acc, i) => acc + i.calories, 0);
      const target = profile.dailyCalorieTarget || 2000;

      // Delightful celebration if nicely in target range
      if (totalCal >= target * 0.9 && totalCal <= target * 1.05) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#14b8a6', '#f59e0b'],
          });
        } catch {}
      }

      return {
        ...prev,
        [currentDate]: {
          ...existing,
          items: updatedItems,
        },
      };
    });
  };

  // Remove food item
  const handleRemoveFoodItem = (itemId: string) => {
    setAllDays(prev => {
      const existing = prev[currentDate];
      if (!existing) return prev;
      return {
        ...prev,
        [currentDate]: {
          ...existing,
          items: existing.items.filter(item => item.id !== itemId),
        },
      };
    });
  };

  // Add / Delete Weight
  const handleAddWeightRecord = (rec: WeightRecord) => {
    setWeightHistory(prev => {
      const filtered = prev.filter(w => w.date !== rec.date);
      return [rec, ...filtered];
    });
    // Update profile current weight
    setProfile(prev => ({
      ...prev,
      weight: rec.weightKg,
    }));
  };

  const handleDeleteWeightRecord = (recordId: string) => {
    setWeightHistory(prev => prev.filter(w => w.id !== recordId));
  };

  // Save profile from modal
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399'],
      });
    } catch {}
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset logs and reload demo sample data?')) {
      const seeded = generateSeedData(profile);
      setAllDays(seeded.days);
      setWeightHistory(seeded.weights);
    }
  };

  const dayTotalCalories = currentDayRecord.items.reduce((s, i) => s + i.calories, 0);
  const targetCalories = profile.dailyCalorieTarget || 2000;
  const remainingCalories = targetCalories - dayTotalCalories;
  const isSurplusToday = remainingCalories < 0;
  const surplusKcal = Math.abs(remainingCalories);

  return (
    <div id="caloriecard-app" className="min-h-screen bg-slate-100/70 text-slate-800 pb-20 selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Top ambient banner decoration */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 space-y-6">
        {/* Calorie & Weight Header with Interactive Date Picker */}
        <CalorieSummaryHeader
          profile={profile}
          currentDate={currentDate}
          dayRecord={currentDayRecord}
          allDays={allDays}
          weightHistory={weightHistory}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onSelectDate={handleSelectDate}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          onNavigateToRecovery={() => setActiveTab('recovery')}
        />

        {/* Primary View Tab Bar */}
        <div className="bg-white p-2 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 flex-1 min-w-max">
            <button
              id="tab-tracker-btn"
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Diary & Tracker</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'tracker' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {currentDayRecord.items.length}
              </span>
            </button>

            <button
              id="tab-indian-100-btn"
              type="button"
              onClick={() => setActiveTab('indian_100')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'indian_100'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>100+ Indian Staples</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900">
                ⚡ High Energy • Low Fat
              </span>
            </button>

            <button
              id="tab-yuck-to-yum-btn"
              type="button"
              onClick={() => setActiveTab('yuck_to_yum')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'yuck_to_yum'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Yuck ➔ Yum Lab</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900">
                Hate to Love 😋
              </span>
            </button>

            <button
              id="tab-recipes-btn"
              type="button"
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Super Healthy Recipes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                10+ Recipes
              </span>
            </button>

            <button
              id="tab-recovery-btn"
              type="button"
              onClick={() => setActiveTab('recovery')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'recovery'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : isSurplusToday
                    ? 'text-amber-900 bg-amber-100/70 hover:bg-amber-100 border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${isSurplusToday ? 'text-amber-600' : ''}`} />
              <span>Excess Calorie Coach</span>
              {isSurplusToday && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                  +{surplusKcal} kcal
                </span>
              )}
            </button>

            <button
              id="tab-analytics-btn"
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progress & Charts</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 pr-2">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset sample data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Food Diary & Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* Quick Log Floating/Prominent Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Today's Meal Sections</span>
                <span className="text-slate-400 font-normal hidden sm:inline">
                  (Breakfast, Lunch, Dinner, Snacks & Cheat Meal)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="header-quick-add-food"
                  type="button"
                  onClick={() => handleOpenAddFood('breakfast')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Any Food</span>
                </button>

                <button
                  id="header-indian-shortcut"
                  type="button"
                  onClick={() => setActiveTab('indian_100')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>100+ Indian Foods</span>
                </button>

                <button
                  id="header-yuck-to-yum-shortcut"
                  type="button"
                  onClick={() => setActiveTab('yuck_to_yum')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-all cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                  <span>Yuck ➔ Yum</span>
                </button>

                <button
                  id="header-recipes-shortcut"
                  type="button"
                  onClick={() => setActiveTab('recipes')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer hidden sm:flex"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  <span>Recipes</span>
                </button>

                <button
                  id="header-log-weight"
                  type="button"
                  onClick={() => setIsWeightModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-slate-500" />
                  <span>Weigh-in</span>
                </button>
              </div>
            </div>

            {/* The 5 Explicit Meal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <MealSectionCard
                mealType="breakfast"
                items={currentDayRecord.items.filter(item => item.mealType === 'breakfast')}
                dailyTarget={profile.dailyCalorieTarget || 2000}
                onOpenAddModal={handleOpenAddFood}
                onRemoveItem={handleRemoveFoodItem}
              />

              <MealSectionCard
                mealType="lunch"
                items={currentDayRecord.items.filter(item => item.mealType === 'lunch')}
                dailyTarget={profile.dailyCalorieTarget || 2000}
                onOpenAddModal={handleOpenAddFood}
                onRemoveItem={handleRemoveFoodItem}
              />

              <MealSectionCard
                mealType="dinner"
                items={currentDayRecord.items.filter(item => item.mealType === 'dinner')}
                dailyTarget={profile.dailyCalorieTarget || 2000}
                onOpenAddModal={handleOpenAddFood}
                onRemoveItem={handleRemoveFoodItem}
              />

              <MealSectionCard
                mealType="snacks"
                items={currentDayRecord.items.filter(item => item.mealType === 'snacks')}
                dailyTarget={profile.dailyCalorieTarget || 2000}
                onOpenAddModal={handleOpenAddFood}
                onRemoveItem={handleRemoveFoodItem}
              />

              <MealSectionCard
                mealType="cheat_meal"
                items={currentDayRecord.items.filter(item => item.mealType === 'cheat_meal')}
                dailyTarget={profile.dailyCalorieTarget || 2000}
                onOpenAddModal={handleOpenAddFood}
                onRemoveItem={handleRemoveFoodItem}
              />

              {/* Quick Balance Summary Tile */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Daily Intake Snapshot
                  </span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-400">Total Food Logged:</span>
                      <span className="font-bold text-white">{currentDayRecord.items.length} items</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-400">Calories Consumed:</span>
                      <span className="font-extrabold text-emerald-300">{dayTotalCalories} kcal</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-400">Daily Target:</span>
                      <span className="font-bold text-slate-300">{profile.dailyCalorieTarget} kcal</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-slate-400">Remaining Deficit Buffer:</span>
                      <span className={`font-black ${remainingCalories >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `+${Math.abs(remainingCalories)} kcal over`}
                      </span>
                    </div>
                  </div>
                </div>

                {isSurplusToday && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('recovery')}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Open Surplus Recovery Plan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Smart Recommendations Section */}
            <SmartSuggestions
              remainingCalories={remainingCalories}
              consumedCalories={dayTotalCalories}
              targetCalories={profile.dailyCalorieTarget || 2000}
              onAddFood={handleAddFoodItem}
            />

            {/* Personalized Health Insights */}
            <PersonalizedInsights
              profile={profile}
              dayRecord={currentDayRecord}
              allDays={allDays}
            />
          </div>
        )}

        {/* Tab 2: 100+ Indian Daily Foods (High Energy, Low Fat, High Protein) */}
        {activeTab === 'indian_100' && (
          <IndianDailyFoodsView
            onLogFoodToDiary={(loggedItem) => {
              handleAddFoodItem(loggedItem);
            }}
            onNavigateToDiary={() => setActiveTab('tracker')}
          />
        )}

        {/* Tab 3: Yuck to Yum Food Science Kitchen */}
        {activeTab === 'yuck_to_yum' && (
          <YuckToYumView
            onLogFoodToDiary={(loggedItem) => {
              handleAddFoodItem(loggedItem);
            }}
            onNavigateToDiary={() => setActiveTab('tracker')}
          />
        )}

        {/* Tab 4: Super Healthy Recipes */}
        {activeTab === 'recipes' && (
          <HealthyRecipesView
            onLogRecipeToDiary={(loggedItem) => {
              handleAddFoodItem(loggedItem);
            }}
            onNavigateToDiary={() => setActiveTab('tracker')}
          />
        )}

        {/* Tab 3: Excess Calorie Recovery */}
        {activeTab === 'recovery' && (
          <ExcessCalorieRecovery
            profile={profile}
            dayRecord={currentDayRecord}
            onNavigateToDiary={() => setActiveTab('tracker')}
          />
        )}

        {/* Tab 4: Weekly & Weight Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <WeeklyCharts
              profile={profile}
              allDays={allDays}
              selectedDate={currentDate}
              onSelectDate={(date) => {
                setCurrentDate(date);
                setActiveTab('tracker');
              }}
            />

            <PersonalizedInsights
              profile={profile}
              dayRecord={currentDayRecord}
              allDays={allDays}
            />
          </div>
        )}
      </main>

      {/* User Profile Onboarding / Config Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Food Search / Add Modal */}
      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        targetMealType={activeMealForAdd}
        onAddFood={handleAddFoodItem}
      />

      {/* Weight Loss Tracker Modal */}
      <WeightTrackerModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        profile={profile}
        weightHistory={weightHistory}
        onAddWeightRecord={handleAddWeightRecord}
        onDeleteWeightRecord={handleDeleteWeightRecord}
      />
    </div>
  );
}
