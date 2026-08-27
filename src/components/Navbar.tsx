import React, { useState } from 'react';
import { User, SchoolEvent } from '../types';
import { DEMO_USERS } from '../data/sampleData';
import { 
  Calendar, 
  Layers, 
  Users, 
  GraduationCap, 
  Settings, 
  LogOut, 
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  currentEvent: SchoolEvent;
  activeTab: 'catalog' | 'schedule' | 'classes' | 'teacher' | 'admin';
  onTabChange: (tab: 'catalog' | 'schedule' | 'classes' | 'teacher' | 'admin') => void;
  onOpenAuthModal: () => void;
  enrolledHours: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  currentEvent,
  activeTab,
  onTabChange,
  onOpenAuthModal,
  enrolledHours
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHoursComplete = enrolledHours >= currentEvent.requiredHours;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onTabChange('catalog')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">GJK Rozvrhovač</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                    {currentEvent.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs">
                  {currentEvent.title}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-catalog"
              onClick={() => onTabChange('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Katalog programů</span>
            </button>

            <button
              id="nav-tab-schedule"
              onClick={() => onTabChange('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Můj rozvrh</span>
              {currentUser.role === 'student' && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  isHoursComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {enrolledHours}/{currentEvent.requiredHours}h
                </span>
              )}
            </button>

            <button
              id="nav-tab-classes"
              onClick={() => onTabChange('classes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'classes'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>Přehled tříd</span>
            </button>

            <button
              id="nav-tab-teacher"
              onClick={() => onTabChange('teacher')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'teacher'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Vyučující</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Administrace</span>
            </button>
          </nav>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Student Hours Badge (Mobile & Desktop) */}
            {currentUser.role === 'student' && (
              <div 
                onClick={() => onTabChange('schedule')}
                className={`cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isHoursComplete 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
                title={`Splněno ${enrolledHours} z ${currentEvent.requiredHours} povinných hodin`}
              >
                {isHoursComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{enrolledHours} / {currentEvent.requiredHours} h</span>
              </div>
            )}

            {/* Profile Dropdown / Switcher */}
            <div className="relative">
              <button
                id="user-profile-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-500"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden lg:block leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'student' 
                      ? `Student (${currentUser.studentClass || 'Bez třídy'})` 
                      : currentUser.role === 'teacher' 
                      ? 'Vyučující' 
                      : 'Organizátor / Admin'}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Přihlášený účet Google
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.studentClass && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                          <span>Třída: {currentUser.studentClass}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Rychlé přepnutí uživatele (Demo)
                      </p>
                      <div className="space-y-1">
                        {DEMO_USERS.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onUserChange(u);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              currentUser.id === u.id
                                ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="truncate">
                              <span className="font-medium">{u.name}</span>
                              <span className="text-slate-400 ml-1">
                                ({u.role === 'student' ? u.studentClass : u.role === 'teacher' ? 'Učitel' : 'Admin'})
                              </span>
                            </div>
                            {currentUser.id === u.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-sky-700 hover:bg-sky-50 transition-colors flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Upravit profil / Vybrat jinou třídu</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Přihlásit jiný Google účet</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-1">
          <button
            onClick={() => {
              onTabChange('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'catalog' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Katalog programů</span>
          </button>

          <button
            onClick={() => {
              onTabChange('schedule');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'schedule' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Můj rozvrh</span>
            </div>
            {currentUser.role === 'student' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isHoursComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {enrolledHours}/{currentEvent.requiredHours}h
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onTabChange('classes');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'classes' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Přehled tříd</span>
          </button>

          <button
            onClick={() => {
              onTabChange('teacher');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'teacher' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Vyučující</span>
          </button>

          <button
            onClick={() => {
              onTabChange('admin');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'admin' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Administrace</span>
          </button>
        </div>
      )}
    </header>
  );
};
