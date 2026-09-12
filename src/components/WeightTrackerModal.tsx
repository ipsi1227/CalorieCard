import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, X, Plus, Trash2, TrendingDown, Award, Calendar, AlertCircle } from 'lucide-react';
import { UserProfile, WeightRecord } from '../types';
import { getTodayDateString, formatDateLabel } from '../utils/nutritionCalculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  weightHistory: WeightRecord[];
  onAddWeightRecord: (record: WeightRecord) => void;
  onDeleteWeightRecord: (recordId: string) => void;
}

export const WeightTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  weightHistory,
  onAddWeightRecord,
  onDeleteWeightRecord,
}) => {
  const [newWeight, setNewWeight] = useState<number>(profile.weight || 70);
  const [recordDate, setRecordDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');

  const startingWeight = profile.startingWeight || profile.weight;
  
  // Sorted weights by date descending
  const sortedHistory = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));
  const currentWeight = sortedHistory.length > 0 ? sortedHistory[0].weightKg : profile.weight;
  const totalLost = Number((startingWeight - currentWeight).toFixed(1));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || newWeight <= 0) return;

    const record: WeightRecord = {
      id: 'wt-' + Date.now(),
      date: recordDate,
      weightKg: Number(newWeight),
      note: note.trim() || undefined,
    };

    onAddWeightRecord(record);
    setNote('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="weight-tracker-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="weight-tracker-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Weight Loss Tracker</h3>
                <p className="text-xs text-emerald-100">Track how much weight you have lost</p>
              </div>
            </div>
            <button
              id="close-weight-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Big Status Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Total Weight Lost
                </span>
                <div className="text-3xl font-black text-emerald-900 mt-0.5 flex items-baseline gap-1.5">
                  <span>{totalLost > 0 ? `-${totalLost} kg` : totalLost === 0 ? '0.0 kg' : `+${Math.abs(totalLost)} kg`}</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    ({(Math.abs(totalLost) * 2.20462).toFixed(1)} lbs)
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <div>Start: <strong className="text-slate-800">{startingWeight} kg</strong></div>
                <div>Current: <strong className="text-slate-800">{currentWeight} kg</strong></div>
              </div>
            </div>

            {/* Log New Weight Entry Form */}
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                + Log Today's Scale Weigh-in
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    id="new-weight-input"
                    type="number"
                    step="0.1"
                    min={30}
                    max={250}
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning weigh-in, feeling energetic"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  id="save-weight-btn"
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Weigh-in</span>
                </button>
              </div>
            </form>

            {/* Historical Entries */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Weigh-in History ({sortedHistory.length})
              </span>

              {sortedHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No weigh-ins logged yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {sortedHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{rec.weightKg} kg</span>
                        <span className="text-[10px] text-slate-400 ml-2">{formatDateLabel(rec.date)}</span>
                        {rec.note && <span className="text-[11px] text-slate-500 block italic">{rec.note}</span>}
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteWeightRecord(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
