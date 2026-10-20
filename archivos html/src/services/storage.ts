import { Obituary, CondolenceMessage, FuneralHomeBrand, AuthUser } from '../types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { INITIAL_OBITUARIES, INITIAL_MESSAGES } from '../data/initialObituaries';

const OBITUARIES_CACHE_KEY = 'esquela_digital_obituaries_v2';
const MESSAGES_CACHE_KEY = 'esquela_digital_messages_v2';
const AUTH_TOKEN_KEY = 'esquela_digital_auth_token_v1';
const AUTH_USER_KEY = 'esquela_digital_auth_user_v1';
const FIRESTORE_MIGRATED_KEY = 'esquela_firestore_migrated_v2';
const AGENCIES_CACHE_KEY = 'esquela_digital_agencies_v1';
const SELECTED_AGENCY_KEY = 'esquela_digital_selected_agency_v1';

export const DEFAULT_AGENCIES: FuneralHomeBrand[] = [
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

export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length;
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {}
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
}

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  promise.catch(() => {});
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms)),
  ]);
}

function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export const storageService = {
  // ---------------------------------------------------------
  // AUTHENTICATION & MULTI-TENANT SESSION MANAGEMENT
  // ---------------------------------------------------------
  getAuthToken(): string | null {
    return safeGetItem(AUTH_TOKEN_KEY);
  },

  getCurrentUser(): AuthUser | null {
    try {
      const stored = safeGetItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const currentUser = this.getCurrentUser();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (currentUser?.role) {
      headers['x-user-role'] = currentUser.role;
    }
    return headers;
  },

  async login(identifier: string, password: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Credenciales inválidas. Revisa usuario/correo y contraseña.',
        };
      }

      safeSetItem(AUTH_TOKEN_KEY, data.token);
      safeSetItem(AUTH_USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      return {
        success: false,
        error: err?.message || 'Error de conexión con el servidor de autenticación.',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { ...this.getAuthHeaders() },
      });
    } catch {}
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem(AUTH_USER_KEY);
  },

  async fetchCurrentUser(): Promise<AuthUser | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { ...this.getAuthHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          safeSetItem(AUTH_USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Error al validar sesión:', err);
    }
    return this.getCurrentUser();
  },

  async fetchDemoAccounts(): Promise<any[]> {
    try {
      const res = await fetch('/api/auth/demo-accounts');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [
      {
        name: 'Super Administrador (Mi Panel)',
        username: 'superadmin',
        email: 'admin@esquelas.pro',
        password: 'AdminPassword2026!',
        role: 'superadmin',
        description: 'Super Admin - Acceso total y gestión global de todas las funerarias',
      },
      {
        name: 'Grupo Funeral San Ángel',
        username: 'sanangel',
        email: 'contacto@funerariasanangel.mx',
        password: 'SanAngel2026!',
        role: 'agency',
        agencyId: 'funeraria-san-angel',
        agencyName: 'Grupo Funeral San Ángel',
        description: 'Funeraria San Ángel - Aislamiento estricto de esquelas y condolencias',
      },
      {
        name: 'Capillas Memorial del Recuerdo',
        username: 'recuerdo',
        email: 'atencion@capillasdelrecuerdo.com',
        password: 'Recuerdo2026!',
        role: 'agency',
        agencyId: 'capillas-del-recuerdo',
        agencyName: 'Capillas Memorial del Recuerdo',
        description: 'Capillas del Recuerdo - Aislamiento estricto de esquelas y condolencias',
      },
      {
        name: 'Servicios Funerales La Esperanza',
        username: 'esperanza',
        email: 'servicios@funerarialaesperanza.com',
        password: 'Esperanza2026!',
        role: 'agency',
        agencyId: 'servicios-la-esperanza',
        agencyName: 'Servicios Funerales La Esperanza',
        description: 'Servicios La Esperanza - Aislamiento estricto de esquelas y condolencias',
      },
    ];
  },

  async updateAgencyCredentials(agencyId: string, password: string, username?: string, email?: string): Promise<any> {
    const res = await fetch(`/api/agencies/${encodeURIComponent(agencyId)}/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ password, username, email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar credenciales de la funeraria.');
    }
    return await res.json();
  },

  // ---------------------------------------------------------
  // AGENCIES & MULTI-TENANT WHITE-LABEL MANAGEMENT
  // ---------------------------------------------------------
  async fetchAgencies(): Promise<FuneralHomeBrand[]> {
    try {
      const res = await fetch('/api/agencies', {
        headers: {
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverList = await res.json();
        if (Array.isArray(serverList)) {
          // Merge with any locally added agencies that may not yet be on server
          const localList = this.getAgenciesFromCache();
          const merged = [...serverList];
          for (const local of localList) {
            if (!merged.some((m) => m.id.toLowerCase() === local.id.toLowerCase())) {
              merged.push(local);
            }
          }
          safeSetItem(AGENCIES_CACHE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn('Error al consultar /api/agencies, usando respaldo:', err);
    }
    return this.getAgenciesFromCache();
  },

  getAgenciesFromCache(): FuneralHomeBrand[] {
    try {
      const stored = safeGetItem(AGENCIES_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    safeSetItem(AGENCIES_CACHE_KEY, JSON.stringify(DEFAULT_AGENCIES));
    return DEFAULT_AGENCIES;
  },

  async fetchAgencyById(id: string): Promise<FuneralHomeBrand | null> {
    if (!id) return null;
    try {
      const res = await fetch(`/api/agencies/${encodeURIComponent(id)}`, {
        headers: {
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const agency = await res.json();
        if (agency && agency.id) return agency;
      }
    } catch {}
    const list = this.getAgenciesFromCache();
    return list.find((a) => a.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async saveAgency(agency: FuneralHomeBrand & { loginPassword?: string }): Promise<FuneralHomeBrand> {
    const cachedList = this.getAgenciesFromCache();
    const isEditing = Boolean(cachedList.some((a) => a.id.toLowerCase() === agency.id.toLowerCase()));
    const url = isEditing ? `/api/agencies/${encodeURIComponent(agency.id)}` : '/api/agencies';
    const method = isEditing ? 'PUT' : 'POST';

    // 1. Immediately store in local cache so the UI state updates instantaneously
    this.updateLocalAgencyCache(agency);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(agency),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.agency) {
          this.updateLocalAgencyCache(data.agency);
          return data.agency;
        } else if (!res.ok) {
          console.warn('Servidor respondió con código no exitoso al guardar funeraria:', res.status, data.error);
        }
      } else {
        const text = await res.text();
        console.warn('Servidor devolvió contenido no-JSON al guardar funeraria:', text.substring(0, 150));
      }
    } catch (err: any) {
      console.warn('Conexión con el servidor no disponible, guardado en caché local persistente:', err);
    }

    return agency;
  },

  updateLocalAgencyCache(agency: FuneralHomeBrand) {
    const list = this.getAgenciesFromCache();
    const idx = list.findIndex((a) => a.id.toLowerCase() === agency.id.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...agency };
    } else {
      list.push(agency);
    }
    safeSetItem(AGENCIES_CACHE_KEY, JSON.stringify(list));
  },

  async deleteAgency(id: string): Promise<boolean> {
    // Immediately remove from local cache so UI reacts instantaneously
    const list = this.getAgenciesFromCache().filter((a) => a.id.toLowerCase() !== id.toLowerCase());
    safeSetItem(AGENCIES_CACHE_KEY, JSON.stringify(list));

    try {
      const res = await fetch(`/api/agencies/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return true;
      }
    } catch (err) {
      console.warn('Error al sincronizar eliminación con el servidor:', err);
    }
    return true;
  },

  getSelectedAgencyId(): string {
    return safeGetItem(SELECTED_AGENCY_KEY) || 'all';
  },

  setSelectedAgencyId(id: string): void {
    safeSetItem(SELECTED_AGENCY_KEY, id);
  },

  async fetchStats(agencyId?: string) {
    try {
      const query = agencyId && agencyId !== 'all' ? `?agencyId=${encodeURIComponent(agencyId)}` : '';
      const res = await fetch(`/api/stats${query}`, {
        headers: { ...this.getAuthHeaders() },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  // ---------------------------------------------------------
  // OBITUARIES (ESQUELAS EN FIRESTORE CON RESPALDO MULTINIVEL)
  // ---------------------------------------------------------
  async fetchObituaries(agencyId?: string): Promise<Obituary[]> {
    const user = this.getCurrentUser();
    // If logged in as agency, strictly force the filter
    const effectiveAgencyId = user && user.role === 'agency' ? user.agencyId : agencyId;
    const queryParam = effectiveAgencyId && effectiveAgencyId !== 'all' ? `?agencyId=${encodeURIComponent(effectiveAgencyId)}` : '';

    // 1. Servidor Express con filtro de aislamiento estricto y token
    try {
      const res = await fetch(`/api/obituaries${queryParam}`, {
        headers: { ...this.getAuthHeaders() },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          if (!effectiveAgencyId || effectiveAgencyId === 'all') {
            safeSetItem(OBITUARIES_CACHE_KEY, JSON.stringify(list));
          }
          return list;
        }
      }
    } catch (err) {
      console.warn('Error al consultar /api/obituaries:', err);
    }

    // 2. Respaldo Firestore
    if (db) {
      try {
        const colRef = collection(db, 'obituaries');
        const snapshot = await withTimeout(getDocs(colRef), 2000);

        if (!snapshot.empty) {
          const cloudList: Obituary[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Obituary;
            cloudList.push({
              ...data,
              id: docSnap.id || data.id,
            });
          });

          safeSetItem(OBITUARIES_CACHE_KEY, JSON.stringify(cloudList));
          if (effectiveAgencyId && effectiveAgencyId !== 'all') {
            return cloudList.filter(
              (o) => (o.agencyId || 'funeraria-san-angel').toLowerCase() === effectiveAgencyId.toLowerCase()
            );
          }
          return cloudList;
        }
      } catch (err) {
        console.warn('No se pudo leer de Firestore, utilizando respaldo:', err);
      }
    }

    // 3. Respaldo local
    const cached = this.getObituariesFromCache();
    if (effectiveAgencyId && effectiveAgencyId !== 'all') {
      return cached.filter(
        (o) => (o.agencyId || 'funeraria-san-angel').toLowerCase() === effectiveAgencyId.toLowerCase()
      );
    }
    return cached;
  },

  async fetchObituaryById(id: string): Promise<Obituary | null> {
    if (!id) return null;
    let cleanId = id.trim().replace(/\/+$/, '');
    try {
      cleanId = decodeURIComponent(cleanId);
    } catch {}

    // 1. Servidor Express
    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const ob = await res.json();
        if (ob && ob.id) {
          this.updateLocalCacheItem(ob);
          return ob;
        }
      }
    } catch (err) {
      console.warn(`Error al consultar /api/obituaries/${cleanId}:`, err);
    }

    // 2. Firebase Firestore
    if (db) {
      try {
        const docRef = doc(db, 'obituaries', cleanId);
        const docSnap = await withTimeout(getDoc(docRef), 2000);

        if (docSnap.exists()) {
          const data = docSnap.data() as Obituary;
          const ob: Obituary = {
            ...data,
            id: docSnap.id,
          };
          this.updateLocalCacheItem(ob);
          return ob;
        }
      } catch (err) {}
    }

    // 3. Caché local
    const cachedList = this.getObituariesFromCache();
    const fromCache = cachedList.find(
      (o) => o.id === cleanId || o.slug === cleanId || o.id.toLowerCase() === cleanId.toLowerCase()
    );

    if (fromCache) return fromCache;
    return null;
  },

  async saveObituary(obituary: Obituary): Promise<Obituary> {
    const user = this.getCurrentUser();
    let finalAgencyId = obituary.agencyId || 'funeraria-san-angel';

    // Strict multi-tenant assignment: Agency cannot create for another agency
    if (user && user.role === 'agency' && user.agencyId) {
      finalAgencyId = user.agencyId;
    }

    const finalObituary: Obituary = {
      ...obituary,
      agencyId: finalAgencyId,
      agencyName: obituary.agencyName || 'Grupo Funeral San Ángel',
      id: obituary.id || `esq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      slug: obituary.slug || obituary.id || `esq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: obituary.createdAt || new Date().toISOString(),
      expiresAt:
        obituary.expiresAt ||
        new Date(Date.now() + (obituary.retentionDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      retentionDays: obituary.retentionDays || 30,
      maxMessages: obituary.maxMessages || 50,
      messageCount: obituary.messageCount || 0,
      candlesLitCount: obituary.candlesLitCount || 0,
      isActive: obituary.isActive !== false,
    };

    // 1. Guardar en servidor local con token
    try {
      const res = await fetch('/api/obituaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(finalObituary),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.obituary) {
          this.updateLocalCacheItem(data.obituary);
          return data.obituary;
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar la esquela.');
      }
    } catch (err: any) {
      console.warn('Error al guardar esquela:', err);
      if (err.message) throw err;
    }

    // 2. Guardar en Firebase Firestore si está disponible
    if (db) {
      try {
        const docRef = doc(db, 'obituaries', finalObituary.id);
        await setDoc(docRef, cleanForFirestore(finalObituary), { merge: true });
      } catch (err) {}
    }

    this.updateLocalCacheItem(finalObituary);
    return finalObituary;
  },

  async deleteObituary(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...this.getAuthHeaders() },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar la esquela.');
      }
    } catch (err: any) {
      console.warn('Error al eliminar en servidor:', err);
      throw err;
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'obituaries', id));
      } catch (err) {}
    }

    const list = this.getObituariesFromCache().filter((o) => o.id !== id && o.slug !== id);
    safeSetItem(OBITUARIES_CACHE_KEY, JSON.stringify(list));

    try {
      const allMsgs = this.getAllMessages().filter((m) => m.obituaryId !== id);
      safeSetItem(MESSAGES_CACHE_KEY, JSON.stringify(allMsgs));
    } catch {}
  },

  // ---------------------------------------------------------
  // CONDOLENCE MESSAGES
  // ---------------------------------------------------------
  async fetchMessagesByObituary(obituaryId: string): Promise<CondolenceMessage[]> {
    if (!obituaryId) return [];

    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(obituaryId)}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        if (Array.isArray(msgs)) return msgs;
      }
    } catch {}

    if (db) {
      try {
        const msgsCol = collection(db, 'obituaries', obituaryId, 'messages');
        const snap = await getDocs(msgsCol);
        if (!snap.empty) {
          const cloudMsgs: CondolenceMessage[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as CondolenceMessage;
            cloudMsgs.push({ ...data, id: docSnap.id || data.id });
          });
          cloudMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return cloudMsgs.filter((m) => m.approved !== false);
        }
      } catch {}
    }

    return this.getMessagesFromCache(obituaryId);
  },

  async addMessage(
    param1: string | (Omit<CondolenceMessage, 'id' | 'createdAt' | 'approved'> & { obituaryId: string }),
    param2?: Omit<CondolenceMessage, 'id' | 'createdAt' | 'approved'>
  ): Promise<{ success: boolean; message?: CondolenceMessage; error?: string }> {
    try {
      let obituaryId: string;
      let messageData: Omit<CondolenceMessage, 'id' | 'createdAt' | 'approved'>;

      if (typeof param1 === 'string') {
        obituaryId = param1;
        messageData = param2!;
      } else {
        obituaryId = param1.obituaryId;
        messageData = param1;
      }

      const newMessage: CondolenceMessage = {
        ...messageData,
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        obituaryId,
        createdAt: new Date().toISOString(),
        approved: true,
      };

      try {
        const res = await fetch(`/api/obituaries/${encodeURIComponent(obituaryId)}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            return { success: true, message: data.message };
          }
        }
      } catch {}

      if (db) {
        try {
          const msgDocRef = doc(db, 'obituaries', obituaryId, 'messages', newMessage.id);
          await setDoc(msgDocRef, cleanForFirestore(newMessage));
          const obDocRef = doc(db, 'obituaries', obituaryId);
          await updateDoc(obDocRef, { messageCount: increment(1) });
        } catch {}
      }

      const allMessages = this.getAllMessages();
      allMessages.unshift(newMessage);
      safeSetItem(MESSAGES_CACHE_KEY, JSON.stringify(allMessages));

      const ob = await this.fetchObituaryById(obituaryId);
      if (ob) {
        ob.messageCount = (ob.messageCount || 0) + 1;
        this.updateLocalCacheItem(ob);
      }

      return { success: true, message: newMessage };
    } catch (err: any) {
      console.error('Error en addMessage:', err);
      return { success: false, error: err?.message || 'Error al guardar la condolencia.' };
    }
  },

  async toggleObituaryActive(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(id)}/toggle-active`, {
        method: 'PATCH',
        headers: { ...this.getAuthHeaders() },
      });
      if (res.ok) return true;
    } catch {}
    return true;
  },

  async updateObituaryRetention(id: string, retentionDays: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(id)}/retention`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ retentionDays }),
      });
      if (res.ok) return true;
    } catch {}
    return true;
  },

  async fetchAllAdminMessages(obituaryId?: string): Promise<CondolenceMessage[]> {
    try {
      const q = obituaryId && obituaryId !== 'all' ? `?obituaryId=${encodeURIComponent(obituaryId)}&includeUnapproved=true` : '?includeUnapproved=true';
      const res = await fetch(`/api/messages${q}`, {
        headers: { ...this.getAuthHeaders() },
      });
      if (res.ok) {
        const msgs = await res.json();
        if (Array.isArray(msgs)) return msgs;
      }
    } catch {}
    return this.getAllMessages();
  },

  async toggleMessageApproval(messageId: string, approved: boolean): Promise<void> {
    try {
      await fetch(`/api/messages/${encodeURIComponent(messageId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ approved }),
      });
    } catch {}
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await fetch(`/api/messages/${encodeURIComponent(messageId)}`, {
        method: 'DELETE',
        headers: { ...this.getAuthHeaders() },
      });
    } catch {}
  },

  async lightCandle(obituaryId: string): Promise<number> {
    try {
      const res = await fetch(`/api/obituaries/${encodeURIComponent(obituaryId)}/candle`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.candlesLitCount) {
          return data.candlesLitCount;
        }
      }
    } catch {}
    return 0;
  },

  getObituariesFromCache(): Obituary[] {
    try {
      const stored = safeGetItem(OBITUARIES_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    safeSetItem(OBITUARIES_CACHE_KEY, JSON.stringify(INITIAL_OBITUARIES));
    return INITIAL_OBITUARIES;
  },

  getMessagesFromCache(obituaryId: string): CondolenceMessage[] {
    try {
      const stored = safeGetItem(MESSAGES_CACHE_KEY);
      if (stored) {
        const all: CondolenceMessage[] = JSON.parse(stored);
        const filtered = all.filter((m) => m.obituaryId === obituaryId && m.approved !== false);
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return INITIAL_MESSAGES.filter((m) => m.obituaryId === obituaryId && m.approved !== false);
  },

  getAllMessages(): CondolenceMessage[] {
    try {
      const stored = safeGetItem(MESSAGES_CACHE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_MESSAGES;
  },

  updateLocalCacheItem(obituary: Obituary): void {
    const list = this.getObituariesFromCache();
    const idx = list.findIndex((o) => o.id === obituary.id);
    if (idx >= 0) {
      list[idx] = obituary;
    } else {
      list.unshift(obituary);
    }
    safeSetItem(OBITUARIES_CACHE_KEY, JSON.stringify(list));
  },

  getExpiredObituaries(): { expired: Obituary[]; active: Obituary[] } {
    const now = Date.now();
    const all = this.getObituariesFromCache();
    const expired = all.filter((o) => new Date(o.expiresAt).getTime() < now);
    const active = all.filter((o) => new Date(o.expiresAt).getTime() >= now);
    return { expired, active };
  },

  async purgeExpiredObituaries(confirmed: boolean = false): Promise<{ purgedCount: number; message: string }> {
    if (!confirmed) {
      return { purgedCount: 0, message: 'Operación cancelada: requiere confirmación explícita.' };
    }
    try {
      const res = await fetch('/api/purge-expired', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ confirmed: true }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { purgedCount: 0, message: 'Depuración completada.' };
  },
};
