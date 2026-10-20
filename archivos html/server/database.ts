import fs from 'fs';
import path from 'path';
import { Obituary, CondolenceMessage, FuneralHomeBrand, AuthUser } from '../src/types';

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface AuthUserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'agency';
  agencyId?: string;
  agencyName?: string;
  createdAt: string;
}

export interface UserSessionRecord {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  obituaries: Obituary[];
  messages: CondolenceMessage[];
  agencies: FuneralHomeBrand[];
  users: AuthUserRecord[];
  sessions: Record<string, UserSessionRecord>;
}

export const INITIAL_USERS: AuthUserRecord[] = [
  {
    id: 'user-superadmin',
    username: 'superadmin',
    email: 'admin@esquelas.pro',
    password: 'AdminPassword2026!',
    name: 'Super Administrador (Mi Panel)',
    role: 'superadmin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-san-angel',
    username: 'sanangel',
    email: 'contacto@funerariasanangel.mx',
    password: 'SanAngel2026!',
    name: 'Grupo Funeral San Ángel',
    role: 'agency',
    agencyId: 'funeraria-san-angel',
    agencyName: 'Grupo Funeral San Ángel',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-recuerdo',
    username: 'recuerdo',
    email: 'atencion@capillasdelrecuerdo.com',
    password: 'Recuerdo2026!',
    name: 'Capillas Memorial del Recuerdo',
    role: 'agency',
    agencyId: 'capillas-del-recuerdo',
    agencyName: 'Capillas Memorial del Recuerdo',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'user-esperanza',
    username: 'esperanza',
    email: 'servicios@funerarialaesperanza.com',
    password: 'Esperanza2026!',
    name: 'Servicios Funerales La Esperanza',
    role: 'agency',
    agencyId: 'servicios-la-esperanza',
    agencyName: 'Servicios Funerales La Esperanza',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_AGENCIES: FuneralHomeBrand[] = [
  {
    id: 'funeraria-san-angel',
    name: 'Grupo Funeral San Ángel',
    tagline: 'Dignidad, respeto y calidez en cada memoria',
    logoUrl: '',
    primaryColor: '#8C733E',
    secondaryColor: '#C5A059',
    backgroundColor: '#FAF8F5',
    textColor: '#2A231C',
    phone: '+52 (33) 3615-4000',
    email: 'contacto@funerariasanangel.mx',
    address: 'Av. Hidalgo 1450, Col. Americana, Guadalajara, Jal.',
    websiteUrl: 'https://funerariasanangel.mx',
    defaultRetentionDays: 30,
    watermarkSignature: 'Homenaje ceremonial provisto por Grupo Funeral San Ángel',
    isDefault: true,
    loginUsername: 'sanangel',
    loginEmail: 'contacto@funerariasanangel.mx',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'capillas-del-recuerdo',
    name: 'Capillas Memorial del Recuerdo',
    tagline: 'Honrando vidas, perpetuando recuerdos eternos',
    logoUrl: '',
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
    textColor: '#0F172A',
    phone: '+52 (55) 5534-8800',
    email: 'atencion@capillasdelrecuerdo.com',
    address: 'Calzada del Recuerdo 200, Ciudad de México',
    websiteUrl: 'https://capillasdelrecuerdo.com',
    defaultRetentionDays: 60,
    watermarkSignature: 'Memoria eterna preservada por Capillas Memorial del Recuerdo',
    isDefault: false,
    loginUsername: 'recuerdo',
    loginEmail: 'atencion@capillasdelrecuerdo.com',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'servicios-la-esperanza',
    name: 'Servicios Funerales La Esperanza',
    tagline: 'Paz, consuelo y homenaje a quienes siempre vivirán',
    logoUrl: '',
    primaryColor: '#065F46',
    secondaryColor: '#10B981',
    backgroundColor: '#F6FBF8',
    textColor: '#064E3B',
    phone: '+52 (81) 8340-9200',
    email: 'servicios@funerarialaesperanza.com',
    address: 'Av. Constitución 850, Monterrey, N.L.',
    websiteUrl: 'https://funerarialaesperanza.com',
    defaultRetentionDays: 30,
    watermarkSignature: 'Publicación oficial certificada por Servicios Funerales La Esperanza',
    isDefault: false,
    loginUsername: 'esperanza',
    loginEmail: 'servicios@funerarialaesperanza.com',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

const INITIAL_OBITUARIES: Obituary[] = [
  {
    id: 'esquela-carmen-morales',
    slug: 'carmen-morales-vega',
    agencyId: 'funeraria-san-angel',
    agencyName: 'Grupo Funeral San Ángel',
    fullName: 'Doña Carmen Morales Vega',
    birthDate: '1942-05-18',
    deathDate: '2026-10-08',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80',
    epitaph: 'Tu amor incondicional, tu ternura infinita y tu sabia sonrisa vivirán por siempre en cada rincón de nuestros corazones.',
    biography: 'Madre ejemplar, maestra de vocación y pilar entrañable de nuestra familia. Dedicó su vida a sembrar bondad, cultivar la lectura en generaciones de niños y unir a los suyos en cada mesa dominical.',
    ceremonyDetails: 'Misa de eterno descanso: Capilla de San José, sábado 18 de octubre a las 12:00 hrs. Agradecemos su compañía en oración.',
    familyQuote: '«Aquellos a quienes amamos nunca mueren, solo se adelantan en el camino de la luz.» — Su amada familia Morales Vega',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 30,
    maxMessages: 50,
    messageCount: 3,
    candlesLitCount: 42,
    isActive: true,
  },
  {
    id: 'esquela-francisco-valdez',
    slug: 'francisco-valdez-ramirez',
    agencyId: 'capillas-del-recuerdo',
    agencyName: 'Capillas Memorial del Recuerdo',
    fullName: 'Don Francisco Valdez Ramírez',
    birthDate: '1938-11-22',
    deathDate: '2026-10-12',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
    epitaph: 'Un hombre íntegro, padre noble y amigo leal cuya memoria vivirá en todos nosotros.',
    biography: 'Ingeniero apasionado por su tierra, amante de las caminatas matutinas y maestro de paciencia para sus cinco nietos.',
    ceremonyDetails: 'Capilla Mayor del Recuerdo, velación continua y homenaje solemne.',
    familyQuote: '«Siempre vivirás en el amor que supiste sembrar.»',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 60,
    maxMessages: 50,
    messageCount: 1,
    candlesLitCount: 19,
    isActive: true,
  },
  {
    id: 'esquela-elena-navarro',
    slug: 'elena-navarro-gutierrez',
    agencyId: 'servicios-la-esperanza',
    agencyName: 'Servicios Funerales La Esperanza',
    fullName: 'Sra. Elena Navarro Gutiérrez',
    birthDate: '1955-08-14',
    deathDate: '2026-10-14',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    epitaph: 'Su entusiasmo por la vida y su generosidad nos inspirarán siempre.',
    biography: 'Médica pediatra entregada a la salud infantil por más de 35 años.',
    ceremonyDetails: 'Homenaje y misa de acción de gracias en Parroquia de la Esperanza.',
    familyQuote: '«Descansa en la paz y el gozo prometido a los de corazón puro.»',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 30,
    maxMessages: 50,
    messageCount: 1,
    candlesLitCount: 25,
    isActive: true,
  },
];

const INITIAL_MESSAGES: CondolenceMessage[] = [
  {
    id: 'msg-1',
    obituaryId: 'esquela-carmen-morales',
    authorName: 'Familia González Navarro',
    relationship: 'Amigos de la familia',
    originalContent: 'Querida familia, lamentamos mucho la partida de la señora Carmen. Siempre recordaremos su amabilidad y sus ricos pasteles en navidad. Un fuerte abrazo a todos.',
    content: 'Querida familia, lamentamos profundamente la partida de la querida señora Carmen. Siempre atesoraremos con cariño su cálida amabilidad y la generosidad de su espíritu. Les enviamos un abrazo fraterno y nuestras oraciones por su descanso eterno.',
    isAiEnriched: true,
    symbol: 'candle',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'msg-2',
    obituaryId: 'esquela-carmen-morales',
    authorName: 'Dr. Roberto Méndez',
    relationship: 'Exalumno de primaria',
    originalContent: 'La maestra Carmen marcó mi vida para siempre. Gracias a ella estudié medicina. Mis condolencias a sus hijos y nietos.',
    content: 'La maestra Carmen marcó mi vida con su paciencia y vocación ejemplar. Gracias a sus enseñanzas descubrí mi camino en la medicina. Mi más sentido pésame para sus hijos y nietos; su legado perdura en todos los que fuimos sus alumnos.',
    isAiEnriched: true,
    symbol: 'flower',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'msg-3',
    obituaryId: 'esquela-carmen-morales',
    authorName: 'Sofía y Luis Fernando',
    relationship: 'Sobrinos',
    originalContent: 'Tía Carmen, gracias por tantas risas y por tu cariño de siempre. Descansa en paz.',
    content: 'Tía Carmen, gracias por tantas risas compartidas y por regalarnos siempre tu ternura incondicional. Descansa en la paz eterna.',
    isAiEnriched: false,
    symbol: 'prayer',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'msg-4',
    obituaryId: 'esquela-francisco-valdez',
    authorName: 'Ing. Carlos Mendoza',
    relationship: 'Colega y Amigo',
    originalContent: 'Don Francisco fue un mentor intachable. Todo mi aprecio y solidaridad para su estimada familia.',
    content: 'Don Francisco fue un mentor intachable y un amigo sincero. Su ética y nobleza dejan una huella profunda en todos los que tuvimos el honor de trabajar con él. Todo mi aprecio y solidaridad en este difícil momento.',
    isAiEnriched: true,
    symbol: 'cross',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'msg-5',
    obituaryId: 'esquela-elena-navarro',
    authorName: 'Comunidad Médica Pediátrica',
    relationship: 'Compañeros de profesión',
    originalContent: 'Descanse en paz doctora Elena. Gracias por cuidar de tantos niños con tanto amor.',
    content: 'Descanse en la paz eterna, querida Dra. Elena. Su dedicación inquebrantable a la salud de innumerables niños y su calidez humana perdurarán por siempre como testimonio de una vida noble.',
    isAiEnriched: true,
    symbol: 'dove',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
];

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData: DatabaseSchema = {
      obituaries: INITIAL_OBITUARIES,
      messages: INITIAL_MESSAGES,
      agencies: INITIAL_AGENCIES,
      users: INITIAL_USERS,
      sessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let modified = false;

    if (!Array.isArray(parsed.obituaries)) {
      parsed.obituaries = INITIAL_OBITUARIES;
      modified = true;
    }
    if (!Array.isArray(parsed.messages)) {
      parsed.messages = INITIAL_MESSAGES;
      modified = true;
    }
    if (!Array.isArray(parsed.agencies) || parsed.agencies.length === 0) {
      parsed.agencies = INITIAL_AGENCIES;
      modified = true;
    }
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = INITIAL_USERS;
      modified = true;
    } else {
      // Ensure superadmin exists
      if (!parsed.users.some((u) => u.role === 'superadmin')) {
        parsed.users.unshift(INITIAL_USERS[0]);
        modified = true;
      }
      // Ensure each initial agency has a user account
      for (const initialUser of INITIAL_USERS) {
        if (!parsed.users.some((u) => u.id === initialUser.id || (initialUser.agencyId && u.agencyId === initialUser.agencyId))) {
          parsed.users.push(initialUser);
          modified = true;
        }
      }
    }

    if (!parsed.sessions || typeof parsed.sessions !== 'object') {
      parsed.sessions = {};
      modified = true;
    }

    // Ensure all obituaries have a valid agencyId
    parsed.obituaries.forEach((ob) => {
      if (!ob.agencyId) {
        ob.agencyId = 'funeraria-san-angel';
        ob.agencyName = 'Grupo Funeral San Ángel';
        modified = true;
      }
    });

    // Ensure all agencies have login usernames
    parsed.agencies.forEach((agency) => {
      if (!agency.loginUsername) {
        const u = parsed.users.find((usr) => usr.agencyId === agency.id);
        agency.loginUsername = u?.username || agency.id;
        agency.loginEmail = u?.email || agency.email || `${agency.id}@esquelas.pro`;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database.json, reinitializing default data:', err);
    const defaultData: DatabaseSchema = {
      obituaries: INITIAL_OBITUARIES,
      messages: INITIAL_MESSAGES,
      agencies: INITIAL_AGENCIES,
      users: INITIAL_USERS,
      sessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const serverDb = {
  // -------------------------------------------------------------
  // AUTHENTICATION & MULTI-TENANT USERS
  // -------------------------------------------------------------
  authenticateUser(identifier: string, password: string): { user: AuthUser; token: string } | null {
    if (!identifier || !password) return null;
    const db = ensureDbExists();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    const userRecord = db.users.find(
      (u) =>
        (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
        u.password === cleanPwd
    );

    if (!userRecord) return null;

    // Create session token
    const token = `token_${userRecord.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (!db.sessions) db.sessions = {};
    db.sessions[token] = {
      userId: userRecord.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    saveDb(db);

    const safeUser: AuthUser = {
      id: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      agencyId: userRecord.agencyId,
      agencyName: userRecord.agencyName,
      createdAt: userRecord.createdAt,
    };

    return { user: safeUser, token };
  },

  getUserByToken(token: string): AuthUser | null {
    if (!token) return null;
    const db = ensureDbExists();
    let session = db.sessions?.[token];

    // Auto-heal superadmin token if session was lost during server restart
    if (!session && (token.includes('superadmin') || token.startsWith('token_user-superadmin_'))) {
      const superUser = db.users.find((u) => u.id === 'user-superadmin' || u.role === 'superadmin');
      if (superUser) {
        if (!db.sessions) db.sessions = {};
        db.sessions[token] = {
          userId: superUser.id,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        saveDb(db);
        session = db.sessions[token];
      }
    }

    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      delete db.sessions[token];
      saveDb(db);
      return null;
    }

    const userRecord = db.users.find((u) => u.id === session.userId);
    if (!userRecord) return null;

    return {
      id: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      agencyId: userRecord.agencyId,
      agencyName: userRecord.agencyName,
      createdAt: userRecord.createdAt,
    };
  },

  revokeToken(token: string): boolean {
    const db = ensureDbExists();
    if (db.sessions && db.sessions[token]) {
      delete db.sessions[token];
      saveDb(db);
      return true;
    }
    return false;
  },

  getUsers(): AuthUserRecord[] {
    const db = ensureDbExists();
    return db.users || INITIAL_USERS;
  },

  getUserByAgencyId(agencyId: string): AuthUserRecord | undefined {
    const db = ensureDbExists();
    return db.users.find((u) => u.agencyId === agencyId);
  },

  saveUserForAgency(agency: FuneralHomeBrand, password?: string, username?: string, email?: string): AuthUserRecord {
    const db = ensureDbExists();
    let existing = db.users.find((u) => u.agencyId === agency.id);

    const targetUsername = (username || agency.loginUsername || agency.id).trim().toLowerCase();
    const targetEmail = (email || agency.loginEmail || agency.email || `${agency.id}@esquelas.pro`).trim().toLowerCase();
    const targetPassword = password && password.trim() ? password.trim() : (existing?.password || `${agency.name.split(' ')[0]}2026!`);

    if (existing) {
      existing.username = targetUsername;
      existing.email = targetEmail;
      existing.password = targetPassword;
      existing.name = agency.name;
      existing.agencyName = agency.name;
    } else {
      existing = {
        id: `user-${agency.id}`,
        username: targetUsername,
        email: targetEmail,
        password: targetPassword,
        name: agency.name,
        role: 'agency',
        agencyId: agency.id,
        agencyName: agency.name,
        createdAt: new Date().toISOString(),
      };
      db.users.push(existing);
    }

    saveDb(db);
    return existing;
  },

  deleteUserByAgencyId(agencyId: string): void {
    const db = ensureDbExists();
    db.users = db.users.filter((u) => u.agencyId !== agencyId);
    saveDb(db);
  },

  // -------------------------------------------------------------
  // AGENCIES & FUNERAL HOME BRANDS (MULTI-TENANT SAAS)
  // -------------------------------------------------------------
  getAgencies(): FuneralHomeBrand[] {
    const db = ensureDbExists();
    return db.agencies || INITIAL_AGENCIES;
  },

  getAgencyById(id: string): FuneralHomeBrand | undefined {
    if (!id) return undefined;
    const db = ensureDbExists();
    const cleanId = id.trim().toLowerCase();
    return (db.agencies || INITIAL_AGENCIES).find(
      (a) => a.id.toLowerCase() === cleanId
    );
  },

  saveAgency(agency: FuneralHomeBrand): FuneralHomeBrand {
    const db = ensureDbExists();
    if (!db.agencies) db.agencies = [...INITIAL_AGENCIES];
    const idx = db.agencies.findIndex((a) => a.id === agency.id);

    if (idx >= 0) {
      db.agencies[idx] = { ...db.agencies[idx], ...agency };
    } else {
      db.agencies.push(agency);
    }

    // Update agencyName across all obituaries belonging to this agency
    db.obituaries.forEach((ob) => {
      if (ob.agencyId === agency.id) {
        ob.agencyName = agency.name;
      }
    });

    saveDb(db);
    return agency;
  },

  deleteAgency(id: string): boolean {
    const db = ensureDbExists();
    if (!db.agencies || db.agencies.length <= 1) return false;
    const target = db.agencies.find((a) => a.id === id);
    if (!target || target.isDefault) return false;

    db.agencies = db.agencies.filter((a) => a.id !== id);
    this.deleteUserByAgencyId(id);

    // Reassign orphaned obituaries to default agency
    const defaultAgency = db.agencies.find((a) => a.isDefault) || db.agencies[0];
    db.obituaries.forEach((ob) => {
      if (ob.agencyId === id) {
        ob.agencyId = defaultAgency.id;
        ob.agencyName = defaultAgency.name;
      }
    });

    saveDb(db);
    return true;
  },

  // -------------------------------------------------------------
  // OBITUARIES (STRICTLY FILTERED FOR TENANTS)
  // -------------------------------------------------------------
  getObituaries(agencyId?: string): Obituary[] {
    const db = ensureDbExists();
    if (agencyId && agencyId !== 'all') {
      const cleanAgency = agencyId.trim().toLowerCase();
      return db.obituaries.filter(
        (o) => (o.agencyId || 'funeraria-san-angel').toLowerCase() === cleanAgency
      );
    }
    return db.obituaries;
  },

  getObituaryById(id: string): Obituary | undefined {
    if (!id) return undefined;
    const db = ensureDbExists();
    const cleanId = id.trim();
    let decoded = cleanId;
    try {
      decoded = decodeURIComponent(cleanId);
    } catch {}
    return db.obituaries.find(
      (o) => o.id === cleanId || o.slug === cleanId || o.id === decoded || o.slug === decoded
    );
  },

  saveObituary(obituary: Obituary, forcedAgencyId?: string): Obituary {
    const db = ensureDbExists();
    const finalAgencyId = forcedAgencyId || obituary.agencyId || 'funeraria-san-angel';
    const agency = (db.agencies || INITIAL_AGENCIES).find((a) => a.id === finalAgencyId);

    const enrichedOb: Obituary = {
      ...obituary,
      agencyId: finalAgencyId,
      agencyName: obituary.agencyName || agency?.name || 'Grupo Funeral San Ángel',
    };

    const idx = db.obituaries.findIndex((o) => o.id === enrichedOb.id);
    if (idx >= 0) {
      db.obituaries[idx] = enrichedOb;
    } else {
      db.obituaries.unshift(enrichedOb);
    }
    saveDb(db);
    return enrichedOb;
  },

  deleteObituary(id: string, allowedAgencyId?: string): boolean {
    const db = ensureDbExists();
    const target = db.obituaries.find((o) => o.id === id || o.slug === id);
    if (!target) return false;

    // Strict multi-tenant isolation check
    if (allowedAgencyId && allowedAgencyId !== 'all') {
      if ((target.agencyId || 'funeraria-san-angel').toLowerCase() !== allowedAgencyId.toLowerCase()) {
        return false; // Forbidden
      }
    }

    db.obituaries = db.obituaries.filter((o) => o.id !== target.id && o.slug !== target.slug);
    db.messages = db.messages.filter((m) => m.obituaryId !== target.id);
    saveDb(db);
    return true;
  },

  // -------------------------------------------------------------
  // METRICS & STATS (TENANT ISOLATED)
  // -------------------------------------------------------------
  getMetrics(agencyId?: string) {
    const db = ensureDbExists();
    const now = Date.now();
    let obList = db.obituaries;
    if (agencyId && agencyId !== 'all') {
      obList = obList.filter((o) => (o.agencyId || 'funeraria-san-angel') === agencyId);
    }

    const totalObituaries = obList.length;
    const activeObituaries = obList.filter(
      (o) => new Date(o.expiresAt).getTime() >= now && o.isActive
    ).length;
    const expiredObituaries = totalObituaries - activeObituaries;
    const totalCondolences = obList.reduce((acc, o) => acc + (o.messageCount || 0), 0);
    const totalCandles = obList.reduce((acc, o) => acc + (o.candlesLitCount || 0), 0);

    return {
      totalObituaries,
      activeObituaries,
      expiredObituaries,
      totalCondolences,
      totalCandles,
      totalAgencies: agencyId && agencyId !== 'all' ? 1 : db.agencies.length,
    };
  },

  // -------------------------------------------------------------
  // CONDOLENCE MESSAGES (TENANT ISOLATED FOR MODERATION)
  // -------------------------------------------------------------
  getMessagesByObituary(obituaryId: string): CondolenceMessage[] {
    const db = ensureDbExists();
    return db.messages
      .filter((m) => m.obituaryId === obituaryId && m.approved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllMessages(obituaryId?: string, includeUnapproved = true, allowedAgencyId?: string): CondolenceMessage[] {
    const db = ensureDbExists();
    let msgs = db.messages;

    // Filter by agency if specified
    if (allowedAgencyId && allowedAgencyId !== 'all') {
      const allowedObIds = new Set(
        db.obituaries
          .filter((o) => (o.agencyId || 'funeraria-san-angel').toLowerCase() === allowedAgencyId.toLowerCase())
          .map((o) => o.id)
      );
      msgs = msgs.filter((m) => allowedObIds.has(m.obituaryId));
    }

    if (obituaryId && obituaryId !== 'all') {
      const cleanId = obituaryId.trim();
      msgs = msgs.filter((m) => m.obituaryId === cleanId);
    }
    if (!includeUnapproved) {
      msgs = msgs.filter((m) => m.approved !== false);
    }
    return msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  toggleMessageApproval(messageId: string, approvedState?: boolean, allowedAgencyId?: string): boolean {
    const db = ensureDbExists();
    const target = db.messages.find((m) => m.id === messageId);
    if (!target) return false;

    // Strict multi-tenant isolation check
    if (allowedAgencyId && allowedAgencyId !== 'all') {
      const ob = db.obituaries.find((o) => o.id === target.obituaryId);
      if (!ob || (ob.agencyId || 'funeraria-san-angel').toLowerCase() !== allowedAgencyId.toLowerCase()) {
        return false; // Forbidden
      }
    }

    target.approved = approvedState !== undefined ? approvedState : !target.approved;
    saveDb(db);
    return true;
  },

  updateObituaryRetention(id: string, retentionDays: number, allowedAgencyId?: string): boolean {
    const db = ensureDbExists();
    const target = db.obituaries.find((o) => o.id === id || o.slug === id);
    if (!target) return false;

    if (allowedAgencyId && allowedAgencyId !== 'all') {
      if ((target.agencyId || 'funeraria-san-angel').toLowerCase() !== allowedAgencyId.toLowerCase()) {
        return false;
      }
    }

    target.retentionDays = retentionDays;
    const baseDate = target.createdAt ? new Date(target.createdAt).getTime() : Date.now();
    target.expiresAt = new Date(baseDate + retentionDays * 24 * 60 * 60 * 1000).toISOString();
    saveDb(db);
    return true;
  },

  toggleObituaryActive(id: string, allowedAgencyId?: string): boolean {
    const db = ensureDbExists();
    const target = db.obituaries.find((o) => o.id === id || o.slug === id);
    if (!target) return false;

    if (allowedAgencyId && allowedAgencyId !== 'all') {
      if ((target.agencyId || 'funeraria-san-angel').toLowerCase() !== allowedAgencyId.toLowerCase()) {
        return false;
      }
    }

    target.isActive = !target.isActive;
    saveDb(db);
    return true;
  },

  addMessage(message: Omit<CondolenceMessage, 'id' | 'createdAt' | 'approved'>): { success: boolean; error?: string; message?: CondolenceMessage } {
    const db = ensureDbExists();
    const obituary = db.obituaries.find((o) => o.id === message.obituaryId || o.slug === message.obituaryId);
    if (!obituary) {
      return { success: false, error: 'Esta esquela no está disponible.' };
    }

    const currentMessages = db.messages.filter((m) => m.obituaryId === obituary.id && m.approved);
    if (currentMessages.length >= (obituary.maxMessages || 50)) {
      return {
        success: false,
        error: `Este libro de condolencias ha alcanzado su límite máximo de ${obituary.maxMessages || 50} mensajes.`,
      };
    }

    const newMsg: CondolenceMessage = {
      ...message,
      obituaryId: obituary.id,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      approved: true,
    };

    db.messages.push(newMsg);
    obituary.messageCount = (obituary.messageCount || 0) + 1;
    saveDb(db);

    return { success: true, message: newMsg };
  },

  deleteMessage(messageId: string, allowedAgencyId?: string): boolean {
    const db = ensureDbExists();
    const target = db.messages.find((m) => m.id === messageId);
    if (!target) return false;

    // Isolation check
    if (allowedAgencyId && allowedAgencyId !== 'all') {
      const ob = db.obituaries.find((o) => o.id === target.obituaryId);
      if (!ob || (ob.agencyId || 'funeraria-san-angel').toLowerCase() !== allowedAgencyId.toLowerCase()) {
        return false;
      }
    }

    db.messages = db.messages.filter((m) => m.id !== messageId);
    const obituary = db.obituaries.find((o) => o.id === target.obituaryId);
    if (obituary && obituary.messageCount > 0) {
      obituary.messageCount -= 1;
    }
    saveDb(db);
    return true;
  },

  lightCandle(obituaryId: string): number {
    const db = ensureDbExists();
    const obituary = db.obituaries.find((o) => o.id === obituaryId || o.slug === obituaryId);
    if (!obituary) return 0;
    obituary.candlesLitCount = (obituary.candlesLitCount || 0) + 1;
    saveDb(db);
    return obituary.candlesLitCount;
  },
};
