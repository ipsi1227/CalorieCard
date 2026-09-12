import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Flame, 
  Target, 
  Sparkles, 
  Activity, 
  Check, 
  X, 
  ArrowRight,
  TrendingDown,
  Scale
} from 'lucide-react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal } from '../types';
import { calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacros } from '../utils/nutritionCalculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose, profile, onSaveProfile }) => {
  const [name, setName] = useState(profile.name || 'Friend');
  const [age, setAge] = useState<number>(profile.age || 26);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>(profile.unit || 'metric');
  
  // Height & Weight stored in metric (cm & kg)
  const [heightCm, setHeightCm] = useState<number>(profile.height || 172);
  const [weightKg, setWeightKg] = useState<number>(profile.weight || 72);
  const [startingWeightKg, setStartingWeightKg] = useState<number>(profile.startingWeight || profile.weight || 75);

  // Imperial helper states
  const [feet, setFeet] = useState<number>(Math.floor((profile.height || 172) / 30.48));
  const [inches, setInches] = useState<number>(Math.round(((profile.height || 172) % 30.48) / 2.54));
  const [weightLbs, setWeightLbs] = useState<number>(Math.round((profile.weight || 72) * 2.20462));

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'lose_weight');

  // Synchronize when opening
  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Friend');
      setAge(profile.age || 26);
      setGender(profile.gender || 'male');
      setHeightCm(profile.height || 172);
      setWeightKg(profile.weight || 72);
      setStartingWeightKg(profile.startingWeight || profile.weight || 75);
      setActivityLevel(profile.activityLevel || 'moderate');
      setGoal(profile.goal || 'lose_weight');
      setUnit(profile.unit || 'metric');

      setFeet(Math.floor((profile.height || 172) / 30.48));
      setInches(Math.round(((profile.height || 172) % 30.48) / 2.54));
      setWeightLbs(Math.round((profile.weight || 72) * 2.20462));
    }
  }, [isOpen, profile]);

  // Handle imperial to metric conversions
  const handleFeetInchesChange = (newFeet: number, newInches: number) => {
    setFeet(newFeet);
    setInches(newInches);
    const cm = Math.round(newFeet * 30.48 + newInches * 2.54);
    setHeightCm(cm);
  };

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Number((lbs / 2.20462).toFixed(1));
    setWeightKg(kg);
    if (!profile.isConfigured) {
      setStartingWeightKg(kg);
    }
  };

  // Live Calculations
  const calculatedBmr = calculateBMR(age, heightCm, weightKg, gender);
  const calculatedTdee = calculateTDEE(calculatedBmr, activityLevel);
  const calculatedTarget = calculateCalorieTarget(calculatedTdee, goal, gender);
  const calculatedMacros = calculateMacros(calculatedTarget, goal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      name: name.trim() || 'Friend',
      age: Math.max(12, Math.min(100, Number(age))),
      height: Math.max(100, Math.min(250, Number(heightCm))),
      weight: Math.max(30, Math.min(300, Number(weightKg))),
      startingWeight: Math.max(30, Math.min(300, Number(startingWeightKg))),
      gender,
      activityLevel,
      goal,
      unit,
      bmr: calculatedBmr,
      tdee: calculatedTdee,
      dailyCalorieTarget: calculatedTarget,
      targetProtein: calculatedMacros.protein,
      targetCarbs: calculatedMacros.carbs,
      targetFat: calculatedMacros.fat,
      startDate: profile.startDate || new Date().toISOString().split('T')[0],
      isConfigured: true,
    };
    onSaveProfile(updatedProfile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="user-profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="user-profile-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 pt-7 pb-6 text-white relative">
            {profile.isConfigured && (
              <button
                id="close-profile-modal-btn"
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Flame className="w-6 h-6 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {profile.isConfigured ? 'Update Your Nutrition Profile' : 'Welcome to CalorieCard!'}
                </h2>
                <p className="text-emerald-100 text-sm">
                  Tell us about yourself so we can calculate your exact daily calorie needs
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Biological Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        gender === g
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Age, Height, Weight with Unit Toggle */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" /> Body Metrics
                </span>
                
                {/* Metric / Imperial toggle */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setUnit('metric')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      unit === 'metric' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Metric (kg / cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('imperial')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      unit === 'imperial' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Imperial (lbs / ft)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Age (Years)
                  </label>
                  <input
                    id="profile-age-input"
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used for metabolic rate (BMR)</p>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Height {unit === 'metric' ? '(cm)' : '(ft & in)'}
                  </label>
                  {unit === 'metric' ? (
                    <input
                      id="profile-height-cm"
                      type="number"
                      min={100}
                      max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={3}
                          max={8}
                          value={feet}
                          onChange={(e) => handleFeetInchesChange(Number(e.target.value), inches)}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-normal">ft</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={0}
                          max={11}
                          value={inches}
                          onChange={(e) => handleFeetInchesChange(feet, Number(e.target.value))}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-normal">in</span>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {unit === 'metric' ? `${(heightCm / 30.48).toFixed(1)} ft` : `${heightCm} cm`}
                  </p>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Current Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
                  </label>
                  {unit === 'metric' ? (
                    <input
                      id="profile-weight-kg"
                      type="number"
                      step="0.1"
                      min={30}
                      max={250}
                      value={weightKg}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWeightKg(val);
                        if (!profile.isConfigured) setStartingWeightKg(val);
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.5"
                      min={60}
                      max={550}
                      value={weightLbs}
                      onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {unit === 'metric' ? `${(weightKg * 2.20462).toFixed(1)} lbs` : `${weightKg} kg`}
                  </p>
                </div>
              </div>

              {/* Starting weight baseline (for tracking total weight lost) */}
              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
                <span className="text-slate-500">Starting baseline weight for progress tracking:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    id="profile-starting-weight-kg"
                    type="number"
                    step="0.1"
                    value={startingWeightKg}
                    onChange={(e) => setStartingWeightKg(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold text-right"
                  />
                  <span className="text-slate-500 font-medium">kg</span>
                </div>
              </div>
            </div>

            {/* Activity Level & Goal Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Daily Physical Activity Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
                    { id: 'light', label: 'Light', desc: '1-3 workouts / week' },
                    { id: 'moderate', label: 'Moderate', desc: '3-5 workouts / week' },
                    { id: 'active', label: 'Very Active', desc: 'Heavy sports / labor' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivityLevel(act.id as ActivityLevel)}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        activityLevel === act.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-800">{act.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Primary Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, note: '-500 kcal deficit' },
                    { id: 'maintain', label: 'Maintain Weight', icon: Target, note: 'TDEE baseline' },
                    { id: 'gain_muscle', label: 'Gain Muscle', icon: Sparkles, note: '+350 kcal surplus' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoal(item.id as FitnessGoal)}
                        className={`p-3 text-center rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          goal === item.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold leading-tight">{item.label}</span>
                        <span className={`text-[10px] ${goal === item.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {item.note}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE CALORIE & NUTRITION RECOMMENDATION CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Your Personalized Calorie Prescription
                    </span>
                    <p className="text-[11px] text-slate-500">Mifflin-St Jeor metabolic model calculation</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">BMR (Basal)</span>
                  <div className="text-sm sm:text-base font-bold text-slate-700">{calculatedBmr}</div>
                  <span className="text-[10px] text-slate-400">kcal at rest</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">TDEE (Burned)</span>
                  <div className="text-sm sm:text-base font-bold text-slate-700">{calculatedTdee}</div>
                  <span className="text-[10px] text-slate-400">kcal daily burn</span>
                </div>
                <div className="bg-emerald-600 p-2.5 rounded-xl border border-emerald-500 shadow-sm text-white">
                  <span className="text-[10px] uppercase font-bold text-emerald-200">Daily Target</span>
                  <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{calculatedTarget}</div>
                  <span className="text-[10px] text-emerald-100 font-medium">kcal to eat</span>
                </div>
              </div>

              {/* Macro breakdown pills */}
              <div className="flex items-center justify-around bg-white/70 py-2 px-3 rounded-xl border border-slate-200/50 text-xs">
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] font-medium">Protein: </span>
                  <span className="font-bold text-emerald-700">{calculatedMacros.protein}g</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] font-medium">Carbs: </span>
                  <span className="font-bold text-teal-700">{calculatedMacros.carbs}g</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] font-medium">Healthy Fats: </span>
                  <span className="font-bold text-amber-700">{calculatedMacros.fat}g</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {profile.isConfigured && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                id="save-profile-btn"
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>{profile.isConfigured ? 'Save Changes' : 'Start My CalorieCard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
