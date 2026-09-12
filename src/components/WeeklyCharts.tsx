import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  TrendingDown, 
  Target, 
  Flame, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserProfile, DayRecord } from '../types';
import { formatDateLabel, getTodayDateString } from '../utils/nutritionCalculations';

interface Props {
  profile: UserProfile;
  allDays: Record<string, DayRecord>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const WeeklyCharts: React.FC<Props> = ({
  profile,
  allDays,
  selectedDate,
  onSelectDate,
}) => {
  const [chartView, setChartView] = useState<'intake' | 'meals' | 'trajectory'>('intake');
  const target = profile.dailyCalorieTarget || 2000;
  const tdee = profile.tdee || 2500;
  const standardDailyDeficit = Math.max(0, tdee - target);
  const startWeight = profile.startingWeight || profile.weight || 72;

  const todayStr = getTodayDateString();
  const startDateStr = profile.startDate || todayStr;

  // Build accurately anchored date timeline starting from the user's start day
  const { chartData, elapsedDays, totalRealDeficit, totalRealFatGrams } = React.useMemo(() => {
    const startDate = new Date(startDateStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    
    // Difference in calendar days from start
    const diffDays = Math.max(0, Math.round((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // If user has been tracking less than 7 days, show 7-day initial cycle (Day 1 to Day 7)
    // If more than 7 days, show the latest 7-day window ending today, bounded by startDate
    let anchorStartDate = new Date(startDate);
    if (diffDays >= 7) {
      anchorStartDate = new Date(todayDate);
      anchorStartDate.setDate(anchorStartDate.getDate() - 6);
      if (anchorStartDate < startDate) {
        anchorStartDate = new Date(startDate);
      }
    }

    const list = [];
    let cumulativeDeficitSoFar = 0;
    let realLoggedDeficitSum = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(anchorStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Day number relative to the user's official start day
      const dayNumber = Math.round((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const isPastOrToday = dateStr <= todayStr;
      const isToday = dateStr === todayStr;
      const isStartDay = dateStr === startDateStr;

      const record = allDays[dateStr];
      const hasLogs = Boolean(record && record.items.length > 0);

      const breakfast = record?.items
        .filter(item => item.mealType === 'breakfast')
        .reduce((sum, item) => sum + item.calories, 0) || 0;
      
      const lunch = record?.items
        .filter(item => item.mealType === 'lunch')
        .reduce((sum, item) => sum + item.calories, 0) || 0;

      const dinner = record?.items
        .filter(item => item.mealType === 'dinner')
        .reduce((sum, item) => sum + item.calories, 0) || 0;

      const snacks = record?.items
        .filter(item => item.mealType === 'snacks')
        .reduce((sum, item) => sum + item.calories, 0) || 0;

      const cheatMeal = record?.items
        .filter(item => item.mealType === 'cheat_meal')
        .reduce((sum, item) => sum + item.calories, 0) || 0;

      const totalCalories = breakfast + lunch + dinner + snacks + cheatMeal;

      let dailyDeficit = 0;
      let isPlanned = false;

      if (isPastOrToday) {
        if (hasLogs) {
          dailyDeficit = tdee - totalCalories;
          realLoggedDeficitSum += Math.max(0, dailyDeficit);
          cumulativeDeficitSoFar += dailyDeficit;
        } else if (isToday) {
          // Today not logged yet
          dailyDeficit = 0;
        } else {
          // Past day without log
          dailyDeficit = 0;
        }
      } else {
        // Upcoming future day: accurate lead projection
        isPlanned = true;
        dailyDeficit = standardDailyDeficit;
        cumulativeDeficitSoFar += dailyDeficit;
      }

      // Metabolic fat loss calculation: 7700 kcal per kg
      const metabolicWeight = Number((startWeight - (cumulativeDeficitSoFar / 7700)).toFixed(2));

      // Day label
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLabel = isStartDay 
        ? `Day 1 (${weekday})` 
        : isToday 
          ? `Today (${weekday})` 
          : `Day ${dayNumber} (${weekday})`;

      list.push({
        date: dateStr,
        dayNumber,
        dayLabel,
        fullLabel: formatDateLabel(dateStr),
        totalCalories: isPlanned ? target : totalCalories,
        actualCalories: totalCalories,
        isPlanned,
        isToday,
        isStartDay,
        hasLogs,
        target,
        deficit: dailyDeficit,
        metabolicWeight,
        breakfast,
        lunch,
        dinner,
        snacks,
        cheatMeal,
        isSelected: dateStr === selectedDate,
        status: isPlanned 
          ? 'planned' 
          : totalCalories === 0 
            ? 'empty' 
            : totalCalories <= target 
              ? 'on_track' 
              : 'over_target',
      });
    }

    const totalRealFatGrams = Math.round((realLoggedDeficitSum / 7700) * 1000);

    return { 
      chartData: list, 
      elapsedDays: diffDays, 
      totalRealDeficit: realLoggedDeficitSum,
      totalRealFatGrams
    };
  }, [startDateStr, todayStr, allDays, target, tdee, standardDailyDeficit, startWeight, selectedDate]);

  // Active logged days
  const activeLoggedDays = chartData.filter(d => !d.isPlanned && d.actualCalories > 0);
  const avgLoggedIntake = activeLoggedDays.length > 0 
    ? Math.round(activeLoggedDays.reduce((sum, d) => sum + d.actualCalories, 0) / activeLoggedDays.length)
    : 0;

  return (
    <div id="weekly-charts-card" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header with Title, Start Anchor & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Interactive Progress & Accurate Trajectory
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>Started: {formatDateLabel(startDateStr)} (Day {elapsedDays + 1})</span>
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">Charts begin directly on your start day with zero false history</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartView('intake')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              chartView === 'intake'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Intake vs Target
          </button>
          <button
            type="button"
            onClick={() => setChartView('meals')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              chartView === 'meals'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Meal Breakdown
          </button>
          <button
            type="button"
            onClick={() => setChartView('trajectory')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              chartView === 'trajectory'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Accurate Fat Lead
          </button>
        </div>
      </div>

      {/* Metric Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Logged Intake</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {avgLoggedIntake > 0 ? avgLoggedIntake.toLocaleString() : '—'} <span className="text-xs font-normal text-slate-500">kcal</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Budget: {target} kcal/day</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Accumulated Deficit</span>
          <div className="text-lg font-black text-emerald-800 mt-0.5">
            🔥 {totalRealDeficit.toLocaleString()} <span className="text-xs font-normal text-emerald-600">kcal</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Under maintenance burn</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Real Fat Oxidized</span>
          <div className="text-lg font-black text-teal-800 mt-0.5">
            ~{totalRealFatGrams} <span className="text-xs font-normal text-teal-600">grams</span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold">Wishnofsky's rule (7.7 kcal/g)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Planned Daily Rate</span>
          <div className="text-lg font-black text-amber-800 mt-0.5">
            -{Math.round((standardDailyDeficit / 7700) * 1000)} <span className="text-xs font-normal text-amber-600">g/day</span>
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">~0.53 kg/week steady loss</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'intake' ? (
            <BarChart 
              data={chartData} 
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  onSelectDate(data.activePayload[0].payload.date);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, (dataMax: number) => Math.max(target + 600, dataMax + 200)]}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-44">
                        <div className="font-extrabold text-sm text-emerald-400 border-b border-slate-800 pb-1 flex justify-between">
                          <span>{d.fullLabel}</span>
                          <span>{d.isPlanned ? `${d.target} kcal (Plan)` : `${d.actualCalories} kcal`}</span>
                        </div>
                        <div className="pt-1 flex justify-between text-slate-300">
                          <span>Target Budget:</span>
                          <span>{d.target} kcal</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Status:</span>
                          <span className={d.isPlanned ? 'text-teal-400 font-bold' : d.actualCalories <= d.target ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {d.isPlanned ? '🎯 Upcoming Target' : d.actualCalories <= d.target ? '✅ On Track' : '⚠️ Over Target'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1">Click to select and view meal logs</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={target} 
                stroke="#059669" 
                strokeDasharray="4 4" 
                strokeWidth={2}
                label={{ value: `Target: ${target} kcal`, position: 'top', fill: '#059669', fontSize: 10, fontWeight: 700 }}
              />
              <Bar dataKey="totalCalories" radius={[8, 8, 0, 0]} maxBarSize={44}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.isSelected 
                        ? '#047857' 
                        : entry.isPlanned
                          ? '#cbd5e1'
                          : entry.status === 'over_target' 
                            ? '#f43f5e' 
                            : entry.status === 'on_track' 
                              ? '#10b981' 
                              : '#e2e8f0'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          ) : chartView === 'meals' ? (
            <BarChart 
              data={chartData} 
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  onSelectDate(data.activePayload[0].payload.date);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-44">
                        <div className="font-extrabold text-sm text-emerald-400 border-b border-slate-800 pb-1">
                          {d.fullLabel} (Total: {d.actualCalories} kcal)
                        </div>
                        <div className="pt-1 flex justify-between text-amber-300">
                          <span>Breakfast:</span> <span>{d.breakfast} kcal</span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                          <span>Lunch:</span> <span>{d.lunch} kcal</span>
                        </div>
                        <div className="flex justify-between text-indigo-300">
                          <span>Dinner:</span> <span>{d.dinner} kcal</span>
                        </div>
                        <div className="flex justify-between text-teal-300">
                          <span>Snacks:</span> <span>{d.snacks} kcal</span>
                        </div>
                        <div className="flex justify-between text-rose-300">
                          <span>Cheat Meal:</span> <span>{d.cheatMeal} kcal</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={30}
                formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
              />
              <Bar dataKey="breakfast" stackId="a" fill="#f59e0b" name="Breakfast" />
              <Bar dataKey="lunch" stackId="a" fill="#10b981" name="Lunch" />
              <Bar dataKey="dinner" stackId="a" fill="#6366f1" name="Dinner" />
              <Bar dataKey="snacks" stackId="a" fill="#14b8a6" name="Snacks" />
              <Bar dataKey="cheatMeal" stackId="a" fill="#f43f5e" radius={[8, 8, 0, 0]} name="Cheat Meal" />
            </BarChart>
          ) : (
            <ComposedChart 
              data={chartData} 
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  onSelectDate(data.activePayload[0].payload.date);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#059669', fontSize: 11 }}
                domain={[0, (dataMax: number) => Math.max(800, dataMax + 200)]}
                label={{ value: 'Daily Deficit (kcal)', angle: -90, position: 'insideLeft', fill: '#059669', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4f46e5', fontSize: 11 }}
                domain={[(dataMin: number) => Math.floor(dataMin - 1), (dataMax: number) => Math.ceil(dataMax + 1)]}
                label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight', fill: '#4f46e5', fontSize: 10 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-48">
                        <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">
                          {d.fullLabel} {d.isPlanned && '(Target Projection)'}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Daily Deficit:</span>
                          <strong className="text-emerald-400">{d.deficit} kcal</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Accurate Fat Lost:</span>
                          <strong className="text-teal-300">~{Math.round((d.deficit / 7700) * 1000)}g</strong>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1">
                          <span className="text-indigo-300">Lead Trajectory Weight:</span>
                          <strong className="text-indigo-400">{d.metabolicWeight} kg</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="deficit" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
                name="Daily Deficit (kcal)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="metabolicWeight" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4f46e5' }}
                name="Accurate Weight Lead (kg)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Day Click Selector Bar */}
      <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-slate-100">
        {chartData.map((d) => {
          const isSelected = d.date === selectedDate;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDate(d.date)}
              className={`py-2 px-1 rounded-2xl text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                  : d.isToday
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                    : d.isPlanned
                      ? 'bg-slate-50 text-slate-400 border border-dashed border-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span className="block text-[10px] font-bold uppercase truncate">
                {d.isToday ? 'Today' : d.dayLabel.split(' ')[0]}
              </span>
              <span className={`block text-xs font-black mt-0.5 ${isSelected ? 'text-white' : d.isToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                {d.actualCalories > 0 ? `${d.actualCalories}` : d.isPlanned ? 'Plan' : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
