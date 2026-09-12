import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Flame, 
  Footprints, 
  Sparkles, 
  Droplets, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Heart,
  Scale,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile, DayRecord } from '../types';

interface Props {
  profile: UserProfile;
  dayRecord: DayRecord;
  onNavigateToDiary?: () => void;
}

export const ExcessCalorieRecovery: React.FC<Props> = ({
  profile,
  dayRecord,
  onNavigateToDiary,
}) => {
  const target = profile.dailyCalorieTarget || 2000;
  const consumed = dayRecord.items.reduce((sum, item) => sum + item.calories, 0);
  const actualSurplus = Math.max(0, consumed - target);

  // Allow user to experiment with surplus amount (defaults to today's surplus, or 450 if today is on track)
  const [surplusInput, setSurplusInput] = useState<number>(actualSurplus > 0 ? actualSurplus : 450);
  const [selectedStrategy, setSelectedStrategy] = useState<'gentle' | 'neat' | 'protein' | 'water'>('gentle');
  const [expandedSection, setExpandedSection] = useState<string | null>('timeline');

  // Scientific conversions
  // 7,700 kcal = 1 kg pure adipose tissue
  const potentialFatGrams = Math.round((surplusInput / 7700) * 1000);
  // High carb/sodium water retention estimate (1g glycogen holds 3-4g water + sodium osmotic retention)
  const estimatedWaterWeightKg = (0.4 + (surplusInput / 2000) * 0.8).toFixed(1);

  // Strategy calculations
  const gentleOffsetDays = 3;
  const gentleDailyReduction = Math.round(surplusInput / gentleOffsetDays);

  // Walking burn rate: ~40-50 kcal per 1,000 steps for a 70kg person
  const extraStepsNeeded = Math.round((surplusInput / 45) * 100) * 10;
  const walkingMinutes = Math.round(surplusInput / 5);

  return (
    <div id="excess-calorie-recovery-view" className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/5 rounded-3xl p-6 sm:p-8 border border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Evidence-Based Recovery Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ate in Excess? <span className="text-emerald-600">Don't Panic, Here is the Science & Strategy</span>
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Eating beyond your target happens to every human being. One single high-calorie meal or surplus day will <strong className="text-slate-900">never undo your progress</strong> unless you respond with extreme restriction or guilt. Follow this metabolic recovery guide to reset effortlessly.
            </p>
          </div>

          {/* Quick Reality Check Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Balance</span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                actualSurplus > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {actualSurplus > 0 ? `+${actualSurplus} kcal surplus` : 'Within Target'}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xs text-slate-500">Target: <strong className="text-slate-800">{target} kcal</strong></div>
              <div className="text-xs text-slate-500">Logged: <strong className="text-slate-800">{consumed} kcal</strong></div>
            </div>
            {actualSurplus > 0 && onNavigateToDiary && (
              <button
                type="button"
                onClick={onNavigateToDiary}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View Today's Meals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Surplus Calculator & Biological Truth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Surplus Adjuster & Plan Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Surplus Recovery Calculator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your estimated surplus calories to generate an optimal offset plan:
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[250, 500, 750, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSurplusInput(preset)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      surplusInput === preset
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    +{preset} kcal
                  </button>
                ))}
              </div>
            </div>

            {/* Slider & Exact Input */}
            <div className="my-5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">Current Surplus Being Modeled:</span>
                <div className="flex items-center gap-1 font-black text-amber-900 text-lg">
                  <input
                    type="number"
                    min="50"
                    max="3000"
                    step="50"
                    value={surplusInput}
                    onChange={(e) => setSurplusInput(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-center py-1 rounded-lg border border-amber-300 bg-white text-base font-black text-amber-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span>kcal</span>
                </div>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={surplusInput}
                onChange={(e) => setSurplusInput(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-amber-700 font-medium mt-1">
                <span>100 kcal (Small Snack)</span>
                <span>500 kcal (Meal Dessert)</span>
                <span>1,000+ kcal (Party / Feast)</span>
              </div>
            </div>

            {/* Strategy Tab Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'gentle', label: 'Plan A: Gentle 3-Day', icon: RefreshCw },
                { id: 'neat', label: 'Plan B: NEAT / Steps', icon: Footprints },
                { id: 'protein', label: 'Plan C: Protein Reset', icon: Sparkles },
                { id: 'water', label: 'Plan D: Water / Sodium', icon: Droplets },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedStrategy === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedStrategy(tab.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Strategy Content */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              {selectedStrategy === 'gentle' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        The 3-Day Micro-Offset (Gold Standard for Long-Term Success)
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Rather than doing an extreme fast tomorrow (which triggers intense hunger hormones like Ghrelin), divide the surplus evenly over the next {gentleOffsetDays} days.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border-l-3 border-emerald-500 pl-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Daily Adjustment</span>
                      <div className="text-base font-black text-emerald-700">
                        -{gentleDailyReduction} kcal / day
                      </div>
                      <span className="text-[11px] text-slate-500">For the next 3 days only</span>
                    </div>

                    <div className="border-l-3 border-teal-500 pl-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Adjusted Daily Budget</span>
                      <div className="text-base font-black text-slate-800">
                        {Math.max(1200, target - gentleDailyReduction)} kcal
                      </div>
                      <span className="text-[11px] text-slate-500">Easy to achieve by swapping 1 soda or sugary dip</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 font-medium bg-emerald-100/60 p-2.5 rounded-xl">
                    💡 <strong>Action Tip:</strong> Simply skip high-calorie salad dressings, cut 1/2 roti at dinner, or drink black coffee instead of sweet chai. You won't feel hungry at all!
                  </p>
                </div>
              )}

              {selectedStrategy === 'neat' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 font-black text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        The NEAT & Step Offset (Zero Hunger Disruption)
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Non-Exercise Activity Thermogenesis (NEAT) is the most sustainable way to burn excess energy without raising stress hormones (cortisol).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border-l-3 border-sky-500 pl-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Extra Steps</span>
                      <div className="text-base font-black text-sky-700">
                        +{extraStepsNeeded.toLocaleString()} steps
                      </div>
                      <span className="text-[11px] text-slate-500">Split into ~{Math.round(extraStepsNeeded / 2).toLocaleString()} steps/day for 2 days</span>
                    </div>

                    <div className="border-l-3 border-indigo-500 pl-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Leisurely Walking Time</span>
                      <div className="text-base font-black text-indigo-700">
                        ~{walkingMinutes} minutes total
                      </div>
                      <span className="text-[11px] text-slate-500">E.g., two 20-min evening walks after meals</span>
                    </div>
                  </div>

                  <p className="text-xs text-sky-900 font-medium bg-sky-100/60 p-2.5 rounded-xl">
                    🚶 <strong>GLUT-4 Activation:</strong> A 15-minute walk right after eating contracts your leg muscles, drawing blood glucose directly into muscle cells without requiring high insulin spikes!
                  </p>
                </div>
              )}

              {selectedStrategy === 'protein' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 font-black text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        High-Volume & Satiety Reset (Crush Rebound Cravings)
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Surplus meals often cause blood sugar rollercoasters that make you crave snacks again hours later. The fix is anchoring your next meals with protein and high-fiber volume.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">30g+ Lean Protein</span>
                      <span className="text-slate-500 text-[11px]">Paneer bhurji, boiled eggs, soya chunks, or Greek yogurt to trigger Peptide YY.</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">50% Plate Veggies</span>
                      <span className="text-slate-500 text-[11px]">Cucumbers, palak, zucchini, or cabbage to physically fill stomach stretch receptors.</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">Drink Warm Liquids</span>
                      <span className="text-slate-500 text-[11px]">Green tea, warm jeera water, or black coffee to suppress psychological urges.</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedStrategy === 'water' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-black text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        The Sodium & Water Flush Protocol (Beat False Scale Gain)
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Restaurant & packaged foods contain 1,500mg - 3,000mg of sodium. Sodium holds water like a sponge. <strong>Drinking more water flushes sodium out through the kidneys!</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Drink 2.5 to 3 Liters:</strong> Paradoxically, drinking plenty of water signals the body to release held subcutaneous fluid.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Add Potassium-Rich Foods:</strong> Tender coconut water, bananas, or spinach help kidneys excrete excess sodium.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Do NOT weigh yourself tomorrow morning:</strong> Wait 48 hours for glycogen and sodium levels to normalize before stepping on the scale!</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Timeline Accordion */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')}
            >
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Exact Step-by-Step Action Timeline</span>
              </h3>
              {expandedSection === 'timeline' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {expandedSection === 'timeline' && (
              <div className="space-y-3 pt-2">
                {/* Phase 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <div className="px-2 py-1 rounded-lg bg-amber-200 text-amber-900 font-extrabold text-[11px] shrink-0">
                    TONIGHT
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Immediate Post-Meal Actions</div>
                    <p className="text-slate-600">
                      1. Take a 15–20 minute relaxed stroll (no running).<br />
                      2. Drink a large glass of warm water or peppermint tea.<br />
                      3. Stop eating for the night. Allow your stomach 3 hours before laying down to sleep soundly.
                    </p>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/60">
                  <div className="px-2 py-1 rounded-lg bg-sky-200 text-sky-900 font-extrabold text-[11px] shrink-0">
                    TOMORROW
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Morning Wake-Up Protocol</div>
                    <p className="text-slate-600">
                      1. <strong>Skip the scale</strong> for 48 hours to avoid psychological panic over temporary water weight.<br />
                      2. Drink 500ml of room-temperature water with lemon.<br />
                      3. Eat a normal, high-protein breakfast (e.g., paneer bhurji or 3 boiled eggs). Do NOT starve yourself!
                    </p>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <div className="px-2 py-1 rounded-lg bg-emerald-200 text-emerald-900 font-extrabold text-[11px] shrink-0">
                    DAYS 2 & 3
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Gentle Normalization</div>
                    <p className="text-slate-600">
                      Resume your regular daily target ({target} kcal). Log everything accurately in CalorieCard without judgment. The weekly deficit will smooth out the single surplus day completely!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Science, Math & "Do NOT Do This" Checklist */}
        <div className="space-y-6">
          {/* Biological Reality Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Scale className="w-4 h-4" />
              <span>The Biological Math</span>
            </div>

            <div>
              <div className="text-xs text-slate-400">Max Possible Real Fat Gain:</div>
              <div className="text-3xl font-black text-emerald-300 mt-0.5">
                ~{potentialFatGrams} grams
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Because 1 kg of pure fat requires <strong>7,700 surplus calories</strong>, eating +{surplusInput} kcal can only create ~{potentialFatGrams}g of fat.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/80">
              <div className="text-xs text-slate-400">Scale Weight Fluctuation:</div>
              <div className="text-2xl font-black text-amber-300 mt-0.5">
                +{estimatedWaterWeightKg} kg (Water & Glycogen)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                If the scale is up tomorrow, <strong>over 90% is temporary water weight</strong> bound to sodium and stored carbohydrates. It disappears in 48 hours.
              </p>
            </div>
          </div>

          {/* Dangerous Traps: What NEVER To Do */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                4 Critical Traps to AVOID
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-rose-900 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Do NOT skip all meals tomorrow:</strong> Severe restriction crashes blood sugar and triggers a worse binge cycle within 24-48 hours.
                </div>
              </div>

              <div className="flex items-start gap-2 text-rose-900 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Do NOT do 2 hours of punishing cardio:</strong> Excessive cardio increases cortisol, stimulates immense appetite, and depletes lean muscle mass.
                </div>
              </div>

              <div className="flex items-start gap-2 text-rose-900 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Do NOT obsess over the scale tomorrow:</strong> Weighing in when sodium is high causes artificial despair over fake water weight.
                </div>
              </div>

              <div className="flex items-start gap-2 text-rose-900 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Do NOT say "the whole week is ruined":</strong> Your body operates on weekly averages. 6 days on track + 1 surplus day = a successful deficit week!
                </div>
              </div>
            </div>
          </div>

          {/* Encouraging Mindset Note */}
          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Remember: Consistency Beats Perfection</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Fitness is a lifelong habit, not an all-or-nothing test. Enjoying special food and bouncing right back is the hallmark of someone who keeps the weight off permanently!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
