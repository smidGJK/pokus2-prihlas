import React, { useState } from 'react';
import { SchoolEvent, Workshop, WorkshopCategory } from '../types';
import { parseCSV, formatGoogleSheetUrl, SAMPLE_CSV_TEMPLATE } from '../services/sheetParser';
import { INITIAL_EVENT, ALL_CLASSES } from '../data/sampleData';
import { 
  Settings, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  BarChart3, 
  Save, 
  Database,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  event: SchoolEvent;
  onUpdateEvent: (event: SchoolEvent) => void;
  onResetToDemo: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  event,
  onUpdateEvent,
  onResetToDemo
}) => {
  // Event meta state
  const [title, setTitle] = useState(event.title);
  const [subtitle, setSubtitle] = useState(event.subtitle);
  const [code, setCode] = useState(event.code);
  const [requiredHours, setRequiredHours] = useState(event.requiredHours);
  const [dateRange, setDateRange] = useState(event.dateRange);
  const [sheetUrl, setSheetUrl] = useState(event.googleSheetUrl || '');
  const [isOpen, setIsOpen] = useState(event.isOpen);

  // Import state
  const [csvInput, setCsvInput] = useState('');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'sheets' | 'workshops' | 'stats'>('sheets');

  // Stats
  let totalCapacity = 0;
  let totalEnrolled = 0;
  let totalSessions = 0;
  let autoOpenedCount = 0;

  event.workshops.forEach(w => {
    w.sessions.forEach(s => {
      totalCapacity += s.maxCapacity;
      totalEnrolled += s.enrolledStudentIds.length;
      totalSessions += 1;
      if (s.isAutoOpened) autoOpenedCount += 1;
    });
  });

  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Save Event Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolEvent = {
      ...event,
      title,
      subtitle,
      code,
      requiredHours,
      dateRange,
      googleSheetUrl: sheetUrl,
      isOpen
    };
    onUpdateEvent(updated);
    setImportSuccessMsg('Nastavení akce bylo úspěšně uloženo!');
    setTimeout(() => setImportSuccessMsg(null), 3000);
  };

  // Import from CSV text
  const handleImportCSVText = (textToImport: string) => {
    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    try {
      const parsedWorkshops = parseCSV(textToImport);
      if (parsedWorkshops.length === 0) {
        setImportErrorMsg('Z tabulky se nepodařilo načíst žádné platné řádky programů. Zkontrolujte formát CSV.');
        return;
      }

      const updated: SchoolEvent = {
        ...event,
        title,
        workshops: parsedWorkshops
      };

      onUpdateEvent(updated);
      setImportSuccessMsg(`Úspěšně importováno ${parsedWorkshops.length} programů a workshopů z Google tabulky!`);
      setCsvInput('');
    } catch (err: any) {
      setImportErrorMsg(`Chyba při parsování: ${err.message || 'Neznámá chyba'}`);
    }
  };

  // Live Fetch public Google Sheet CSV
  const handleFetchGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setImportErrorMsg('Zadejte prosím odkaz na sdílenou Google tabulku.');
      return;
    }

    setIsFetchingSheet(true);
    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    try {
      const exportUrl = formatGoogleSheetUrl(sheetUrl);
      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error(`Google Sheets HTTP status: ${res.status}. Ujistěte se, že je tabulka nasdílená pro čtení komukoliv s odkazem.`);
      }
      const csvText = await res.text();
      handleImportCSVText(csvText);
    } catch (err: any) {
      setImportErrorMsg(
        `Nepodařilo se stáhnout tabulku přímo (CORS nebo soukromá tabulka): ${err.message}. Můžete však v Google Sheets zvolit 'Soubor -> Stáhnout -> Hodnoty oddělené čárkami (.csv)' a vložit text níže.`
      );
    } finally {
      setIsFetchingSheet(false);
    }
  };

  // Download Sample CSV
  const handleDownloadSample = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sablona_Programy_GJK.csv';
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
              Administrace akce & Google Tabulek
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Správce
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nastavení parametrů akce, hodinových limitů, import programů z Google Sheets a správa kapacit.
          </p>
        </div>

        <button
          onClick={onResetToDemo}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto"
          title="Obnovit výchozí ukázková data akce"
        >
          <Database className="w-4 h-4 text-slate-500" />
          <span>Obnovit ukázková data GJK</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold gap-1 max-w-xl">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sheets' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Tabulka (Import)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <Settings className="w-4 h-4 text-sky-600" />
          <span>Parametry akce</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'stats' ? 'bg-white text-sky-900 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span>Statistiky kapacit</span>
        </button>
      </div>

      {/* Notifications */}
      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {importErrorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{importErrorMsg}</span>
        </div>
      )}

      {/* TAB 1: GOOGLE SHEETS IMPORT */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          
          {/* Link Google Sheet Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Propojení s Google Tabulkou
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aplikace bude čerpat nabízené programy, kapacity, výchozí časy, cílové třídy a opakování z tabulky.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadSample}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Stáhnout šablonu CSV</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Odkaz na sdílenou Google Tabulku (Google Sheets URL):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-700"
                />
                <button
                  onClick={handleFetchGoogleSheet}
                  disabled={isFetchingSheet}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isFetchingSheet ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Načíst data z tabulky</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Tip: Tabulka musí být nastavena na <em>„Kdokoli má odkaz může prohlížet“</em>.
              </p>
            </div>

            {/* Direct CSV text paste option */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Nebo vložte obsah CSV tabulky přímo:</span>
                <span className="text-[11px] text-slate-400">Oddělovač čárka (,) nebo středník (;)</span>
              </label>
              <textarea
                rows={5}
                value={csvInput}
                onChange={e => setCsvInput(e.target.value)}
                placeholder={SAMPLE_CSV_TEMPLATE}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCsvInput(SAMPLE_CSV_TEMPLATE)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100"
                >
                  Vložit ukázkový formát
                </button>
                <button
                  disabled={!csvInput.trim()}
                  onClick={() => handleImportCSVText(csvInput)}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold disabled:opacity-40"
                >
                  Importovat vložené CSV
                </button>
              </div>
            </div>
          </div>

          {/* Current Live Imported Workshops Table Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Aktuálně nahrané programy ({event.workshops.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Přehled workshopů, termínů a nastavení opakování v aktuální paměti akce.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Kód</th>
                    <th className="py-2.5 px-3">Název workshopu</th>
                    <th className="py-2.5 px-3">Vyučující</th>
                    <th className="py-2.5 px-3">Termíny & Čas</th>
                    <th className="py-2.5 px-3">Kapacita</th>
                    <th className="py-2.5 px-3">Cílové třídy</th>
                    <th className="py-2.5 px-3">Volné opakování</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {event.workshops.map(ws => (
                    <tr key={ws.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ws.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 max-w-[200px] truncate">{ws.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{ws.teacherName}</td>
                      <td className="py-2.5 px-3 text-sky-800 font-semibold">
                        {ws.sessions.map(s => `${s.day} ${s.startTime}-${s.endTime} (${s.room})`).join('; ')}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {ws.sessions.map(s => `${s.enrolledStudentIds.length}/${s.maxCapacity}`).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[150px] truncate">
                        {ws.targetClasses.join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-indigo-700">
                        {ws.availableRepeatSlots && ws.availableRepeatSlots.length > 0 ? (
                          <span className="flex items-center gap-1 font-semibold">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            {ws.availableRepeatSlots.length} termín ({ws.availableRepeatSlots[0].day} {ws.availableRepeatSlots[0].startTime})
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EVENT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Základní parametry akce
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Název akce</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kód / Zkratka akce</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Podtitul / Anotace akce</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Datum konání</label>
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Povinná hodinová dotace na studenta (hodiny)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="20"
                required
                value={requiredHours}
                onChange={e => setRequiredHours(parseFloat(e.target.value) || 6)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 font-bold"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={e => setIsOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Přihlašování pro studenty je otevřené a aktivní
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Uložit změny</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Celková kapacita míst</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCapacity}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Počet přihlášek</div>
              <div className="text-2xl font-extrabold text-sky-600 mt-1">{totalEnrolled}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Celková vytíženost</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{occupancyRate}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Auto-otevřené termíny</div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{autoOpenedCount}</div>
            </div>
          </div>

          {/* Top Workshops by Occupancy */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Vytíženost jednotlivých workshopů
            </h3>

            <div className="space-y-3">
              {event.workshops.map(ws => {
                const totalWsCap = ws.sessions.reduce((a, s) => a + s.maxCapacity, 0);
                const totalWsEnrolled = ws.sessions.reduce((a, s) => a + s.enrolledStudentIds.length, 0);
                const ratio = totalWsCap > 0 ? Math.round((totalWsEnrolled / totalWsCap) * 100) : 0;

                return (
                  <div key={ws.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate max-w-md">{ws.title} ({ws.teacherName})</span>
                      <span className="text-slate-600">{totalWsEnrolled} / {totalWsCap} ({ratio}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ratio >= 100 ? 'bg-red-500' : ratio > 75 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
