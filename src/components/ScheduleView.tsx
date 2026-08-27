import React, { useMemo } from 'react';
import { Workshop, WorkshopSession, User, SchoolEvent } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Printer, 
  Download, 
  Share2, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ScheduleViewProps {
  event: SchoolEvent;
  currentUser: User;
  onUnenroll: (workshopId: string, sessionId: string) => void;
  onSelectWorkshop: (workshop: Workshop, session: WorkshopSession) => void;
  onGoToCatalog: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  event,
  currentUser,
  onUnenroll,
  onSelectWorkshop,
  onGoToCatalog
}) => {
  // Find all sessions currently enrolled by student
  const enrolledItems = useMemo(() => {
    const list: { workshop: Workshop; session: WorkshopSession }[] = [];
    event.workshops.forEach(ws => {
      ws.sessions.forEach(sess => {
        if (sess.enrolledStudentIds.includes(currentUser.id)) {
          list.push({ workshop: ws, session: sess });
        }
      });
    });

    // Sort by day and start time
    const dayOrder: Record<string, number> = { 'Čtvrtek': 1, 'Pátek': 2, 'Středa': 3, 'Úterý': 4, 'Pondělí': 5 };
    list.sort((a, b) => {
      const orderA = dayOrder[a.session.day] || 99;
      const orderB = dayOrder[b.session.day] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.session.startTime.localeCompare(b.session.startTime);
    });

    return list;
  }, [event.workshops, currentUser.id]);

  const totalHours = useMemo(() => {
    const sum = enrolledItems.reduce((acc, curr) => acc + curr.session.durationHours, 0);
    return Math.round(sum * 10) / 10;
  }, [enrolledItems]);

  const isFulfilled = totalHours >= event.requiredHours;

  // Group by day for timeline matrix
  const itemsByDay = useMemo(() => {
    const map: Record<string, { workshop: Workshop; session: WorkshopSession }[]> = {};
    event.days.forEach(d => {
      map[d] = [];
    });
    enrolledItems.forEach(item => {
      if (!map[item.session.day]) map[item.session.day] = [];
      map[item.session.day].push(item);
    });
    return map;
  }, [event.days, enrolledItems]);

  // Export to .ics calendar format
  const handleDownloadICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GJK Praha//Rozvrh Akci//CS',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Rozvrh - ${event.title}`
    ];

    // Reference dates for 2026 event
    const dayDateMap: Record<string, string> = {
      'Čtvrtek': '20261022',
      'Pátek': '20261023',
      'Středa': '20261021',
      'Úterý': '20261020',
      'Pondělí': '20261019'
    };

    enrolledItems.forEach(({ workshop, session }) => {
      const dateStr = dayDateMap[session.day] || '20261022';
      const startClean = session.startTime.replace(':', '') + '00';
      const endClean = session.endTime.replace(':', '') + '00';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${session.id}@gjk.cz`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dateStr}T${startClean}`,
        `DTEND:${dateStr}T${endClean}`,
        `SUMMARY:${workshop.title}`,
        `DESCRIPTION:Vyučující: ${workshop.teacherName}\\nAnotace: ${workshop.description.replace(/\n/g, ' ')}`,
        `LOCATION:${session.room}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rozvrh_${currentUser.name.replace(/\s+/g, '_')}_${event.code}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Controls */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Individuální rozvrh
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {currentUser.name} ({currentUser.studentClass || 'Bez třídy'})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {event.title} • {event.dateRange}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-print-schedule"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Vytisknout rozvrh</span>
          </button>

          <button
            id="btn-export-ics"
            onClick={handleDownloadICS}
            disabled={enrolledItems.length === 0}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Do kalendáře (.ics)</span>
          </button>
        </div>
      </div>

      {/* Schedule Status & Hours Quota */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Zapsaný rozsah</div>
            <div className="text-lg font-extrabold text-slate-900">
              {totalHours} / {event.requiredHours} hod.
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Počet programů</div>
            <div className="text-lg font-extrabold text-slate-900">
              {enrolledItems.length} workshopů
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isFulfilled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isFulfilled ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Stav povinnosti</div>
            <div className={`text-sm font-bold ${isFulfilled ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isFulfilled ? 'Splněno' : `Chybí ${Math.max(0, event.requiredHours - totalHours)} h`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Timetable Matrix View */}
      {enrolledItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Zatím nemáte vybrané žádné programy
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5">
            Přejděte do katalogu a vyberte si workshopy podle svého zájmu tak, abyste splnili minimální počet {event.requiredHours} hodin.
          </p>
          <button
            onClick={onGoToCatalog}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Přejít k výběru programů</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {event.days.map(day => {
            const dayItems = itemsByDay[day] || [];
            const dayTotal = dayItems.reduce((acc, i) => acc + i.session.durationHours, 0);

            return (
              <div key={day} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                
                {/* Day Header */}
                <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <h2 className="font-extrabold text-slate-900 text-base">{day}</h2>
                    <span className="text-xs text-slate-500">
                      ({dayItems.length} {dayItems.length === 1 ? 'program' : 'programy'})
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    Celkem: {dayTotal} hod.
                  </span>
                </div>

                {/* Day Timeline Items */}
                <div className="p-4 sm:p-6">
                  {dayItems.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-400 font-medium">Na {day.toLowerCase()} nemáte zapsaný žádný program.</p>
                      <button
                        onClick={onGoToCatalog}
                        className="mt-2 text-xs text-sky-600 font-bold hover:underline"
                      >
                        + Přidat program na {day}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayItems.map(({ workshop, session }) => (
                        <div
                          key={session.id}
                          className="bg-white rounded-2xl border-2 border-sky-100 p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            {/* Time & Category */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 font-bold text-sky-900 text-sm">
                                <Clock className="w-4 h-4 text-sky-600" />
                                <span>{session.startTime} – {session.endTime}</span>
                                <span className="text-xs text-slate-400 font-normal">({session.durationHours}h)</span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {workshop.category}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 
                              onClick={() => onSelectWorkshop(workshop, session)}
                              className="font-bold text-slate-900 text-base leading-snug cursor-pointer group-hover:text-sky-700 transition-colors"
                            >
                              {workshop.title}
                            </h3>

                            {/* Meta */}
                            <div className="space-y-1 mt-2 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-medium">{workshop.teacherName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{session.room}</span>
                              </div>
                            </div>

                            {/* Short Annotation */}
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                              {workshop.description}
                            </p>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => onSelectWorkshop(workshop, session)}
                              className="text-xs text-sky-700 font-semibold hover:underline"
                            >
                              Zobrazit detail
                            </button>

                            <button
                              onClick={() => onUnenroll(workshop.id, session.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                              title="Odhlásit z tohoto programu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Odhlásit</span>
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
