import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  Pizza, 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';
import { MealType, LoggedFoodItem } from '../types';

interface Props {
  mealType: MealType;
  items: LoggedFoodItem[];
  dailyTarget: number;
  onOpenAddModal: (mealType: MealType) => void;
  onRemoveItem: (itemId: string) => void;
}

const MEAL_META: Record<MealType, {
  title: string;
  subtitle: string;
  icon: any;
  colorClass: string;
  accentBg: string;
  borderClass: string;
  isCheat?: boolean;
}> = {
  breakfast: {
    title: 'Breakfast',
    subtitle: 'Morning fuel & jumpstart',
    icon: Coffee,
    colorClass: 'text-amber-600',
    accentBg: 'bg-amber-500/10 text-amber-700',
    borderClass: 'border-amber-200/80',
  },
  lunch: {
    title: 'Lunch',
    subtitle: 'Midday balanced nutrition',
    icon: Sun,
    colorClass: 'text-emerald-600',
    accentBg: 'bg-emerald-500/10 text-emerald-700',
    borderClass: 'border-emerald-200/80',
  },
  dinner: {
    title: 'Dinner',
    subtitle: 'Evening nourishing meal',
    icon: Moon,
    colorClass: 'text-indigo-600',
    accentBg: 'bg-indigo-500/10 text-indigo-700',
    borderClass: 'border-indigo-200/80',
  },
  snacks: {
    title: 'Snacks & Drinks',
    subtitle: 'Light bites, fruits & tea',
    icon: Apple,
    colorClass: 'text-teal-600',
    accentBg: 'bg-teal-500/10 text-teal-700',
    borderClass: 'border-teal-200/80',
  },
  cheat_meal: {
    title: 'Cheat Meal / Craving',
    subtitle: 'Tracked & balanced guilt-free',
    icon: Pizza,
    colorClass: 'text-rose-600',
    accentBg: 'bg-rose-500/10 text-rose-700',
    borderClass: 'border-rose-300',
    isCheat: true,
  },
};

export const MealSectionCard: React.FC<Props> = ({
  mealType,
  items,
  dailyTarget,
  onOpenAddModal,
  onRemoveItem,
}) => {
  const meta = MEAL_META[mealType];
  const Icon = meta.icon;

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
  const pctOfDaily = dailyTarget > 0 ? Math.round((totalCalories / dailyTarget) * 100) : 0;

  return (
    <motion.div
      id={`meal-card-${mealType}`}
      layout
      className={`bg-white rounded-3xl border ${meta.borderClass} shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
    >
      <div>
        {/* Meal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${meta.accentBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{meta.title}</h3>
                {meta.isCheat && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                    Flexible Treat
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">{meta.subtitle}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-end gap-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{totalCalories}</span>
              <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {pctOfDaily}% of daily goal
            </span>
          </div>
        </div>

        {/* Cheat meal mindset helper banner */}
        {meta.isCheat && (
          <div className="mx-4 mt-3 p-2.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-xs text-rose-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight">
              <strong>Guilt-Free Rule:</strong> Logging your favorite cravings keeps you mindful and prevents binges while protecting your weekly deficit!
            </span>
          </div>
        )}

        {/* Food Items List */}
        <div className="p-4 sm:p-5 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs font-medium text-slate-400">
                No items logged for {meta.title.toLowerCase()} yet.
              </p>
              <button
                id={`add-food-empty-${mealType}`}
                type="button"
                onClick={() => onOpenAddModal(mealType)}
                className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                + Tap to log {meta.title.toLowerCase()}
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      {item.restaurant && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                          {item.restaurant}
                        </span>
                      )}
                      {item.brand && (
                        <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded-md border border-indigo-200 shrink-0">
                          {item.brand}
                        </span>
                      )}
                      {item.servingQuantity !== 1 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                          {item.servingQuantity}x
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{item.servingUnit}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">P: {item.protein}g</span>
                      <span>C: {item.carbs}g</span>
                      <span>F: {item.fat}g</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{item.calories}</span>
                      <span className="text-[10px] text-slate-400 ml-0.5">kcal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove food"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer Add Button & Macro Summary */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 font-medium">
            {items.length > 0 && (
              <span>
                Macros: <strong className="text-slate-700">{Math.round(totalProtein)}g P</strong> |{' '}
                <strong className="text-slate-700">{Math.round(totalCarbs)}g C</strong> |{' '}
                <strong className="text-slate-700">{Math.round(totalFat)}g F</strong>
              </span>
            )}
          </div>

          <button
            id={`add-food-btn-${mealType}`}
            type="button"
            onClick={() => onOpenAddModal(mealType)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              meta.isCheat
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to {meta.title}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
