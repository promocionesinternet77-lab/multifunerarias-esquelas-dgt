export type TributeSymbol = 'candle' | 'flower' | 'cross' | 'dove' | 'prayer';

export interface CondolenceMessage {
  id: string;
  obituaryId: string;
  authorName: string;
  relationship: string;
  originalContent: string;
  content: string;
  isAiEnriched: boolean;
  symbol: TributeSymbol;
  createdAt: string;
  approved: boolean;
}

export type UserRole = 'superadmin' | 'agency';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string; // Present when role === 'agency'
  agencyName?: string;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface FuneralHomeBrand {
  id: string; // Identificador único de la funeraria o marca (slug)
  name: string; // Nombre de la funeraria o corporativo
  tagline?: string; // Eslogan solemne o frase distintiva
  logoUrl?: string; // Imagen o Data URL del logotipo oficial
  primaryColor: string; // Color primario de acento y botones (ej: #8C733E, #1E3A8A)
  secondaryColor?: string; // Color secundario para adornos y bordes
  backgroundColor?: string; // Tono de fondo de la esquela (ej: #FAF8F5, #F8FAFC)
  textColor?: string; // Tono de texto principal
  phone?: string; // Teléfono de contacto de la funeraria o capilla
  email?: string; // Correo de atención
  address?: string; // Dirección física o ubicación de las capillas
  websiteUrl?: string; // Enlace a la web de la funeraria
  defaultRetentionDays: number; // Vigencia estándar configurada (15, 30, 60, 365, etc.)
  watermarkSignature?: string; // Frase al pie (ej: "Servicio ceremonial provisto por...")
  isDefault?: boolean; // Marca predeterminada del sistema
  loginUsername?: string; // Nombre de usuario asignado para acceso
  loginEmail?: string; // Correo de acceso para la funeraria
  createdAt: string;
}

export interface Obituary {
  id: string;
  slug: string;
  agencyId?: string; // Identificador de la funeraria aliada que publica la esquela
  agencyName?: string; // Nombre visible de la funeraria
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  deathDate: string; // YYYY-MM-DD
  photoUrl: string;
  epitaph: string; // Mensaje principal de homenaje
  biography?: string; // Semblanza o memoria
  ceremonyDetails?: string; // Información de misa, velatorio o descanso final
  familyQuote?: string; // Frase o agradecimiento de la familia
  createdAt: string;
  expiresAt: string; // Fecha de vencimiento calculada
  retentionDays: number; // Por defecto 30 días o según plan
  maxMessages: number; // Límite estricto de 50
  messageCount: number;
  candlesLitCount: number;
  isActive: boolean;
}

export interface CloudConnectionStatus {
  firebaseConnected: boolean;
  firebaseProjectId?: string;
  geminiAiReady: boolean;
  qrGeneratorReady: boolean;
  autoPurgeConfigured: boolean;
  storageEngine: 'localStorage_test' | 'firebase_cloud';
}

