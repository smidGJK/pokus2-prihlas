import React, { useState, useMemo } from 'react';
import { SchoolEvent, User, Workshop, WorkshopSession } from '../types';
import { DEMO_USERS, MOCK_STUDENTS_BY_CLASS } from '../data/sampleData';
import { 
  UserCheck, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Download, 
  Printer, 
  Sparkles, 
  User as UserIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface TeacherDashboardProps {
  event: SchoolEvent;
  currentUser: User;
  onOpenNextRepeatSession?: (workshopId: string) => void;
  onUpdateEvent: (event: SchoolEvent) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  event,
  currentUser,
  onOpenNextRepeatSession,
  onUpdateEvent
}) => {
  // Allow selecting active teacher to view, defaulting to currentUser if teacher
  const allTeachers = useMemo(() => {
    const map = new Map<string, string>();
    event.workshops.forEach(w => {
      map.set(w.teacherEmail, w.teacherName);
    });
    return Array.from(map.entries()).map(([email, name]) => ({ email, name }));
  }, [event.workshops]);

  const defaultTeacherEmail = currentUser.role === 'teacher' ? currentUser.email : (allTeachers[0]?.email || 'smid@gjk.cz');
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState<string>(defaultTeacherEmail);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  // Filter workshops for selected teacher
  const teacherWorkshops = useMemo(() => {
    return event.workshops.filter(w => w.teacherEmail.toLowerCase() === selectedTeacherEmail.toLowerCase());
  }, [event.workshops, selectedTeacherEmail]);

  // Helper to get student info by ID
  const getStudentInfo = (studentId: string) => {
    for (const [cls, students] of Object.entries(MOCK_STUDENTS_BY_CLASS)) {
      const found = students.find(s => s.id === studentId);
      if (found) return { ...found, studentClass: cls };
    }
    const demo = DEMO_USERS.find(u => u.id === studentId);
    if (demo) return { id: demo.id, name: demo.name, email: demo.email, studentClass: demo.studentClass || 'Nezadáno' };

    return { id: studentId, name: `Student (${studentId.slice(0, 6)})`, email: 'student@gjk.cz', studentClass: '3.A' };
  };

  const toggleAttendance = (sessionId: string, studentId: string) => {
    const key = `${sessionId}_${studentId}`;
    setAttendance(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Manually open next repeat slot
  const handleOpenRepeatEarly = (workshop: Workshop) => {
    if (!workshop.availableRepeatSlots || workshop.availableRepeatSlots.length === 0) return;

    const nextSlot = workshop.availableRepeatSlots[0];
    const updatedEvent: SchoolEvent = JSON.parse(JSON.stringify(event));
    const targetWs = updatedEvent.workshops.find(w => w.id === workshop.id);
    if (!targetWs || !targetWs.availableRepeatSlots) return;

    targetWs.availableRepeatSlots.shift(); // Remove used slot
    const newSessionNum = targetWs.sessions.length + 1;
    
    targetWs.sessions.push({
      id: `sess-${targetWs.id}-${newSessionNum}`,
      workshopId: targetWs.id,
      sessionNumber: newSessionNum,
      day: nextSlot.day,
      startTime: nextSlot.startTime,
      endTime: nextSlot.endTime,
      durationHours: nextSlot.durationHours,
      room: nextSlot.room,
      maxCapacity: targetWs.sessions[0]?.maxCapacity || 15,
      enrolledStudentIds: [],
      isAutoOpened: true
    });

    onUpdateEvent(updatedEvent);
  };

  // Export attendance CSV
  const handleExportAttendance = (workshop: Workshop, session: WorkshopSession) => {
    const rows = [
      ['Workshop', 'Termín', 'Místnost', 'Jméno studenta', 'Třída', 'Email', 'Přítomen'].join(',')
    ];

    session.enrolledStudentIds.forEach(stId => {
      const st = getStudentInfo(stId);
      const isPresent = attendance[`${session.id}_${stId}`] ? 'ANO' : 'NE';
      rows.push([
        `"${workshop.title}"`,
        `"${session.day} ${session.startTime}-${session.endTime}"`,
        `"${session.room}"`,
        `"${st.name}"`,
        `"${st.studentClass}"`,
        `"${st.email}"`,
        isPresent
      ].join(','));
    });

    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prezence_${workshop.code}_Termin${session.sessionNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Portál vyučujícího / lektora
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Vedení workshopů
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Přehled vedených workshopů, obsazenost termínů a prezenční listiny zapsaných studentů.
          </p>
        </div>

        {/* Teacher Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Vyučující:</label>
          <select
            value={selectedTeacherEmail}
            onChange={e => setSelectedTeacherEmail(e.target.value)}
            className="py-2 px-3 text-sm rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          >
            {allTeachers.map(t => (
              <option key={t.email} value={t.email}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List of Teacher Workshops */}
      {teacherWorkshops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Žádné přiřazené programy
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Pro vyučujícího {selectedTeacherEmail} nejsou v importované tabulce zapsány žádné programy.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {teacherWorkshops.map(ws => {
            const hasRepeatSlots = ws.availableRepeatSlots && ws.availableRepeatSlots.length > 0;

            return (
              <div key={ws.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                
                {/* Workshop Header */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
                        {ws.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {ws.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{ws.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl line-clamp-2">
                      {ws.description}
                    </p>
                  </div>

                  {/* Manual repeat button */}
                  {hasRepeatSlots && (
                    <button
                      onClick={() => handleOpenRepeatEarly(ws)}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0"
                    >
                      <PlusCircle className="w-4 h-4 text-indigo-600" />
                      <span>Otevřít další termín ({ws.availableRepeatSlots![0].day} {ws.availableRepeatSlots![0].startTime})</span>
                    </button>
                  )}
                </div>

                {/* Sessions Cards */}
                <div className="p-5 sm:p-6 space-y-6">
                  {ws.sessions.map(session => {
                    const spotsLeft = session.maxCapacity - session.enrolledStudentIds.length;
                    const isFull = spotsLeft <= 0;

                    return (
                      <div key={session.id} className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs space-y-4">
                        
                        {/* Session Details Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center text-sm">
                              #{session.sessionNumber}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span>{session.day} {session.startTime} – {session.endTime}</span>
                                <span className="text-xs font-medium text-slate-500">({session.durationHours} hod.)</span>
                              </div>
                              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{session.room}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-xs">
                              <span className="text-slate-500">Obsazenost: </span>
                              <strong className={isFull ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                                {session.enrolledStudentIds.length} / {session.maxCapacity} studentů
                              </strong>
                            </div>

                            <button
                              onClick={() => handleExportAttendance(ws, session)}
                              disabled={session.enrolledStudentIds.length === 0}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                              title="Exportovat prezenční listinu do CSV"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Prezence CSV</span>
                            </button>
                          </div>
                        </div>

                        {/* Attendance Student List */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Seznam zapsaných studentů ({session.enrolledStudentIds.length})</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              Zaškrtněte pro evidenci přítomnosti
                            </span>
                          </h4>

                          {session.enrolledStudentIds.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-3">
                              Zatím se na tento termín nepřihlásil žádný student.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {session.enrolledStudentIds.map(stId => {
                                const st = getStudentInfo(stId);
                                const isChecked = !!attendance[`${session.id}_${stId}`];

                                return (
                                  <div
                                    key={stId}
                                    onClick={() => toggleAttendance(session.id, stId)}
                                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                                      isChecked
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                        : 'bg-slate-50/50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="truncate">
                                      <div className="text-xs font-bold truncate">{st.name}</div>
                                      <div className="text-[10px] text-slate-500 font-medium">Třída {st.studentClass}</div>
                                    </div>

                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
