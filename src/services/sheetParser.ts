import { Workshop, WorkshopSession, RepeatSlot, WorkshopCategory } from '../types';

export interface ParsedSheetRow {
  code: string;
  title: string;
  teacherName: string;
  teacherEmail: string;
  category: string;
  description: string;
  day: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  room: string;
  maxCapacity: number;
  targetClasses: string;
  repeatSlots?: string; // e.g. "Pátek 10:15-11:45 | U12, Pátek 12:30-14:00 | U12"
}

export function parseCSV(csvText: string): Workshop[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  
  // Find column indices with fuzzy Czech / English matching
  const colIndex = {
    code: findColIndex(headers, ['kód', 'kod', 'id', 'code']),
    title: findColIndex(headers, ['název', 'nazev', 'title', 'program', 'workshop']),
    teacherName: findColIndex(headers, ['vyučující', 'vyucujici', 'lektor', 'učitel', 'ucitel', 'teacher']),
    teacherEmail: findColIndex(headers, ['email', 'e-mail', 'mail']),
    category: findColIndex(headers, ['kategorie', 'obor', 'category']),
    description: findColIndex(headers, ['popis', 'anotace', 'description', 'detail']),
    day: findColIndex(headers, ['den', 'day']),
    startTime: findColIndex(headers, ['od', 'start', 'čas od', 'cas od', 'starttime']),
    endTime: findColIndex(headers, ['do', 'end', 'čas do', 'cas do', 'endtime']),
    durationHours: findColIndex(headers, ['délka', 'delka', 'hodiny', 'duration', 'hours']),
    room: findColIndex(headers, ['místnost', 'mistnost', 'učebna', 'ucebna', 'room']),
    maxCapacity: findColIndex(headers, ['kapacita', 'max', 'počet míst', 'pocet mist', 'capacity']),
    targetClasses: findColIndex(headers, ['třídy', 'tridy', 'určeno pro', 'urceno pro', 'cílová skupina', 'cilova skupina', 'target']),
    repeatSlots: findColIndex(headers, ['opakování', 'opakovani', 'další termíny', 'dalsi terminy', 'repeat', 'volný čas', 'volny cas'])
  };

  const workshopsMap = new Map<string, Workshop>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length === 0 || !cols.some(c => c.trim().length > 0)) continue;

    const title = getColValue(cols, colIndex.title) || `Program ${i}`;
    const code = getColValue(cols, colIndex.code) || `WS-${i.toString().padStart(2, '0')}`;
    const teacherName = getColValue(cols, colIndex.teacherName) || 'Vyučující';
    const teacherEmail = getColValue(cols, colIndex.teacherEmail) || 'info@gjk.cz';
    const description = getColValue(cols, colIndex.description) || 'Bez anotace.';
    const categoryRaw = getColValue(cols, colIndex.category);
    const category = sanitizeCategory(categoryRaw);
    
    const day = getColValue(cols, colIndex.day) || 'Čtvrtek';
    const startTime = normalizeTime(getColValue(cols, colIndex.startTime) || '08:30');
    const endTime = normalizeTime(getColValue(cols, colIndex.endTime) || '10:00');
    
    let duration = parseFloat(getColValue(cols, colIndex.durationHours) || '1.5');
    if (isNaN(duration) || duration <= 0) {
      duration = calculateDurationFromTimes(startTime, endTime);
    }

    const room = getColValue(cols, colIndex.room) || 'Učebna';
    const capacityRaw = parseInt(getColValue(cols, colIndex.maxCapacity) || '15', 10);
    const maxCapacity = isNaN(capacityRaw) ? 15 : capacityRaw;

    const targetClassesRaw = getColValue(cols, colIndex.targetClasses) || 'Všechny';
    const targetClasses = targetClassesRaw
      .split(/[,;|]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const repeatSlotsRaw = getColValue(cols, colIndex.repeatSlots) || '';
    const repeatSlots = parseRepeatSlots(repeatSlotsRaw, room, duration);

    const workshopKey = `${title}-${teacherName}`;

    if (!workshopsMap.has(workshopKey)) {
      const workshopId = `ws-imported-${i}`;
      const session1: WorkshopSession = {
        id: `sess-${workshopId}-1`,
        workshopId,
        sessionNumber: 1,
        day,
        startTime,
        endTime,
        durationHours: duration,
        room,
        maxCapacity,
        enrolledStudentIds: []
      };

      workshopsMap.set(workshopKey, {
        id: workshopId,
        code,
        title,
        teacherName,
        teacherEmail,
        description,
        category,
        targetClasses: targetClasses.length > 0 ? targetClasses : ['Všechny'],
        sessions: [session1],
        availableRepeatSlots: repeatSlots
      });
    } else {
      // Additional session for existing workshop from another line
      const existing = workshopsMap.get(workshopKey)!;
      const sessionNum = existing.sessions.length + 1;
      existing.sessions.push({
        id: `sess-${existing.id}-${sessionNum}`,
        workshopId: existing.id,
        sessionNumber: sessionNum,
        day,
        startTime,
        endTime,
        durationHours: duration,
        room,
        maxCapacity,
        enrolledStudentIds: []
      });
    }
  }

  return Array.from(workshopsMap.values());
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  result.push(curr.trim());
  return result;
}

