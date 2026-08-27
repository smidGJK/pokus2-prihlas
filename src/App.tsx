import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, SchoolEvent, Workshop, WorkshopSession } from './types';
import { 
  getStoredEvent, 
  saveStoredEvent, 
  getStoredUser, 
  saveStoredUser, 
  enrollStudentInSession, 
  unenrollStudentFromSession,
  getStudentProfile
} from './services/storageService';
import { INITIAL_EVENT } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { HoursProgressBar } from './components/HoursProgressBar';
import { ProgramCatalog } from './components/ProgramCatalog';
import { ScheduleView } from './components/ScheduleView';
import { ClassOverview } from './components/ClassOverview';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { LoginModal } from './components/LoginModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  X,
  GraduationCap
} from 'lucide-react';

export default function App() {
  const [event, setEvent] = useState<SchoolEvent>(getStoredEvent);
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser);
  const [activeTab, setActiveTab] = useState<'catalog' | 'schedule' | 'classes' | 'teacher' | 'admin'>('catalog');
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<{ workshop: Workshop; session: WorkshopSession } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

  // Calculate current student profile
  const studentProfile = getStudentProfile(event, currentUser);
  const enrolledHours = studentProfile.totalEnrolledHours;

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    saveStoredUser(newUser);
    showToast('info', 'Změna profilu', `Nyní jste přihlášeni jako ${newUser.name} (${newUser.role === 'student' ? newUser.studentClass : newUser.role})`);
  };

  const handleEnroll = (workshopId: string, sessionId: string) => {
    const prevHours = studentProfile.totalEnrolledHours;
    const { updatedEvent, autoOpenedSession, error } = enrollStudentInSession(event, currentUser, workshopId, sessionId);

    if (error) {
      showToast('error', 'Přihlášení se nezdařilo', error);
      return;
    }

    setEvent(updatedEvent);

    const workshop = updatedEvent.workshops.find(w => w.id === workshopId);
    const session = workshop?.sessions.find(s => s.id === sessionId);
    const newProfile = getStudentProfile(updatedEvent, currentUser);

    showToast('success', 'Úspěšně zapsáno!', `Byli jste přihlášeni na "${workshop?.title}" (${session?.day} ${session?.startTime}–${session?.endTime}).`);

    // Check if student just fulfilled their quota -> trigger celebratory confetti!
    if (prevHours < updatedEvent.requiredHours && newProfile.totalEnrolledHours >= updatedEvent.requiredHours) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }

    // Auto-opened repeat session announcement
    if (autoOpenedSession) {
      showToast(
        'info',
        'Kapacita naplněna – Otevřen další termín!',
        `Program "${workshop?.title}" byl zcela zaplněn. Systém automaticky otevřel nový termín na ${autoOpenedSession.day} ${autoOpenedSession.startTime}–${autoOpenedSession.endTime}!`
      );
    }
  };

  const handleUnenroll = (workshopId: string, sessionId: string) => {
    const updatedEvent = unenrollStudentFromSession(event, currentUser.id, workshopId, sessionId);
    setEvent(updatedEvent);

    const workshop = event.workshops.find(w => w.id === workshopId);
    showToast('info', 'Odhlášeno', `Byli jste odhlášeni z programu "${workshop?.title}".`);
  };

  const handleUpdateEvent = (updatedEvent: SchoolEvent) => {
    setEvent(updatedEvent);
    saveStoredEvent(updatedEvent);
  };

  const handleResetToDemo = () => {
    setEvent(INITIAL_EVENT);
    saveStoredEvent(INITIAL_EVENT);
    showToast('success', 'Obnoveno', 'Výchozí data akce GJK byla úspěšně obnovena.');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        currentEvent={event}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        enrolledHours={enrolledHours}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hours Progress Bar banner (Shown on Catalog & Schedule for students) */}
        {(activeTab === 'catalog' || activeTab === 'schedule') && (
          <HoursProgressBar
            currentUser={currentUser}
            event={event}
            enrolledHours={enrolledHours}
            onViewSchedule={() => setActiveTab('schedule')}
            onViewCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* Tab 1: Catalog */}
        {activeTab === 'catalog' && (
          <ProgramCatalog
            event={event}
            currentUser={currentUser}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            onSelectWorkshop={(ws, sess) => setSelectedWorkshop({ workshop: ws, session: sess })}
          />
        )}

        {/* Tab 2: Schedule */}
        {activeTab === 'schedule' && (
          <ScheduleView
            event={event}
            currentUser={currentUser}
            onUnenroll={handleUnenroll}
            onSelectWorkshop={(ws, sess) => setSelectedWorkshop({ workshop: ws, session: sess })}
            onGoToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* Tab 3: Class Overview */}
        {activeTab === 'classes' && (
          <ClassOverview
            event={event}
            currentUser={currentUser}
          />
        )}

        {/* Tab 4: Teacher Dashboard */}
        {activeTab === 'teacher' && (
          <TeacherDashboard
            event={event}
            currentUser={currentUser}
            onUpdateEvent={handleUpdateEvent}
          />
        )}

        {/* Tab 5: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            event={event}
            onUpdateEvent={handleUpdateEvent}
            onResetToDemo={handleResetToDemo}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
              G
            </div>
            <span className="font-semibold text-slate-700">Gymnázium Jana Keplera</span>
            <span>•</span>
            <span>Systém přihlašování na akce školy</span>
          </div>
          <div>
            Napojeno na Google Tabulky & Google Workspace účty (@gjk.cz)
          </div>
        </div>
      </footer>

      {/* Program Detail Modal */}
      {selectedWorkshop && (
        <ProgramDetailModal
          workshop={selectedWorkshop.workshop}
          selectedSession={selectedWorkshop.session}
          onClose={() => setSelectedWorkshop(null)}
          currentUser={currentUser}
          event={event}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
        />
      )}

      {/* Login & Verification Modal */}
      <LoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleUserChange}
        event={event}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-3 duration-200 flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            toast.type === 'success' 
              ? 'bg-emerald-100 text-emerald-700' 
              : toast.type === 'error' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-sky-100 text-sky-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
