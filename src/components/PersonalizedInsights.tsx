import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Pizza, 
  Award,
  AlertTriangle,
  Smile,
  HelpCircle,
  X,
  Scale,
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, DayRecord } from '../types';

interface Props {
  profile: UserProfile;
  dayRecord: DayRecord;
  allDays: Record<string, DayRecord>;
}

export const PersonalizedInsights: React.FC<Props> = ({
  profile,
  dayRecord,
  allDays,
}) => {
  const [showScienceModal, setShowScienceModal] = useState<boolean>(false);

  const consumedCalories = dayRecord.items.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = dayRecord.items.reduce((sum, item) => sum + item.protein, 0);
  const consumedCarbs = dayRecord.items.reduce((sum, item) => sum + item.carbs, 0);
  const consumedFat = dayRecord.items.reduce((sum, item) => sum + item.fat, 0);
  const consumedFiber = dayRecord.items.reduce((sum, item) => sum + item.fiber, 0);

  const target = profile.dailyCalorieTarget || 2000;
  const tdee = profile.tdee || 2500;
  const deficit = tdee - consumedCalories;
  const projectedDeficitGrams = Math.round((Math.max(0, deficit) / 7700) * 1000);

  const hasCheatMeal = dayRecord.items.some(item => item.mealType === 'cheat_meal');

  // Compute dynamic insights
  const insights = React.useMemo(() => {
    const list = [];

    // 1. Calorie Deficit & Weight Loss Insight
    if (consumedCalories === 0) {
      list.push({
        id: 'start',
        type: 'neutral',
        icon: Zap,
        title: 'Ready to Start Today',
        desc: `Your target is ${target} kcal today. Logging meals as you eat them improves accuracy by over 40%!`,
        color: 'border-slate-200 bg-slate-50 text-slate-700',
        badge: 'Tip',
        hasScienceModal: false,
      });
    } else if (consumedCalories <= target) {
      list.push({
        id: 'deficit-active',
        type: 'success',
        icon: TrendingDown,
        title: 'Optimal Fat Loss Zone',
        desc: `You are in a ${deficit > 0 ? `${deficit} kcal daily deficit` : 'balanced intake'}. This equates to approx ~${Math.max(0, projectedDeficitGrams)}g of real fat burned through today's metabolic process!`,
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        badge: 'Fat Loss Active',
        hasScienceModal: true,
      });
    } else if (consumedCalories <= tdee) {
      list.push({
        id: 'buffer',
        type: 'warning',
        icon: ShieldCheck,
        title: 'Maintenance Buffer Protected',
        desc: `You consumed ${consumedCalories} kcal, which is slightly above your target (${target} kcal) but still under your maintenance burn (${tdee} kcal). You will NOT gain fat today!`,
        color: 'border-teal-200 bg-teal-50 text-teal-800',
        badge: 'Safe Buffer',
        hasScienceModal: false,
      });
    } else {
      list.push({
        id: 'surplus',
        type: 'alert',
        icon: AlertTriangle,
        title: 'Calorie Surplus Day',
        desc: `You are +${consumedCalories - tdee} kcal over maintenance today. Don't stress or crash diet tomorrow—consistency across 7 days is what drives long-term transformation.`,
        color: 'border-amber-200 bg-amber-50 text-amber-800',
        badge: 'Weekly Focus',
        hasScienceModal: false,
      });
    }

    // 2. Protein & Satiety Insight
    const proteinTarget = profile.targetProtein || 140;
    if (consumedProtein >= proteinTarget * 0.75) {
      list.push({
        id: 'protein-good',
        type: 'success',
        icon: Award,
        title: 'Superb Protein Intake',
        desc: `Logged ${Math.round(consumedProtein)}g protein so far. High protein preserves lean muscle tissue while suppressing hunger hormones (ghrelin).`,
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        badge: 'Muscle Support',
        hasScienceModal: false,
      });
    } else if (consumedCalories > 800) {
      list.push({
        id: 'protein-boost',
        type: 'tip',
        icon: Heart,
        title: 'Boost Protein for Dinner',
        desc: `You have consumed ${Math.round(consumedProtein)}g / ${proteinTarget}g protein. Try adding paneer, eggs, chicken, or lentils to your next meal.`,
        color: 'border-indigo-200 bg-indigo-50 text-indigo-800',
        badge: 'Nutrient Target',
        hasScienceModal: false,
      });
    }

    // 3. Cheat Meal Insight
    if (hasCheatMeal) {
      list.push({
        id: 'cheat-meal',
        type: 'fun',
        icon: Pizza,
        title: 'Mindful Cheat Meal Registered',
        desc: 'You logged your craving! Psychologically, mindful inclusion of favorite foods prevents binge cycles and builds a sustainable lifestyle for all age groups.',
        color: 'border-rose-200 bg-rose-50 text-rose-800',
        badge: 'Sustainable Diet',
        hasScienceModal: false,
      });
    }

    // 4. Fiber / Health Insight
    if (consumedFiber >= 15) {
      list.push({
        id: 'fiber-good',
        type: 'info',
        icon: Sparkles,
        title: 'Excellent Dietary Fiber',
        desc: `${Math.round(consumedFiber)}g fiber consumed today promotes stable blood sugar, heart health, and gut microbiome diversity.`,
        color: 'border-teal-200 bg-teal-50 text-teal-800',
        badge: 'Gut Health',
        hasScienceModal: false,
      });
    }

    return list;
  }, [consumedCalories, target, tdee, deficit, projectedDeficitGrams, consumedProtein, consumedFiber, profile, hasCheatMeal]);

  return (
    <div id="personalized-insights-section" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Personalized Health Insights
            </h3>
            <p className="text-xs text-slate-500">Live scientific feedback based on your logged intake</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowScienceModal(true)}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Fat Loss Science</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div
              key={ins.id}
              className={`p-4 rounded-2xl border ${ins.color} flex items-start gap-3.5 transition-all shadow-2xs relative`}
            >
              <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-extrabold text-sm">{ins.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md shrink-0">
                    {ins.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{ins.desc}</p>

                {ins.hasScienceModal && (
                  <button
                    type="button"
                    onClick={() => setShowScienceModal(true)}
                    className="mt-2 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Is this true? See the mathematical breakdown →</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Truth & Mathematical Breakdown Modal */}
      <AnimatePresence>
        {showScienceModal && (
          <div
            id="science-truth-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              id="science-truth-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-800"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">The Science of Fat Loss</h3>
                    <p className="text-xs text-emerald-100">Why ~{projectedDeficitGrams || 76}g fat corresponds to your {deficit > 0 ? deficit : 583} kcal deficit</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScienceModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs leading-relaxed text-slate-600">
                {/* 1. Direct Answer */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Is this information true?</span>
                  </div>
                  <p>
                    <strong>Yes, biochemically and thermodynamically it is strictly true.</strong> A net daily deficit of <strong>{deficit > 0 ? deficit : 583} kcal</strong> forces your metabolism to oxidize approximately <strong>~{projectedDeficitGrams || 76} grams</strong> of human body fat tissue.
                  </p>
                </div>

                {/* 2. The Biochemical Math */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>The Exact Equation (Wishnofsky's Rule)</span>
                  </h4>
                  <p>
                    You might know that pure dietary oil yields <strong>9 kcal per gram</strong>. However, <strong>human body fat (adipose tissue)</strong> is living biological tissue, not pure bottled oil:
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] space-y-1">
                    <div>• 1g human fat tissue = ~87% pure triglycerides + ~10-12% cellular water + ~2% protein matrix.</div>
                    <div className="font-bold text-emerald-700">• Energy density = 0.87 × 9 kcal ≈ 7.7 kcal per gram (7,700 kcal / kg).</div>
                  </div>
                  <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-950 font-medium">
                    <span>Calculation: </span>
                    <strong className="font-mono">{deficit > 0 ? deficit : 583} kcal ÷ 7.7 kcal/g = ~{projectedDeficitGrams || 76}g of body fat tissue</strong>
                  </div>
                </div>

                {/* 3. Why the bathroom scale fluctuates */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-amber-950">
                  <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-900">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Why You Won't See Exactly {projectedDeficitGrams || 76}g on the Scale Tomorrow</span>
                  </h4>
                  <p className="text-amber-900/90">
                    While <strong>fat loss is immediate and continuous at the cellular level</strong>, scale weight fluctuates by <strong>±1.0 to 2.0 kg daily</strong> due to:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-900/80">
                    <li><strong>Water bound to glycogen:</strong> Each 1g of stored carbs holds 3 to 4 grams of water in your liver and muscles.</li>
                    <li><strong>Sodium & Hydration:</strong> Salty food can retain 500g–1kg of water overnight.</li>
                    <li><strong>Digestive transit:</strong> Weight of uneliminated food in the stomach/intestines.</li>
                  </ul>
                  <p className="font-semibold text-amber-900 pt-1">
                    Rule of thumb: Fat loss happens quietly every day in deficit; scale loss shows up across 7–14 day weekly averages.
                  </p>
                </div>

                {/* 4. How fat leaves the body */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 space-y-1 text-teal-950">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900">
                    💨 How Fat Leaves Your Body
                  </h4>
                  <p className="text-teal-900/90">
                    When your body oxidizes that {projectedDeficitGrams || 76}g of triglycerides, <strong>84% is exhaled as carbon dioxide (CO₂) through your lungs</strong>, and <strong>16% is excreted as water (H₂O)</strong> through sweat and urine!
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowScienceModal(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Got it, close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
