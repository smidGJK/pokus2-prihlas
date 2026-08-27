import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { User, SchoolEvent } from '../types';

interface HoursProgressBarProps {
  currentUser: User;
  event: SchoolEvent;
  enrolledHours: number;
  onViewSchedule: () => void;
  onViewCatalog?: () => void;
}

export const HoursProgressBar: React.FC<HoursProgressBarProps> = ({
  currentUser,
  event,
  enrolledHours,
  onViewSchedule,
  onViewCatalog
}) => {
  if (currentUser.role !== 'student') return null;

  const required = event.requiredHours;
  const percentage = Math.min(100, Math.round((enrolledHours / required) * 100));
  const isFulfilled = enrolledHours >= required;
  const missingHours = Math.max(0, Math.round((required - enrolledHours) * 10) / 10);

  return (
    <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-sky-700/40 relative overflow-hidden mb-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-sky-300">
              Přehled plnění rozvrhu
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
              Třída: {currentUser.studentClass || 'Nezadáno'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {enrolledHours}
            </span>
            <span className="text-sm text-sky-200 font-medium">
              / {required} povinných hodin
            </span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-md font-semibold text-white bg-sky-500/30 border border-sky-400/30">
              {percentage}%
            </span>
          </div>

          <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
            {isFulfilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  Výborně! Povinný rozsah programů na akci je splněn.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-amber-200">
                  K dokončení rozvrhu zbývá ještě <strong className="font-bold">{missingHours} hod.</strong>
                </span>
              </>
            )}
          </p>
        </div>

        {/* Middle Progress Bar */}
        <div className="flex-1 max-w-md mx-0 md:mx-4">
          <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15 backdrop-blur-xs">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFulfilled
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                  : 'bg-gradient-to-r from-amber-400 to-sky-400'
              }`}
              style={{ width: `${Math.max(6, percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-300 mt-1 font-medium px-0.5">
            <span>0 h</span>
            <span>Minimální cíl: {required} h</span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={onViewSchedule}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
          >
            <span>Zobrazit rozvrh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
