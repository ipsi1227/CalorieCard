import { UserProfile, Gender, ActivityLevel, FitnessGoal, LoggedFoodItem, DayRecord, WeightRecord } from '../types';

export function calculateBMR(age: number, heightCm: number, weightKg: number, gender: Gender): number {
  if (!age || !heightCm || !weightKg) return 1600;
  
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  } else {
    // Average
    return Math.round(base - 78);
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function calculateCalorieTarget(tdee: number, goal: FitnessGoal, gender: Gender): number {
  let target = tdee;
  if (goal === 'lose_weight') {
    // Standard sustainable 500 kcal deficit = ~0.45-0.5 kg (1 lb) per week
    target = tdee - 500;
  } else if (goal === 'gain_muscle') {
    target = tdee + 350;
  }

  // Safety floors
  const minCalories = gender === 'female' ? 1200 : 1500;
  return Math.max(Math.round(target), minCalories);
}

export function calculateMacros(dailyCalories: number, goal: FitnessGoal): { protein: number; carbs: number; fat: number } {
  // Protein: 25% to 30% for satiety and lean mass
  // Fat: 25%
  // Carbs: remaining 45-50%
  const proteinPct = goal === 'lose_weight' ? 0.30 : 0.25;
  const fatPct = 0.25;
  const carbsPct = 1 - proteinPct - fatPct;

  return {
    protein: Math.round((dailyCalories * proteinPct) / 4),
    carbs: Math.round((dailyCalories * carbsPct) / 4),
    fat: Math.round((dailyCalories * fatPct) / 9),
  };
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Health Explorer',
  age: 26,
  height: 172,
  weight: 72,
  startingWeight: 75,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'lose_weight',
  unit: 'metric',
  bmr: 1680,
  tdee: 2604,
  dailyCalorieTarget: 2100,
  targetProtein: 158,
  targetCarbs: 236,
  targetFat: 58,
  isConfigured: false,
};

export function formatLocalDateToYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayDateString(): string {
  return formatLocalDateToYMD(new Date());
}

export function shiftDateDays(dateStr: string, deltaDays: number): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // Noon prevents timezone DST shifts
    date.setDate(date.getDate() + deltaDays);
    return formatLocalDateToYMD(date);
  } catch {
    return dateStr;
  }
}

export function formatDateLabel(dateStr: string): string {
  try {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return 'Today';
    
    const yesterdayStr = shiftDateDays(todayStr, -1);
    if (dateStr === yesterdayStr) return 'Yesterday';

    const tomorrowStr = shiftDateDays(todayStr, 1);
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// 7,700 kcal deficit ≈ 1 kg of fat lost
export const KCAL_PER_KG_FAT = 7700;

export function computeWeightLostStats(
  profile: UserProfile,
  daysRecord: Record<string, DayRecord>,
  weightHistory: WeightRecord[]
): {
  startingWeight: number;
  currentWeight: number;
  scaleWeightLost: number;
  estimatedDeficitFatLostKg: number;
  totalDeficitKcal: number;
  daysLoggedCount: number;
} {
  const startingWeight = profile.startingWeight || profile.weight;
  
  // Latest logged weight
  let currentWeight = profile.weight;
  if (weightHistory.length > 0) {
    const sorted = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));
    currentWeight = sorted[0].weightKg;
  }
  const scaleWeightLost = Math.max(0, Number((startingWeight - currentWeight).toFixed(2)));

  // Calculate cumulative deficit over logged days
  let totalDeficitKcal = 0;
  let daysLoggedCount = 0;

  Object.values(daysRecord).forEach(day => {
    if (day.items.length > 0) {
      daysLoggedCount++;
      const dayCalories = day.items.reduce((sum, item) => sum + item.calories, 0);
      const dayDeficit = (profile.tdee || 2400) - dayCalories;
      // If dayDeficit > 0, burned calories in deficit
      totalDeficitKcal += dayDeficit;
    }
  });

  const estimatedDeficitFatLostKg = Number((totalDeficitKcal / KCAL_PER_KG_FAT).toFixed(2));

  return {
    startingWeight,
    currentWeight,
    scaleWeightLost,
    estimatedDeficitFatLostKg: Math.max(0, estimatedDeficitFatLostKg),
    totalDeficitKcal,
    daysLoggedCount,
  };
}

// Initialize clean user data strictly starting from the user's start day (no fabricated past days)
export function getCleanInitialData(profile: UserProfile): {
  days: Record<string, DayRecord>;
  weights: WeightRecord[];
} {
  const startDate = profile.startDate || getTodayDateString();
  const startWeight = profile.startingWeight || profile.weight || 72;

  const days: Record<string, DayRecord> = {
    [startDate]: {
      date: startDate,
      items: [],
      waterMl: 0,
    }
  };

  const weights: WeightRecord[] = [
    {
      id: 'wt-start',
      date: startDate,
      weightKg: startWeight,
      note: 'Starting baseline weigh-in',
    }
  ];

  return { days, weights };
}

// Clean any legacy fabricated seed data from localStorage
export function cleanLegacySeedData(
  rawDays: Record<string, DayRecord> | null,
  rawWeights: WeightRecord[] | null,
  profile: UserProfile
): {
  days: Record<string, DayRecord>;
  weights: WeightRecord[];
} {
  const startDate = profile.startDate || getTodayDateString();
  const cleanDays: Record<string, DayRecord> = {};

  if (rawDays) {
    Object.entries(rawDays).forEach(([dateStr, record]) => {
      // Filter out fabricated seed items
      const realItems = record.items.filter(item => !item.id.startsWith('seed-'));
      // Only keep days on or after user start date
      if (dateStr >= startDate || realItems.length > 0) {
        cleanDays[dateStr] = {
          ...record,
          items: realItems,
        };
      }
    });
  }

  // Ensure current day exists
  const todayStr = getTodayDateString();
  if (!cleanDays[todayStr]) {
    cleanDays[todayStr] = {
      date: todayStr,
      items: [],
      waterMl: 0,
    };
  }

  let cleanWeights: WeightRecord[] = [];
  if (rawWeights && rawWeights.length > 0) {
    // Filter out fake wt-6, wt-5, etc.
    cleanWeights = rawWeights.filter(w => !w.id.startsWith('wt-') || w.id === 'wt-start' || w.id === 'wt-today');
  }

  if (cleanWeights.length === 0) {
    cleanWeights = [
      {
        id: 'wt-start',
        date: startDate,
        weightKg: profile.startingWeight || profile.weight || 72,
        note: 'Starting baseline weigh-in',
      }
    ];
  }

  return { days: cleanDays, weights: cleanWeights };
}

// Kept for backward compatibility
export function generateSeedData(profile: UserProfile) {
  return getCleanInitialData(profile);
}
