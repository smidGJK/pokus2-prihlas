import React from 'react';
import { Workshop, WorkshopSession, User, SchoolEvent } from '../types';
import { canEnrollInSession, isClassEligible } from '../services/storageService';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Mail, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface ProgramDetailModalProps {
  workshop: Workshop | null;
  selectedSession: WorkshopSession | null;
  onClose: () => void;
  currentUser: User;
  event: SchoolEvent;
  onEnroll: (workshopId: string, sessionId: string) => void;
  onUnenroll: (workshopId: string, sessionId: string) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  workshop,
  selectedSession,
  onClose,
  currentUser,
  event,
  onEnroll,
  onUnenroll
}) => {
  if (!workshop) return null;

  // If specific session not passed, choose the first or current active one
  const session = selectedSession || workshop.sessions[0];
  const isEnrolled = session ? session.enrolledStudentIds.includes(currentUser.id) : false;
  
  const validation = session ? canEnrollInSession(event, currentUser, workshop, session) : { allowed: false };
  const isClassAllowed = isClassEligible(currentUser.studentClass, workshop.targetClasses);
  const spotsLeft = session ? session.maxCapacity - session.enrolledStudentIds.length : 0;
  const isFull = spotsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30 font-semibold">
              {workshop.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
              {workshop.code}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pr-8 leading-snug">
            {workshop.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-sky-200">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium text-white">{workshop.teacherName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">{workshop.teacherEmail}</span>
            </div>
          </div>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          
          {/* Key Time & Room Meta Grid */}
          {session && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>Den a čas</span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {session.day} {session.startTime} – {session.endTime}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Délka programu</span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {session.durationHours} hod. ({session.durationHours * 60} min)
                </div>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Učebna / Místo</span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {session.room}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Anotace programu
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {workshop.description}
            </p>
          </div>

          {/* Requirements if any */}
          {workshop.requirements && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Požadavky / Pomůcky:</strong> {workshop.requirements}
              </div>
            </div>
          )}

          {/* Target Classes */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Určeno pro třídy</span>
              {isClassAllowed ? (
                <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Vhodné pro vaši třídu ({currentUser.studentClass})
                </span>
              ) : (
                <span className="text-red-600 text-xs font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Není určeno pro třídu {currentUser.studentClass}
                </span>
              )}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {workshop.targetClasses.map(tc => (
                <span 
                  key={tc}
                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    currentUser.studentClass && tc.toLowerCase().includes(currentUser.studentClass.toLowerCase())
                      ? 'bg-sky-100 text-sky-800 border border-sky-300 font-bold'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tc}
                </span>
              ))}
            </div>
          </div>

          {/* Capacity Section */}
          {session && (
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  Obsazenost termínu ({session.day} {session.startTime})
                </span>
                <span className={`font-bold ${isFull ? 'text-red-600' : 'text-slate-900'}`}>
                  {session.enrolledStudentIds.length} / {session.maxCapacity} obsazeno ({spotsLeft} volných)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isFull ? 'bg-red-500' : session.enrolledStudentIds.length / session.maxCapacity > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (session.enrolledStudentIds.length / session.maxCapacity) * 100)}%` }}
                />
              </div>

              {/* Dynamic repeat note */}
              {workshop.availableRepeatSlots && workshop.availableRepeatSlots.length > 0 && (
                <p className="text-[11px] text-indigo-700 mt-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Vyučující má k dispozici další termíny v případě naplnění kapacity ({workshop.availableRepeatSlots.map(s => `${s.day} ${s.startTime}`).join(', ')}).
                </p>
              )}
            </div>
          )}

          {/* Validation Alert */}
          {!isEnrolled && !validation.allowed && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Nelze se přihlásit:</strong> {validation.reason}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Zavřít
          </button>

          {session && (
            <div>
              {isEnrolled ? (
                <button
                  id="btn-unenroll-modal"
                  onClick={() => {
                    onUnenroll(workshop.id, session.id);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all"
                >
                  Odhlásit se z programu
                </button>
              ) : (
                <button
                  id="btn-enroll-modal"
                  disabled={!validation.allowed}
                  onClick={() => {
                    onEnroll(workshop.id, session.id);
                    onClose();
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                    validation.allowed
                      ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Přihlásit se na program ({session.durationHours} h)</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