function findColIndex(headers: string[], candidates: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    for (const c of candidates) {
      if (h.includes(c)) return i;
    }
  }
  return -1;
}

function getColValue(cols: string[], index: number): string {
  if (index >= 0 && index < cols.length) {
    return cols[index];
  }
  return '';
}

function normalizeTime(timeStr: string): string {
  const clean = timeStr.replace(/[^0-9:]/g, '');
  if (!clean.includes(':') && clean.length <= 2) {
    return `${clean.padStart(2, '0')}:00`;
  }
  const parts = clean.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padEnd(2, '0')}`;
  }
  return clean || '08:30';
}

function calculateDurationFromTimes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 1.5;
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = (endMins - startMins) / 60;
  return diff > 0 ? Math.round(diff * 10) / 10 : 1.5;
}

function sanitizeCategory(raw: string): WorkshopCategory {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('přírod') || lower.includes('bio') || lower.includes('chem') || lower.includes('fyz')) return 'Přírodní vědy';
  if (lower.includes('společ') || lower.includes('děj') || lower.includes('filozof') || lower.includes('práv')) return 'Společenské vědy';
  if (lower.includes('jazyk') || lower.includes('anglick') || lower.includes('liter')) return 'Jazyky & Literatura';
  if (lower.includes('it') || lower.includes('prog') || lower.includes('techno') || lower.includes('ai') || lower.includes('3d')) return 'IT & Technologie';
  if (lower.includes('uměn') || lower.includes('foto') || lower.includes('hudb') || lower.includes('divad')) return 'Umění & Tvorba';
  if (lower.includes('sport') || lower.includes('pohyb') || lower.includes('zdrav')) return 'Sport & Zdraví';
  return 'Osobní rozvoj & Kariéra';
}

function parseRepeatSlots(raw: string, defaultRoom: string, defaultDuration: number): RepeatSlot[] {
  if (!raw || raw.trim().length === 0) return [];
  
  // Format example: "Pátek 10:15-11:45 | U12; Pátek 12:30-14:00"
  const slots: RepeatSlot[] = [];
  const entries = raw.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);

  entries.forEach((entry, idx) => {
    // Check if room is included
    const parts = entry.split('|').map(p => p.trim());
    const timePart = parts[0];
    const roomPart = parts[1] || defaultRoom;

    const dayMatch = timePart.match(/(pondělí|úterý|středa|čtvrtek|pátek|sobota|neděle)/i);
    const day = dayMatch ? capitalize(dayMatch[0]) : 'Pátek';

    const timeMatches = timePart.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
    if (timeMatches) {
      const startTime = normalizeTime(timeMatches[1]);
      const endTime = normalizeTime(timeMatches[2]);
      slots.push({
        id: `rep-${idx}-${Date.now()}`,
        day,
        startTime,
        endTime,
        room: roomPart,
        durationHours: calculateDurationFromTimes(startTime, endTime) || defaultDuration
      });
    }
  });

  return slots;
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function formatGoogleSheetUrl(url: string): string {
  if (!url) return '';
  // Check if it's a standard google sheet edit url
  const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
  }
  return url;
}

export const SAMPLE_CSV_TEMPLATE = `Kód,Název,Vyučující,Email,Kategorie,Popis,Den,Čas od,Čas do,Délka (h),Místnost,Kapacita,Cílové třídy,Volné opakování
INF-01,Umělá inteligence & Neuronové sítě,Mgr. Petr Šmíd,smid@gjk.cz,IT & Technologie,Základy neuronových sítí a LLM modelů,Čtvrtek,08:30,10:00,1.5,Učebna IVT 1,12,"Kvinta, Sexta, Septima, Oktáva, 1.A, 2.A, 3.A, 4.A",Čtvrtek 10:15-11:45 | IVT 1
FYZ-02,Astrofyzika & Exoplanety,RNDr. Jan Kepler,kepler.j@gjk.cz,Přírodní vědy,Pozorování a metody hledání planet,Čtvrtek,10:15,11:45,1.5,Fyzikální lab,16,Všechny,Pátek 08:30-10:00
BIO-03,Izolace vlastní DNA,RNDr. Klára Svobodová,svobodova.k@gjk.cz,Přírodní vědy,Praktické pipetování v chemické laboratoři,Pátek,08:30,10:30,2.0,Chemická lab,14,"Septima, Oktáva, 3.A, 4.A",Pátek 11:00-13:00
3D-04,3D tisk a modelování,Ing. Pavel Kučera,kucera.p@gjk.cz,IT & Technologie,Rychlé prototypování a tisk na Prusa MK4,Pátek,10:45,12:15,1.5,FabLab,8,Všechny,Pátek 12:30-14:00`;
