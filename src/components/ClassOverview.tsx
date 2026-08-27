import React, { useState, useMemo } from 'react';
import { SchoolEvent, User } from '../types';
import { ALL_CLASSES, MOCK_STUDENTS_BY_CLASS } from '../data/sampleData';
import { getClassEnrollmentSummary } from '../services/storageService';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Printer, 
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';

interface ClassOverviewProps {
  event: SchoolEvent;
  currentUser: User;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({ event, currentUser }) => {
  // Default to student's own class or first class in list
  const [selectedClass, setSelectedClass] = useState<string>(currentUser.studentClass || '3.A');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete' | 'none'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get data for selected class
  const classSummary = useMemo(() => {
    return getClassEnrollmentSummary(event, selectedClass);
  }, [event, selectedClass]);

  // Aggregate stats
  const totalStudents = classSummary.length;
  const completeCount = classSummary.filter(s => s.profile.isComplete).length;
  const partialCount = classSummary.filter(s => !s.profile.isComplete && s.profile.totalEnrolledHours > 0).length;
  const zeroCount = classSummary.filter(s => s.profile.totalEnrolledHours === 0).length;
  const completionPercentage = totalStudents > 0 ? Math.round((completeCount / totalStudents) * 100) : 0;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return classSummary.filter(({ student, profile }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!student.name.toLowerCase().includes(q) && !student.email.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (filterStatus === 'complete' && !profile.isComplete) return false;
      if (filterStatus === 'incomplete' && (profile.isComplete || profile.totalEnrolledHours === 0)) return false;
      if (filterStatus === 'none' && profile.totalEnrolledHours > 0) return false;

      return true;
    });
  }, [classSummary, searchQuery, filterStatus]);

  // Export CSV for this class
  const handleExportCSV = () => {
    const rows = [
      ['Třída', 'Jméno studenta', 'Email', 'Zapsané hodiny', 'Požadavek', 'Stav', 'Vybrané workshopy'].join(',')
    ];

    classSummary.forEach(({ student, profile, enrolledWorkshops }) => {
      const wsTitles = enrolledWorkshops.map(w => `"${w.title} (${w.day} ${w.time})"`).join('; ');
      rows.push([
        `"${selectedClass}"`,
        `"${student.name}"`,
        `"${student.email}"`,
        profile.totalEnrolledHours,
        event.requiredHours,
        profile.isComplete ? 'Splněno' : 'Nesplněno',
        `"${wsTitles}"`
      ].join(','));
    });

    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prehled_tridy_${selectedClass}_${event.code}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Class Switcher */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Přehled přihlášení podle tříd
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {selectedClass}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring plnění hodinové dotace jednotlivých studentů třídy pro třídní učitele a vedení.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Vybrat třídu:</label>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setExpandedStudentId(null);
              }}
              className="py-2 px-3 text-sm rounded-xl border border-slate-300 bg-white font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
            >
              {ALL_CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Class Statistics KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Celkem studentů</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ve třídě {selectedClass}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Splněná dotace (6h+)</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completeCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{completionPercentage}% třídy</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Rozpracováno</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{partialCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Chybí část hodin</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Zatím nepřihlášeni</div>
          <div className="text-2xl font-extrabold text-slate-400 mt-1">{zeroCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">0 zapsaných hodin</div>
        </div>
      </div>

      {/* Progress Bar of the Class */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Celkový postup přihlašování třídy {selectedClass}</span>
          <span className="text-sky-700 font-bold">{completionPercentage}% splněno</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${totalStudents > 0 ? (completeCount / totalStudents) * 100 : 0}%` }}
            title={`Splněno: ${completeCount} studentů`}
          />
          <div
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${totalStudents > 0 ? (partialCount / totalStudents) * 100 : 0}%` }}
            title={`Rozpracováno: ${partialCount} studentů`}
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Search & Status Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Hledat studenta..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Všichni ({classSummary.length})
            </button>
            <button
              onClick={() => setFilterStatus('complete')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'complete' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Splněno ({completeCount})
            </button>
            <button
              onClick={() => setFilterStatus('incomplete')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'incomplete' ? 'bg-white text-amber-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Neúplné ({partialCount})
            </button>
          </div>
        </div>

        {/* Table Body */}
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            Pro zvolené filtry nebyli nalezeni žádní studenti.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map(({ student, profile, enrolledWorkshops }) => {
              const isExpanded = expandedStudentId === student.id;

              return (
                <div key={student.id} className="transition-colors hover:bg-slate-50/70">
                  
                  {/* Student Row */}
                  <div 
                    onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Hours pill */}
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900">
                          {profile.totalEnrolledHours} / {event.requiredHours} h
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {enrolledWorkshops.length} {enrolledWorkshops.length === 1 ? 'workshop' : 'workshopů'}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {profile.isComplete ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Splněno</span>
                          </span>
                        ) : profile.totalEnrolledHours > 0 ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chybí {event.requiredHours - profile.totalEnrolledHours} h</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Nezapsáno
                          </span>
                        )}
                      </div>

                      {/* Toggle arrow */}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Scheduled Workshops */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs space-y-2 animate-in slide-in-from-top-1">
                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                        Zapsané workshopy studenta ({enrolledWorkshops.length}):
                      </div>
                      {enrolledWorkshops.length === 0 ? (
                        <p className="text-slate-400 italic">Student nemá zapsaný žádný workshop.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {enrolledWorkshops.map((ws, i) => (
                            <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                              <div className="font-bold text-slate-900">{ws.title}</div>
                              <div className="text-slate-600 text-[11px] flex items-center gap-2">
                                <span className="font-medium">{ws.day} {ws.time}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold">{ws.room}</span>
                                <span>•</span>
                                <span className="text-slate-400">{ws.hours} h</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
