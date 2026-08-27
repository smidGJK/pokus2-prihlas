import React, { useState, useMemo } from 'react';
import { Workshop, WorkshopSession, User, SchoolEvent } from '../types';
import { canEnrollInSession, isClassEligible } from '../services/storageService';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles, 
  BookOpen,
  ArrowUpDown,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface ProgramCatalogProps {
  event: SchoolEvent;
  currentUser: User;
  onEnroll: (workshopId: string, sessionId: string) => void;
  onUnenroll: (workshopId: string, sessionId: string) => void;
  onSelectWorkshop: (workshop: Workshop, session: WorkshopSession) => void;
}

export const ProgramCatalog: React.FC<ProgramCatalogProps> = ({
  event,
  currentUser,
  onEnroll,
  onUnenroll,
  onSelectWorkshop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyMyClass, setOnlyMyClass] = useState(true);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    event.workshops.forEach(w => set.add(w.category));
    return Array.from(set);
  }, [event.workshops]);

  // Flatten sessions with their parent workshop
  const allSessionItems = useMemo(() => {
    const items: { workshop: Workshop; session: WorkshopSession }[] = [];
    event.workshops.forEach(ws => {
      ws.sessions.forEach(sess => {
        items.push({ workshop: ws, session: sess });
      });
    });
    return items;
  }, [event.workshops]);

  // Filtered session items
  const filteredSessions = useMemo(() => {
    return allSessionItems.filter(({ workshop, session }) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = workshop.title.toLowerCase().includes(query);
        const matchTeacher = workshop.teacherName.toLowerCase().includes(query);
        const matchCode = workshop.code.toLowerCase().includes(query);
        const matchRoom = session.room.toLowerCase().includes(query);
        const matchDesc = workshop.description.toLowerCase().includes(query);
        if (!matchTitle && !matchTeacher && !matchCode && !matchRoom && !matchDesc) {
          return false;
        }
      }

      // Day filter
      if (selectedDay !== 'all' && session.day.toLowerCase() !== selectedDay.toLowerCase()) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && workshop.category !== selectedCategory) {
        return false;
      }

      // Only my class
      if (onlyMyClass && currentUser.studentClass) {
        if (!isClassEligible(currentUser.studentClass, workshop.targetClasses)) {
          return false;
        }
      }

      // Only available spots
      if (onlyAvailable) {
        const isFull = session.enrolledStudentIds.length >= session.maxCapacity;
        const isEnrolled = session.enrolledStudentIds.includes(currentUser.id);
        if (isFull && !isEnrolled) {
          return false;
        }
      }

      return true;
    });
  }, [allSessionItems, searchTerm, selectedDay, selectedCategory, onlyMyClass, onlyAvailable, currentUser]);

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Katalog nabízených programů
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Vyberte si workshopy pro svůj individuální rozvrh na akci <span className="font-semibold text-slate-700">{event.title}</span>.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/70 self-start sm:self-auto">
          Nalezeno <strong className="text-slate-900 font-bold">{filteredSessions.length}</strong> termínů
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        {/* Top search & quick day toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Hledat podle názvu, lektora, učebny..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Day Selector */}
          <div className="sm:col-span-3">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedDay('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  selectedDay === 'all' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Všechny dny
              </button>
              {event.days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    selectedDay === day ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
            >
              <option value="all">Všechny obory / kategorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Bottom Filter Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {currentUser.studentClass && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyMyClass}
                  onChange={e => setOnlyMyClass(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span className="font-medium text-slate-700">
                  Pouze pro mou třídu (<span className="font-bold text-sky-700">{currentUser.studentClass}</span>)
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className="font-medium text-slate-700">Pouze volná místa</span>
            </label>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDay('all');
              setSelectedCategory('all');
              setOnlyMyClass(false);
              setOnlyAvailable(false);
            }}
            className="text-xs text-sky-700 hover:text-sky-900 font-medium hover:underline"
          >
            Resetovat filtry
          </button>
        </div>
      </div>

      {/* Grid of Workshop Cards */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Nebyly nalezeny žádné programy
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Zkuste upravit vyhledávací dotaz nebo vypnout filtr třídy a obsazenosti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map(({ workshop, session }) => {
            const isEnrolled = session.enrolledStudentIds.includes(currentUser.id);
            const isClassOk = isClassEligible(currentUser.studentClass, workshop.targetClasses);
            const validation = canEnrollInSession(event, currentUser, workshop, session);
            const spotsLeft = session.maxCapacity - session.enrolledStudentIds.length;
            const isFull = spotsLeft <= 0;
            const occupancyRatio = session.enrolledStudentIds.length / session.maxCapacity;

            return (
              <div
                key={session.id}
                id={`card-workshop-${workshop.id}-${session.id}`}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
                  isEnrolled
                    ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20'
                    : isFull
                    ? 'border-slate-200 bg-slate-50/40 opacity-90'
                    : !isClassOk
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Auto opened badge if applicable */}
                {session.isAutoOpened && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-0.5 text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Nově otevřený dodatečný termín!
                  </div>
                )}

                {/* Card Top */}
                <div 
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => onSelectWorkshop(workshop, session)}
                >
                  
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {workshop.category}
                    </span>
                    
                    {isEnrolled ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Zapsáno
                      </span>
                    ) : isFull ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        Obsazeno
                      </span>
                    ) : spotsLeft <= 2 ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        Poslední {spotsLeft} {spotsLeft === 1 ? 'místo' : 'místa'}
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-sky-700 transition-colors">
                    {workshop.title}
                  </h3>

                  {/* Teacher & Code */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{workshop.teacherName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">{workshop.code}</span>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>

                  {/* Time, Duration & Room Pills */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{session.day} {session.startTime}–{session.endTime}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-700 font-medium justify-end">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{session.durationHours} h</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 col-span-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{session.room}</span>
                    </div>
                  </div>

                  {/* Target Classes Warning / Info */}
                  <div className="mt-2 text-[11px]">
                    {!isClassOk ? (
                      <div className="text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">Pouze pro: {workshop.targetClasses.join(', ')}</span>
                      </div>
                    ) : (
                      <div className="text-slate-500 truncate">
                        Určeno pro: <span className="text-slate-700 font-medium">{workshop.targetClasses.join(', ')}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Card Bottom / Capacity Bar & Action Button */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2.5">
                  {/* Capacity Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                      <span>Kapacita termínu:</span>
                      <span className={`font-bold ${isFull ? 'text-red-600' : 'text-slate-800'}`}>
                        {session.enrolledStudentIds.length} / {session.maxCapacity} ({spotsLeft} volných)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-red-500'
                            : occupancyRatio > 0.8
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancyRatio * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {isEnrolled ? (
                      <button
                        onClick={() => onUnenroll(workshop.id, session.id)}
                        className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors"
                      >
                        Odhlásit se
                      </button>
                    ) : (
                      <button
                        disabled={!validation.allowed}
                        onClick={() => onEnroll(workshop.id, session.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          validation.allowed
                            ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs shadow-sky-600/20 active:scale-[0.98]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        title={!validation.allowed ? validation.reason : 'Přihlásit se na tento program'}
                      >
                        {validation.allowed ? (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Přihlásit ({session.durationHours} h)</span>
                          </>
                        ) : validation.conflictingWorkshopTitle ? (
                          <span className="truncate">⚠️ Kolize v rozvrhu</span>
                        ) : !isClassOk ? (
                          <span className="truncate">🔒 Jiná třída</span>
                        ) : isFull ? (
                          <span>Plně obsazeno</span>
                        ) : (
                          <span>Nelze přihlásit</span>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onSelectWorkshop(workshop, session)}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold shrink-0"
                      title="Zobrazit podrobnou anotaci"
                    >
                      Detail
                    </button>
                  </div>

                  {/* Dynamic repeat note if available */}
                  {workshop.availableRepeatSlots && workshop.availableRepeatSlots.length > 0 && isFull && (
                    <div className="text-[10px] text-indigo-700 flex items-center gap-1 font-medium bg-indigo-50/60 p-1.5 rounded-lg border border-indigo-100">
                      <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>Po naplnění se otevře nový termín vyučujícího!</span>
                    </div>
                  )}

                  {/* Show specific collision note if active */}
                  {!isEnrolled && validation.conflictingWorkshopTitle && (
                    <p className="text-[10px] text-amber-700 leading-tight">
                      ⚠️ Koliduje s: <strong className="font-semibold">{validation.conflictingWorkshopTitle}</strong>
                    </p>
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
