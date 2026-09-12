import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Settings, 
  TrendingDown, 
  Scale, 
  Award,
  Sparkles,
  Zap,
  AlertTriangle,
  ArrowRight,
  Clock,
  RotateCcw
} from 'lucide-react';
import { UserProfile, DayRecord } from '../types';
import { formatDateLabel, computeWeightLostStats, getTodayDateString, shiftDateDays } from '../utils/nutritionCalculations';

interface Props {
  profile: UserProfile;
  currentDate: string;
  dayRecord: DayRecord;
  allDays: Record<string, DayRecord>;
  weightHistory: any[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: (date: string) => void;
  onOpenProfileModal: () => void;
  onOpenWeightModal: () => void;
  onNavigateToRecovery?: () => void;
}

export const CalorieSummaryHeader: React.FC<Props> = ({
  profile,
  currentDate,
  dayRecord,
  allDays,
  weightHistory,
  onPrevDay,
  onNextDay,
  onSelectDate,
  onOpenProfileModal,
  onOpenWeightModal,
  onNavigateToRecovery,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayDateString();
  const isToday = currentDate === todayStr;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  // Compute total calories & macros for this day
  const consumedCalories = dayRecord.items.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = dayRecord.items.reduce((sum, item) => sum + item.protein, 0);
  const consumedCarbs = dayRecord.items.reduce((sum, item) => sum + item.carbs, 0);
  const consumedFat = dayRecord.items.reduce((sum, item) => sum + item.fat, 0);
  const consumedFiber = dayRecord.items.reduce((sum, item) => sum + item.fiber, 0);

  const target = profile.dailyCalorieTarget || 2000;
  const remaining = target - consumedCalories;
  const progressPct = Math.min(100, Math.round((consumedCalories / target) * 100));
  const isOverBudget = remaining < 0;
  const surplusKcal = Math.abs(remaining);

  // Compute weight loss statistics
  const weightStats = computeWeightLostStats(profile, allDays, weightHistory);

  return (
    <div id="calorie-summary-header" className="w-full space-y-4">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Calorie<span className="text-emerald-600">Card</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Health Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Smart nutrition & weight loss process</p>
          </div>
        </div>

        {/* Date Selector & Profile Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto relative" ref={popoverRef}>
          {/* Quick Jump to Today Pill if not currently on today */}
          {!isToday && (
            <button
              id="jump-today-btn"
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-200 shadow-2xs"
              title="Return to Today"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>
          )}

          {/* Date Selector Pill */}
          <div className="flex items-center bg-slate-100/90 hover:bg-slate-100 rounded-2xl p-1 border border-slate-200/80 shadow-2xs transition-all">
            <button
              id="prev-day-btn"
              type="button"
              onClick={onPrevDay}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer hover:shadow-xs"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clickable Middle Date Label */}
            <button
              id="date-display-btn"
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold text-slate-800 hover:text-emerald-700 hover:bg-white/80 rounded-xl transition-all cursor-pointer"
              title="Click to choose a date"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatDateLabel(currentDate)}</span>
            </button>

            <button
              id="next-day-btn"
              type="button"
              onClick={onNextDay}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer hover:shadow-xs"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Date Picker Dropdown Popover */}
          <AnimatePresence>
            {isDatePickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-12 right-0 sm:right-24 z-50 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 w-72 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Select Date
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {currentDate}
                  </span>
                </div>

                {/* Quick Date Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(shiftDateDays(todayStr, -1));
                      setIsDatePickerOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors"
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(todayStr);
                      setIsDatePickerOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(shiftDateDays(todayStr, 1));
                      setIsDatePickerOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors"
                  >
                    Tomorrow
                  </button>
                </div>

                {/* Native Calendar Picker Input */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Choose Specific Date:
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={currentDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        onSelectDate(e.target.value);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="open-profile-btn"
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Profile & Goal</span>
          </button>
        </div>
      </div>

      {/* Excess Calorie Alert Banner if consumed > target */}
      {isOverBudget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-300/80 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Calorie Surplus Detected (+{surplusKcal} kcal)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.2 rounded-full">
                  Don't Panic
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                One high-calorie day is 90% glycogen and water, not 1 kg of fat. Tap to see your effortless 3-day recovery protocol!
              </p>
            </div>
          </div>

          {onNavigateToRecovery && (
            <button
              type="button"
              onClick={onNavigateToRecovery}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>View Recovery Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* Hero Calorie Card & Stats Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Calorie Budget Card (2 cols on lg) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Daily Intake Target
                </span>
                <p className="text-slate-400 text-xs mt-0.5">
                  {profile.name} • Age {profile.age} • {profile.weight}kg • TDEE: {profile.tdee} kcal
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target:</span>
                <span className="text-sm font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">
                  {target.toLocaleString()} kcal
                </span>
              </div>
            </div>

            {/* Central Calorie Metric Numbers */}
            <div className="grid grid-cols-3 gap-4 text-center items-center">
              <div>
                <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {consumedCalories.toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 font-medium">Consumed (kcal)</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  {/* Circular visual progress */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${remaining >= 0 ? 'text-emerald-400' : 'text-rose-500'} transition-all duration-700 ease-out`}
                      strokeDasharray={`${progressPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-black">{progressPct}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Of Daily Goal</span>
              </div>

              <div>
                <div className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {Math.abs(remaining).toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {remaining >= 0 ? 'Remaining (kcal)' : 'Over Budget (kcal)'}
                </span>
              </div>
            </div>

            {/* Macro Breakdown Progress Bars */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Protein</span>
                  <span className="font-bold text-emerald-400">{Math.round(consumedProtein)} / {profile.targetProtein}g</span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((consumedProtein / (profile.targetProtein || 140)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Carbs</span>
                  <span className="font-bold text-teal-300">{Math.round(consumedCarbs)} / {profile.targetCarbs}g</span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((consumedCarbs / (profile.targetCarbs || 220)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Fats</span>
                  <span className="font-bold text-amber-300">{Math.round(consumedFat)} / {profile.targetFat}g</span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((consumedFat / (profile.targetFat || 55)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Lost & Progress Achievement Card */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-md flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-white" />
                Weight Loss Process
              </span>
              <button
                id="log-weight-btn"
                type="button"
                onClick={onOpenWeightModal}
                className="text-xs text-white/90 underline font-medium hover:text-white cursor-pointer"
              >
                Log Scale Weight
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                <span>
                  {weightStats.scaleWeightLost > 0 
                    ? `-${weightStats.scaleWeightLost} kg`
                    : weightStats.estimatedDeficitFatLostKg > 0 
                      ? `-${weightStats.estimatedDeficitFatLostKg} kg`
                      : 'On Target'}
                </span>
                <span className="text-sm font-semibold text-emerald-100">
                  {weightStats.scaleWeightLost > 0 ? 'scale loss' : 'fat deficit loss'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Started at {weightStats.startingWeight} kg • Current scale: {weightStats.currentWeight} kg
              </p>
            </div>

            {/* Deficit Science Card */}
            <div className="mt-5 p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-100">Cumulative Deficit:</span>
                <span className="font-bold text-white">
                  {weightStats.totalDeficitKcal > 0 
                    ? `🔥 -${Math.round(weightStats.totalDeficitKcal).toLocaleString()} kcal`
                    : 'Balanced'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-100">Estimated Fat Burned:</span>
                <span className="font-extrabold text-amber-200">
                  ~{weightStats.estimatedDeficitFatLostKg} kg
                </span>
              </div>
              <div className="text-[10px] text-emerald-100/80 leading-tight pt-1 border-t border-white/10">
                1 kg fat burned per ~7,700 kcal energy deficit created.
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-emerald-100">
            <span>{weightStats.daysLoggedCount} days active tracking</span>
            <div className="flex items-center gap-1 font-bold text-white">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Great consistency!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
