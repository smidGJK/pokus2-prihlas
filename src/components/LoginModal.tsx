import React, { useState } from 'react';
import { User, SchoolEvent } from '../types';
import { ALL_CLASSES, DEMO_USERS } from '../data/sampleData';
import { 
  GraduationCap, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  School,
  X
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveUser: (user: User) => void;
  event: SchoolEvent;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  event
}) => {
  // Step 1: Google Login ("GJK přihlašovač - Pokračovat přes Google")
  // Step 2: Fact Verification ("GJK přihlášen - Ověření skutečností: Jméno, Třída")
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(currentUser.name || 'Jan Novák');
  const [email, setEmail] = useState(currentUser.email || 'novak.jan@student.gjk.cz');
  const [role, setRole] = useState<User['role']>(currentUser.role || 'student');
  const [studentClass, setStudentClass] = useState(currentUser.studentClass || '3.A');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  const handleGoogleMockLogin = (presetUser?: User) => {
    if (presetUser) {
      setName(presetUser.name);
      setEmail(presetUser.email);
      setRole(presetUser.role);
      setStudentClass(presetUser.studentClass || '3.A');
    }
    setStep(2);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      id: currentUser.id || `user-${Date.now()}`,
      name: name.trim() || 'Student GJK',
      email: email.trim() || 'student@gjk.cz',
      role,
      studentClass: role === 'student' ? studentClass : undefined,
      avatarUrl: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    onSaveUser(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">GJK Přihlašovač</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xs mx-auto">
            {event.title}
          </p>
        </div>

        <div className="p-6">
          {step === 1 ? (
            /* SCREEN 1: Identita / Přihlašování */
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Přihlášení školním účtem Google
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Slouží k výběru a přihlašování na programy v rámci školní akce.
                </p>
              </div>

              {/* Google Button */}
              <button
                id="btn-google-sign-in"
                onClick={() => handleGoogleMockLogin()}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Pokračovat přes Google (@gjk.cz)</span>
              </button>

              {/* Fast Login Demo Switcher */}
              <div className="pt-4 border-t border-slate-100 text-left">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Nebo zvolte testovací účet
                </div>
                <div className="space-y-1.5">
                  {DEMO_USERS.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleGoogleMockLogin(u)}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-sky-50 hover:text-sky-900 border border-transparent hover:border-sky-200 transition-all text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {u.role === 'student' ? `Třída ${u.studentClass}` : 'Vyučující'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SCREEN 2: Ověření skutečností */
            <form onSubmit={handleFinish} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Google účet úspěšně ověřen</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ověření skutečností studenta
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zkontrolujte své jméno a správně přiřazenou třídu pro filtrování povolených workshopů.
                </p>
              </div>

              {/* Role switch */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 rounded-lg transition-all ${
                    role === 'student' ? 'bg-white font-bold text-sky-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-1.5 rounded-lg transition-all ${
                    role === 'teacher' ? 'bg-white font-bold text-sky-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Vyučující
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 rounded-lg transition-all ${
                    role === 'admin' ? 'bg-white font-bold text-sky-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Organizátor
                </button>
              </div>

              {/* Name & Email inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Jan Novák"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Školní e-mail (@gjk.cz)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="novak.jan@student.gjk.cz"
                  />
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span>Třída (pro kontrolu oprávnění)</span>
                      <span className="text-[10px] text-sky-600 font-semibold">Povinné</span>
                    </label>
                    <select
                      value={studentClass}
                      onChange={e => setStudentClass(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    >
                      {ALL_CLASSES.map(cls => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Pokračovat k výběru programů</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
