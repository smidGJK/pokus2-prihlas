import { SchoolEvent, User } from '../types';

export const ALL_CLASSES = [
  'Prima A', 'Prima B',
  'Sekunda A', 'Sekunda B',
  'Tercie A', 'Tercie B',
  'Kvarta A', 'Kvarta B',
  'Kvinta A', 'Kvinta B',
  'Sexta A', 'Sexta B',
  'Septima A', 'Septima B',
  'Oktáva A', 'Oktáva B',
  '1.A', '1.B',
  '2.A', '2.B',
  '3.A', '3.B',
  '4.A', '4.B'
];

export const DEMO_USERS: User[] = [
  {
    id: 'user-student-1',
    name: 'Jan Novák',
    email: 'novak.jan@student.gjk.cz',
    role: 'student',
    studentClass: '3.A',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-2',
    name: 'Tereza Dvořáková',
    email: 'dvorakova.t@student.gjk.cz',
    role: 'student',
    studentClass: 'Sexta B',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-3',
    name: 'Lukáš Procházka',
    email: 'prochazka.l@student.gjk.cz',
    role: 'student',
    studentClass: 'Kvinta A',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-teacher-1',
    name: 'Mgr. Petr Šmíd',
    email: 'smid@gjk.cz',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-teacher-2',
    name: 'RNDr. Klára Svobodová',
    email: 'svobodova.k@gjk.cz',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-admin-1',
    name: 'Koordinátor Akcí (Admin GJK)',
    email: 'projekty@gjk.cz',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_EVENT: SchoolEvent = {
  id: 'event-adsymp-2026',
  title: 'Projektové dny GJK – Adsymp 2026',
  code: 'ADSYMP-2026',
  subtitle: 'Mezioborové sympozium a praktické workshopy studentů a lektorů',
  description: 'Dvoudenní mezioborový program plný vědeckých pokusů, debatních klubů, programování, uměleckých dílen a filozofických rozprav. Každý student si sestaví svůj individuální rozvrh v rozsahu minimálně 6 hodin.',
  dateRange: 'Čtvrtek 22. 10. – Pátek 23. 10. 2026',
  days: ['Čtvrtek', 'Pátek'],
  requiredHours: 6.0,
  registrationDeadline: '20. 10. 2026, 20:00',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  isOpen: true,
  workshops: [
    {
      id: 'ws-1',
      code: 'INF-01',
      title: 'Umělá inteligence & Neuronové sítě v praxi',
      teacherName: 'Mgr. Petr Šmíd',
      teacherEmail: 'smid@gjk.cz',
      category: 'IT & Technologie',
      description: 'Praktické seznámení s principy strojového učení, LLM modely a trénováním jednoduché neuronové sítě v Pythonu. Není potřeba pokročilá znalost programování.',
      requirements: 'Vlastní notebook výhodou, jinak k dispozici školní PC.',
      targetClasses: ['Kvinta A', 'Kvinta B', 'Sexta A', 'Sexta B', 'Septima A', 'Septima B', 'Oktáva A', 'Oktáva B', '1.A', '1.B', '2.A', '2.B', '3.A', '3.B', '4.A', '4.B'],
      sessions: [
        {
          id: 'sess-1-1',
          workshopId: 'ws-1',
          sessionNumber: 1,
          day: 'Čtvrtek',
          startTime: '08:30',
          endTime: '10:00',
          durationHours: 1.5,
          room: 'Učebna IVT 1',
          maxCapacity: 12,
          enrolledStudentIds: ['user-student-2', 'user-student-3', 'mock-s1', 'mock-s2', 'mock-s3', 'mock-s4', 'mock-s5', 'mock-s6', 'mock-s7', 'mock-s8', 'mock-s9'] // 11/12 spots taken!
        }
      ],
      availableRepeatSlots: [
        {
          id: 'rep-1-1',
          day: 'Čtvrtek',
          startTime: '10:15',
          endTime: '11:45',
          room: 'Učebna IVT 1',
          durationHours: 1.5
        },
        {
          id: 'rep-1-2',
          day: 'Pátek',
          startTime: '12:30',
          endTime: '14:00',
          room: 'Učebna IVT 1',
          durationHours: 1.5
        }
      ]
    },
    {
      id: 'ws-2',
      code: 'FYZ-02',
      title: 'Astrofyzika & Exoplanety: Hledání druhého domova',
      teacherName: 'RNDr. Jan Kepler',
      teacherEmail: 'kepler.j@gjk.cz',
      category: 'Přírodní vědy',
      description: 'Jak astronomové objevují planety mimo naši sluneční soustavu? Spektroskopie, tranzitní metoda a reálná data z teleskopu Jamese Webba.',
      targetClasses: ['Všechny'],
      sessions: [
        {
          id: 'sess-2-1',
          workshopId: 'ws-2',
          sessionNumber: 1,
          day: 'Čtvrtek',
          startTime: '10:15',
          endTime: '11:45',
          durationHours: 1.5,
          room: 'Fyzikální laboratoř',
          maxCapacity: 16,
          enrolledStudentIds: ['user-student-1', 'mock-s10', 'mock-s11']
        }
      ],
      availableRepeatSlots: [
        {
          id: 'rep-2-1',
          day: 'Pátek',
          startTime: '08:30',
          endTime: '10:00',
          room: 'Fyzikální laboratoř',
          durationHours: 1.5
        }
      ]
    },
    {
      id: 'ws-3',
      code: 'SPO-03',
      title: 'Debatní liga & Jak odhalit argumentační fauly',
      teacherName: 'Mgr. Eva Novotná',
      teacherEmail: 'novotna.e@gjk.cz',
      category: 'Společenské vědy',
      description: 'Trénink rétoriky, kritického myšlení a rychlé argumentace podle mezinárodních pravidel Karl Popper debaty.',
      targetClasses: ['Všechny'],
      sessions: [
        {
          id: 'sess-3-1',
          workshopId: 'ws-3',
          sessionNumber: 1,
          day: 'Čtvrtek',
          startTime: '12:30',
          endTime: '14:00',
          durationHours: 1.5,
          room: 'Učebna U22',
          maxCapacity: 18,
          enrolledStudentIds: ['user-student-2', 'mock-s12', 'mock-s13', 'mock-s14']
        }
      ]
    },
    {
      id: 'ws-4',
      code: 'BIO-04',
      title: 'Molekulární genetika & Izolace vlastní DNA',
      teacherName: 'RNDr. Klára Svobodová',
      teacherEmail: 'svobodova.k@gjk.cz',
      category: 'Přírodní vědy',
      description: 'Praktický laboratorní blok. Každý účastník si vyzkouší pipetování, centrifugaci, rozbití buněčných stěn a vysrážení DNA.',
      requirements: 'Laboratorní plášť s sebou, pokud máte.',
      targetClasses: ['Septima A', 'Septima B', 'Oktáva A', 'Oktáva B', '3.A', '3.B', '4.A', '4.B'],
      sessions: [
        {
          id: 'sess-4-1',
          workshopId: 'ws-4',
          sessionNumber: 1,
          day: 'Pátek',
          startTime: '08:30',
          endTime: '10:30',
          durationHours: 2.0,
          room: 'Chemická laboratoř',
          maxCapacity: 14,
          enrolledStudentIds: ['user-student-1', 'mock-s15', 'mock-s16', 'mock-s17', 'mock-s18']
        }
      ],
      availableRepeatSlots: [
        {
          id: 'rep-4-1',
          day: 'Pátek',
          startTime: '11:00',
          endTime: '13:00',
          room: 'Chemická laboratoř',
          durationHours: 2.0
        }
      ]
    },
    {
      id: 'ws-5',
      code: 'ART-05',
      title: 'Digitální fotografie & Lightroom postprodukce',
      teacherName: 'MgA. Martin Černý',
      teacherEmail: 'cerny.m@gjk.cz',
      category: 'Umění & Tvorba',
      description: 'Práce se světlem v ateliéru, kompozice portrétu a následný barevný grading ve fotografických editorech.',
      targetClasses: ['Všechny'],
      sessions: [
        {
          id: 'sess-5-1',
          workshopId: 'ws-5',
          sessionNumber: 1,
          day: 'Čtvrtek',
          startTime: '08:30',
          endTime: '10:00',
          durationHours: 1.5,
          room: 'Fotoateliér / Podkroví',
          maxCapacity: 10,
          enrolledStudentIds: ['user-student-1', 'mock-s19', 'mock-s20']
        }
      ]
    },
    {
      id: 'ws-6',
      code: 'PSY-06',
      title: 'Psychologie rozhodování & Kognitivní biasy',
      teacherName: 'PhDr. Helena Veselá',
      teacherEmail: 'vesela.h@gjk.cz',
      category: 'Společenské vědy',
      description: 'Proč dělá náš mozek systematické chyby v úsudku? Interaktivní experimenty na vlastních reakcích a jak se nenechat manipulovat.',
      targetClasses: ['Kvinta A', 'Kvinta B', 'Sexta A', 'Sexta B', 'Septima A', 'Septima B', 'Oktáva A', 'Oktáva B', '1.A', '1.B', '2.A', '2.B', '3.A', '3.B', '4.A', '4.B'],
      sessions: [
        {
          id: 'sess-6-1',
          workshopId: 'ws-6',
          sessionNumber: 1,
          day: 'Pátek',
          startTime: '10:45',
          endTime: '12:15',
          durationHours: 1.5,
          room: 'Učebna U15',
          maxCapacity: 20,
          enrolledStudentIds: ['user-student-2', 'user-student-3', 'mock-s21']
        }
      ]
    },
    {
      id: 'ws-7',
      code: '3D-07',
      title: '3D tisk & Rychlé prototypování ve FabLabu',
      teacherName: 'Ing. Pavel Kučera',
      teacherEmail: 'kucera.p@gjk.cz',
      category: 'IT & Technologie',
      description: 'Od náčrtu k fyzickému objektu. Práce s programem Fusion 360, slicing a tisk na tiskárnách Prusa MK4.',
      targetClasses: ['Všechny'],
      sessions: [
        {
          id: 'sess-7-1',
          workshopId: 'ws-7',
          sessionNumber: 1,
          day: 'Pátek',
          startTime: '10:45',
          endTime: '12:15',
          durationHours: 1.5,
          room: 'Školní dílna / FabLab',
          maxCapacity: 8,
          enrolledStudentIds: ['mock-s22', 'mock-s23', 'mock-s24', 'mock-s25', 'mock-s26', 'mock-s27', 'mock-s28', 'mock-s29'] // FULL 8/8! -> Ready for auto-repeat demonstration
        }
      ],
      availableRepeatSlots: [
        {
          id: 'rep-7-1',
          day: 'Pátek',
          startTime: '12:30',
          endTime: '14:00',
          room: 'Školní dílna / FabLab',
          durationHours: 1.5
        }
      ]
    },
    {
      id: 'ws-8',
      code: 'FIL-08',
      title: 'Filozofie Sci-Fi filmů & Matrix ve světle Platóna',
      teacherName: 'Mgr. Jiří Procházka',
      teacherEmail: 'prochazka.j@gjk.cz',
      category: 'Společenské vědy',
      description: 'Projekce klíčových scén filmů Matrix, Blade Runner a Interstellar a jejich diskuze z pohledu ontologie a etiky.',
      targetClasses: ['Kvinta A', 'Kvinta B', 'Sexta A', 'Sexta B', 'Septima A', 'Septima B', 'Oktáva A', 'Oktáva B', '1.A', '1.B', '2.A', '2.B', '3.A', '3.B', '4.A', '4.B'],
      sessions: [
        {
          id: 'sess-8-1',
          workshopId: 'ws-8',
          sessionNumber: 1,
          day: 'Pátek',
          startTime: '12:30',
          endTime: '14:00',
          durationHours: 1.5,
          room: 'Filmový sálek',
          maxCapacity: 25,
          enrolledStudentIds: ['user-student-1', 'user-student-3', 'mock-s30']
        }
      ]
    },
    {
      id: 'ws-9',
      code: 'LAW-09',
      title: 'Moot Court: Simulovaný trestní soudní proces',
      teacherName: 'JUDr. Marek Bartoš',
      teacherEmail: 'bartos.m@gjk.cz',
      category: 'Společenské vědy',
      description: 'Rozdělíme si role soudce, státního zástupce, obhájce a obžalovaného a projdeme reálný případ z trestního práva.',
      targetClasses: ['Septima A', 'Septima B', 'Oktáva A', 'Oktáva B', '3.A', '3.B', '4.A', '4.B'],
      sessions: [
        {
          id: 'sess-9-1',
          workshopId: 'ws-9',
          sessionNumber: 1,
          day: 'Čtvrtek',
          startTime: '12:30',
          endTime: '14:30',
          durationHours: 2.0,
          room: 'Aula školy',
          maxCapacity: 24,
          enrolledStudentIds: ['user-student-1', 'mock-s31', 'mock-s32']
        }
      ]
    },
    {
      id: 'ws-10',
      code: 'SPO-10',
      title: 'Bouldering & Lezení na stěně v tělocvičně',
      teacherName: 'Mgr. Tomáš Dvořák',
      teacherEmail: 'dvorak.t@gjk.cz',
      category: 'Sport & Zdraví',
      description: 'Základy lezeckého pohybu, jištění, těžiště a boulderingové cesty pro začátečníky i pokročilé.',
      targetClasses: ['Všechny'],
      sessions: [
        {
          id: 'sess-10-1',
          workshopId: 'ws-10',
          sessionNumber: 1,
          day: 'Pátek',
          startTime: '08:30',
          endTime: '10:00',
          durationHours: 1.5,
          room: 'Velká tělocvična',
          maxCapacity: 12,
          enrolledStudentIds: ['user-student-3', 'mock-s33']
        }
      ]
    }
  ]
};

// Initial mock student directory for class overview
export const MOCK_STUDENTS_BY_CLASS: Record<string, { id: string; name: string; email: string }[]> = {
  '3.A': [
    { id: 'user-student-1', name: 'Jan Novák', email: 'novak.jan@student.gjk.cz' },
    { id: 'mock-s1', name: 'Alena Beránková', email: 'berankova.a@student.gjk.cz' },
    { id: 'mock-s2', name: 'David Čermák', email: 'cermak.d@student.gjk.cz' },
    { id: 'mock-s3', name: 'Eliška Fialová', email: 'fialova.e@student.gjk.cz' },
    { id: 'mock-s4', name: 'Filip Horák', email: 'horak.f@student.gjk.cz' },
    { id: 'mock-s5', name: 'Gabriela Jánská', email: 'janska.g@student.gjk.cz' },
  ],
  'Sexta B': [
    { id: 'user-student-2', name: 'Tereza Dvořáková', email: 'dvorakova.t@student.gjk.cz' },
    { id: 'mock-s6', name: 'Jakub Král', email: 'kral.j@student.gjk.cz' },
    { id: 'mock-s7', name: 'Karolína Lišková', email: 'liskova.k@student.gjk.cz' },
    { id: 'mock-s8', name: 'Matěj Marek', email: 'marek.m@student.gjk.cz' },
    { id: 'mock-s9', name: 'Nela Němcová', email: 'nemcova.n@student.gjk.cz' },
  ],
  'Kvinta A': [
    { id: 'user-student-3', name: 'Lukáš Procházka', email: 'prochazka.l@student.gjk.cz' },
    { id: 'mock-s10', name: 'Ondřej Pospíšil', email: 'pospisil.o@student.gjk.cz' },
    { id: 'mock-s11', name: 'Petra Růžičková', email: 'ruzickova.p@student.gjk.cz' },
    { id: 'mock-s12', name: 'Radim Sedláček', email: 'sedlacek.r@student.gjk.cz' },
  ],
  '4.A': [
    { id: 'mock-s13', name: 'Štěpán Soukup', email: 'soukup.s@student.gjk.cz' },
    { id: 'mock-s14', name: 'Veronika Tichá', email: 'ticha.v@student.gjk.cz' },
    { id: 'mock-s15', name: 'Vojtěch Urban', email: 'urban.v@student.gjk.cz' },
  ],
  'Septima A': [
    { id: 'mock-s16', name: 'Zuzana Vlčková', email: 'vlckova.z@student.gjk.cz' },
    { id: 'mock-s17', name: 'Adam Zeman', email: 'zeman.a@student.gjk.cz' },
    { id: 'mock-s18', name: 'Bára Benešová', email: 'benesova.b@student.gjk.cz' },
  ]
};
