import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { serverDb } from './server/database';
import { Obituary, AuthUser } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialise server-side Gemini client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// AUTHENTICATION & SESSION RESOLVER MIDDLEWARE
// -------------------------------------------------------------
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const tokenQuery = req.query.token as string | undefined;
  if (tokenQuery) return tokenQuery;
  return null;
}

function getRequestUser(req: Request): AuthUser | null {
  const token = extractToken(req);
  if (!token) return null;
  return serverDb.getUserByToken(token);
}

// Global session attachment middleware
app.use((req: any, _res: any, next: NextFunction) => {
  const user = getRequestUser(req);
  if (user) {
    req.session = {
      user,
      esAdmin: user.role === 'superadmin' || user.role === 'agency',
      isSuperAdmin: user.role === 'superadmin',
      isAgency: user.role === 'agency',
      agencyId: user.agencyId,
    };
  } else {
    req.session = {
      esAdmin: false,
      user: null,
      isSuperAdmin: false,
      isAgency: false,
    };
  }
  next();
});

// Strict administrative authentication middleware
export function verificarAutenticacionAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.session || !req.session.esAdmin) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(403).json({
        error: 'Acceso denegado. Se requiere iniciar sesión como administrador.',
      });
    }
    return res.status(403).send('Acceso denegado. Se requiere iniciar sesión como administrador.');
  }
  next();
}

// Strict super admin authorization middleware
export function verificarAutenticacionSuperAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.session || !req.session.esAdmin || !req.session.isSuperAdmin) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(403).json({
        error: 'Acceso denegado. Se requiere iniciar sesión como Super Administrador.',
      });
    }
    return res.status(403).send('Acceso denegado. Se requiere iniciar sesión como Super Administrador.');
  }
  next();
}

// -------------------------------------------------------------
// APP CONFIG & PUBLIC URL RESOLUTION
// -------------------------------------------------------------
app.get('/api/app-config', (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
  const requestUrl = `${proto}://${host}`;
  const publicUrl = process.env.APP_URL || requestUrl;
  res.json({
    appUrl: process.env.APP_URL || requestUrl,
    publicUrl,
  });
});

app.get('/api/system-status', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    aiAvailable: hasGeminiKey,
    modelName: 'gemini-3.8-flash',
    cloudStorageStatus: 'server_database_persistent_file_store',
    serverTime: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// AUTHENTICATION & MULTI-TENANT SAAS LOGIN
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Debes ingresar correo/usuario y contraseña.' });
  }

  const authResult = serverDb.authenticateUser(identifier, password);
  if (!authResult) {
    return res.status(401).json({
      error: 'Credenciales inválidas. Verifica tu usuario/correo y contraseña.',
    });
  }

  res.json({
    success: true,
    token: authResult.token,
    user: authResult.user,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getRequestUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false, error: 'Sesión no válida o expirada' });
  }
  res.json({ authenticated: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (token) {
    serverDb.revokeToken(token);
  }
  res.json({ success: true });
});

// Protected accounts helper: Strictly restricted to Super Admin (NEVER exposes passwords)
app.get('/api/auth/demo-accounts', verificarAutenticacionSuperAdmin, (req, res) => {
  const allUsers = serverDb.getUsers();
  const list = allUsers.map((u) => ({
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    agencyId: u.agencyId,
    agencyName: u.agencyName,
    description:
      u.role === 'superadmin'
        ? 'Super Admin - Acceso y control total de la plataforma SaaS y todas las funerarias'
        : `Funeraria aliada: ${u.agencyName} (Aislamiento estricto de datos)`,
  }));
  res.json(list);
});

// -------------------------------------------------------------
// ADMINISTRATIVE ROUTE ISOLATION & ENDPOINTS (/admin, /gestion)
// -------------------------------------------------------------
const adminApiRouter = express.Router();
adminApiRouter.use(verificarAutenticacionAdmin);

adminApiRouter.get('/status', (req: any, res: Response) => {
  res.json({
    authenticated: true,
    esAdmin: true,
    user: req.session.user,
  });
});

app.use('/api/admin', adminApiRouter);
app.use('/api/gestion', adminApiRouter);

// -------------------------------------------------------------
// AGENCIES & FUNERAL HOMES API (MULTI-TENANT WHITE-LABEL SAAS)
// -------------------------------------------------------------
app.get('/api/agencies', (req, res) => {
  const user = getRequestUser(req);
  const allAgencies = serverDb.getAgencies();

  // If request comes from an authenticated agency, they only see their agency
  if (user && user.role === 'agency' && user.agencyId) {
    const single = allAgencies.filter((a) => a.id.toLowerCase() === user.agencyId!.toLowerCase());
    return res.json(single);
  }

  // Super Admin or public link viewing receives agency list
  res.json(allAgencies);
});

app.get('/api/agencies/:id', (req, res) => {
  const agency = serverDb.getAgencyById(req.params.id);
  if (!agency) {
    return res.status(404).json({ error: 'Funeraria o marca no encontrada' });
  }
  res.json(agency);
});

app.post('/api/agencies', verificarAutenticacionSuperAdmin, (req, res) => {
  try {
    const user = getRequestUser(req);

    // Strict RBAC: Only Super Admin can register new partner agencies
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({
        error: 'Acceso denegado: Solo el Super Administrador puede crear y dar de alta nuevas agencias funerarias.',
      });
    }

    const data = req.body;
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ error: 'El nombre de la funeraria es obligatorio.' });
    }

    const normalizedName = data.name.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanSlug = normalizedName
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = data.id || cleanSlug || `agencia-${Date.now().toString(36)}`;

    const loginUsername = (data.loginUsername || id).trim().toLowerCase();
    const loginEmail = (data.loginEmail || data.email || `${id}@esquelas.pro`).trim().toLowerCase();
    const loginPassword = data.loginPassword?.trim() || `${data.name.split(' ')[0]}2026!`;

    const newAgency = {
      id,
      name: data.name.trim(),
      tagline: data.tagline?.trim() || 'Dignidad, respeto y calidez en cada memoria',
      logoUrl: data.logoUrl || '',
      primaryColor: data.primaryColor || '#8C733E',
      secondaryColor: data.secondaryColor || '#C5A059',
      backgroundColor: data.backgroundColor || '#FAF8F5',
      textColor: data.textColor || '#2A231C',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      websiteUrl: data.websiteUrl?.trim() || '',
      defaultRetentionDays: Number(data.defaultRetentionDays) || 30,
      watermarkSignature: data.watermarkSignature?.trim() || `Homenaje provisto por ${data.name.trim()}`,
      isDefault: Boolean(data.isDefault),
      loginUsername,
      loginEmail,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    serverDb.saveAgency(newAgency);
    // Create linked login account for this agency
    serverDb.saveUserForAgency(newAgency, loginPassword, loginUsername, loginEmail);

    res.status(201).json({
      success: true,
      agency: newAgency,
      account: {
        username: loginUsername,
        email: loginEmail,
        password: loginPassword,
      },
    });
  } catch (err: any) {
    console.error('Error al guardar funeraria:', err);
    res.status(500).json({ error: 'Error al registrar la funeraria.' });
  }
});

app.put('/api/agencies/:id', verificarAutenticacionAdmin, (req, res) => {
  try {
    const user = getRequestUser(req);
    const existing = serverDb.getAgencyById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Funeraria no encontrada' });
    }

    // Strict multi-tenant authorization
    if (user && user.role === 'agency') {
      if (!user.agencyId || user.agencyId.toLowerCase() !== existing.id.toLowerCase()) {
        return res.status(403).json({
          error: 'Acceso denegado: Queda estrictamente prohibido modificar los datos de otra funeraria.',
        });
      }
    }

    const updated = serverDb.saveAgency({
      ...existing,
      ...req.body,
      id: existing.id, // Immutable ID
    });

    // Update linked user account if credentials supplied
    if (req.body.loginPassword || req.body.loginUsername || req.body.loginEmail) {
      serverDb.saveUserForAgency(
        updated,
        req.body.loginPassword,
        req.body.loginUsername,
        req.body.loginEmail
      );
    }

    res.json({ success: true, agency: updated });
  } catch (err: any) {
    console.error('Error al actualizar funeraria:', err);
    res.status(500).json({ error: 'Error al actualizar funeraria.' });
  }
});

app.delete('/api/agencies/:id', verificarAutenticacionSuperAdmin, (req, res) => {
  const user = getRequestUser(req);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Acceso denegado: Solo el Super Administrador puede dar de baja una funeraria.',
    });
  }

  const deleted = serverDb.deleteAgency(req.params.id);
  if (!deleted) {
    return res.status(400).json({ error: 'No se puede eliminar la funeraria predeterminada o única.' });
  }
  res.json({ success: true });
});

// Update agency account password (Super Admin or Agency itself)
app.put('/api/agencies/:id/credentials', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión.' });
  }

  const agencyId = req.params.id;
  if (user.role === 'agency' && user.agencyId?.toLowerCase() !== agencyId.toLowerCase()) {
    return res.status(403).json({ error: 'No puedes cambiar credenciales de otra agencia.' });
  }

  const agency = serverDb.getAgencyById(agencyId);
  if (!agency) {
    return res.status(404).json({ error: 'Funeraria no encontrada.' });
  }

  const { password, username, email } = req.body;
  if (!password || password.trim().length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
  }

  const updatedRecord = serverDb.saveUserForAgency(agency, password.trim(), username, email);
  res.json({
    success: true,
    message: `Credenciales de acceso para ${agency.name} actualizadas.`,
    username: updatedRecord.username,
    email: updatedRecord.email,
  });
});

app.get('/api/stats', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  let agencyId = req.query.agencyId as string | undefined;

  // Strict tenant data isolation
  if (user && user.role === 'agency') {
    agencyId = user.agencyId;
  }

  res.json(serverDb.getMetrics(agencyId));
});

// -------------------------------------------------------------
// OBITUARIES API (STRICT MULTI-TENANT ISOLATION)
// -------------------------------------------------------------
app.get('/api/obituaries', (req, res) => {
  const user = getRequestUser(req);
  let agencyId = req.query.agencyId as string | undefined;

  // Strict isolation: An agency user can ONLY fetch and view their own obituaries
  if (user && user.role === 'agency') {
    agencyId = user.agencyId;
  }

  res.json(serverDb.getObituaries(agencyId));
});

app.get('/api/obituaries/:id', (req, res) => {
  // Public viewing of an individual obituary is ALWAYS permitted so QR codes and family links work
  const obituary = serverDb.getObituaryById(req.params.id);
  if (!obituary) {
    return res.status(404).json({ error: 'Esta esquela no está disponible', notFound: true });
  }
  res.json(obituary);
});

app.post('/api/obituaries', verificarAutenticacionAdmin, (req, res) => {
  try {
    const user = getRequestUser(req);
    const data = req.body;

    if (!data.fullName || !data.epitaph) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre completo y homenaje).' });
    }

    // Assign immutable unique ID if not set
    const id = data.id || `esq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const retentionDays = Number(data.retentionDays) || 30;
    const expiresAt = data.expiresAt || new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();

    // Strict multi-tenant attribution:
    // If an agency client creates an obituary, it is strictly forced to their own agencyId
    let finalAgencyId = data.agencyId || 'funeraria-san-angel';
    if (user && user.role === 'agency' && user.agencyId) {
      finalAgencyId = user.agencyId;
    }

    const agency = serverDb.getAgencyById(finalAgencyId);

    const newObituary: Obituary = {
      ...data,
      id,
      slug: data.slug || id,
      agencyId: finalAgencyId,
      agencyName: agency?.name || data.agencyName || 'Grupo Funeral San Ángel',
      fullName: data.fullName.trim(),
      birthDate: data.birthDate,
      deathDate: data.deathDate,
      photoUrl: data.photoUrl || '',
      epitaph: data.epitaph.trim(),
      biography: data.biography?.trim() || undefined,
      ceremonyDetails: data.ceremonyDetails?.trim() || undefined,
      familyQuote: data.familyQuote?.trim() || undefined,
      createdAt: data.createdAt || now.toISOString(),
      expiresAt,
      retentionDays,
      maxMessages: 50,
      messageCount: data.messageCount || 0,
      candlesLitCount: data.candlesLitCount || 0,
      isActive: true,
    };

    serverDb.saveObituary(newObituary, finalAgencyId);
    return res.status(201).json({ success: true, obituary: newObituary });
  } catch (err: any) {
    console.error('Error al guardar esquela en base de datos:', err);
    return res.status(500).json({ error: 'Error interno al guardar la esquela.' });
  }
});

app.put('/api/obituaries/:id', verificarAutenticacionAdmin, (req, res) => {
  try {
    const user = getRequestUser(req);
    const existing = serverDb.getObituaryById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Esquela no encontrada' });
    }

    // Strict tenant isolation: Agency can only modify their own obituaries
    if (user && user.role === 'agency') {
      if ((existing.agencyId || '').toLowerCase() !== (user.agencyId || '').toLowerCase()) {
        return res.status(403).json({
          error: 'Acceso denegado: Queda estrictamente prohibido modificar las esquelas de otras funerarias.',
        });
      }
    }

    const finalAgencyId = user && user.role === 'agency' ? user.agencyId! : (req.body.agencyId || existing.agencyId);
    const agency = serverDb.getAgencyById(finalAgencyId);

    const updatedOb: Obituary = {
      ...existing,
      ...req.body,
      id: existing.id,
      agencyId: finalAgencyId,
      agencyName: agency?.name || existing.agencyName,
    };

    serverDb.saveObituary(updatedOb, finalAgencyId);
    res.json({ success: true, obituary: updatedOb });
  } catch (err: any) {
    console.error('Error al actualizar esquela:', err);
    res.status(500).json({ error: 'Error al actualizar esquela.' });
  }
});

app.delete('/api/obituaries/:id', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const existing = serverDb.getObituaryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Esquela no encontrada' });
  }

  // Strict tenant isolation check
  if (user && user.role === 'agency') {
    if ((existing.agencyId || '').toLowerCase() !== (user.agencyId || '').toLowerCase()) {
      return res.status(403).json({
        error: 'Acceso denegado: No puedes eliminar esquelas pertenecientes a otra funeraria.',
      });
    }
  }

  const deleted = serverDb.deleteObituary(req.params.id, user?.role === 'agency' ? user.agencyId : undefined);
  res.json({ success: deleted });
});

// -------------------------------------------------------------
// CONDOLENCE MESSAGES API (STRICTLY ASSOCIATED TO OBITUARY ID)
// -------------------------------------------------------------
app.get('/api/obituaries/:id/messages', (req, res) => {
  const messages = serverDb.getMessagesByObituary(req.params.id);
  res.json(messages);
});

app.post('/api/obituaries/:id/messages', (req, res) => {
  try {
    const obituaryId = req.params.id;
    const { authorName, content, relationship, originalContent, isAiEnriched, symbol } = req.body;
    if (!obituaryId || !authorName || !content) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios del mensaje.' });
    }

    const result = serverDb.addMessage({
      obituaryId,
      authorName: authorName.trim(),
      content: content.trim(),
      relationship: relationship || 'Familiar',
      originalContent: originalContent?.trim() || content.trim(),
      isAiEnriched: Boolean(isAiEnriched),
      symbol: symbol || 'candle',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err: any) {
    console.error('Error al guardar condolencia:', err);
    res.status(500).json({ success: false, error: 'Error interno al guardar el mensaje.' });
  }
});

app.delete('/api/obituaries/:id/messages/:messageId', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const deleted = serverDb.deleteMessage(req.params.messageId, allowedAgency);
  if (!deleted) {
    return res.status(403).json({ error: 'No autorizado para eliminar este mensaje.' });
  }
  res.json({ success: deleted });
});

app.get('/api/messages', (req, res) => {
  const user = getRequestUser(req);
  const obituaryId = req.query.obituaryId as string | undefined;
  const includeUnapproved = req.query.includeUnapproved === 'true' || req.query.admin === 'true';

  // Strict tenant data isolation
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;

  res.json(serverDb.getAllMessages(obituaryId, includeUnapproved, allowedAgency));
});

app.patch('/api/messages/:id', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const { approved } = req.body;
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const success = serverDb.toggleMessageApproval(req.params.id, approved, allowedAgency);
  if (!success) {
    return res.status(403).json({ error: 'No autorizado para moderar este mensaje.' });
  }
  res.json({ success });
});

app.patch('/api/obituaries/:id/retention', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const { retentionDays } = req.body;
  if (!retentionDays || isNaN(Number(retentionDays))) {
    return res.status(400).json({ error: 'retentionDays inválido' });
  }
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const success = serverDb.updateObituaryRetention(req.params.id, Number(retentionDays), allowedAgency);
  if (!success) {
    return res.status(403).json({ error: 'No autorizado para modificar esta esquela.' });
  }
  res.json({ success });
});

app.patch('/api/obituaries/:id/toggle-active', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const success = serverDb.toggleObituaryActive(req.params.id, allowedAgency);
  if (!success) {
    return res.status(403).json({ error: 'No autorizado para modificar esta esquela.' });
  }
  res.json({ success });
});

app.post('/api/messages', (req, res) => {
  try {
    const { obituaryId, authorName, content, relationship, originalContent, isAiEnriched, symbol } = req.body;
    if (!obituaryId || !authorName || !content) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios del mensaje.' });
    }

    const result = serverDb.addMessage({
      obituaryId,
      authorName: authorName.trim(),
      content: content.trim(),
      relationship: relationship || 'Familiar',
      originalContent: originalContent?.trim() || content.trim(),
      isAiEnriched: Boolean(isAiEnriched),
      symbol: symbol || 'candle',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err: any) {
    console.error('Error al guardar condolencia:', err);
    res.status(500).json({ success: false, error: 'Error interno al guardar el mensaje.' });
  }
});

app.delete('/api/messages/:id', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const deleted = serverDb.deleteMessage(req.params.id, allowedAgency);
  if (!deleted) {
    return res.status(403).json({ error: 'No autorizado para eliminar este mensaje.' });
  }
  res.json({ success: deleted });
});

app.post('/api/obituaries/:id/candle', (req, res) => {
  const count = serverDb.lightCandle(req.params.id);
  res.json({ candlesLitCount: count });
});

app.post('/api/purge-expired', verificarAutenticacionAdmin, (req, res) => {
  const user = getRequestUser(req);
  const { confirmed } = req.body;
  if (!confirmed) {
    return res.status(400).json({ message: 'Se requiere confirmación explícita.' });
  }
  const now = Date.now();
  const allowedAgency = user && user.role === 'agency' ? user.agencyId : undefined;
  const all = serverDb.getObituaries(allowedAgency);
  const expired = all.filter((o) => new Date(o.expiresAt).getTime() <= now);
  for (const exp of expired) {
    serverDb.deleteObituary(exp.id, allowedAgency);
  }
  res.json({
    purgedCount: expired.length,
    remainingCount: all.length - expired.length,
    message: `Se eliminaron de forma segura ${expired.length} esquela(s) vencidas.`,
  });
});

// -------------------------------------------------------------
// AI ENRICHMENT ROUTE (GEMINI)
// -------------------------------------------------------------
app.post('/api/enrich-condolence', async (req, res) => {
  try {
    const { message, deceasedName, relationship } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor.',
        offlineMode: true,
      });
    }

    const ai = geminiClient || new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Actúa como un redactor profesional empático, solemne y compasivo especializado en libros de condolencias y homenajes.
Tu tarea es enriquecer y pulir el siguiente mensaje escrito para la memoria de ${deceasedName ? `"${deceasedName}"` : 'la persona fallecida'}${relationship ? ` (parentesco/relación del remitente: ${relationship})` : ''}.

REGLAS ESTRICTAS:
1. Mejora la ortografía, la puntuación, la sintaxis y la sensibilidad lírica y respetuosa del texto.
2. NUNCA inventes recuerdos personales, nombres no mencionados, anécdotas ficticias ni circunstancias del fallecimiento.
3. Respeta enteramente los sentimientos y el significado original expresado por la persona.
4. El mensaje mejorado debe ser cálido, digno y no superar las 250 palabras.
5. Devuelve ÚNICAMENTE el texto enriquecido, sin explicaciones ni encabezados adicionales.

Mensaje original del remitente:
"""${message}"""`;

    let enrichedText = message;
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            temperature: 0.4,
          },
        });

        if (response.text) {
          enrichedText = response.text.trim();
          lastError = null;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Intento con ${model} falló, intentando siguiente modelo...`, err?.message || err);
      }
    }

    if (lastError && enrichedText === message) {
      return res.status(503).json({
        error: 'El servicio de IA está experimentando alta demanda momentánea. Por favor intenta de nuevo en unos instantes o publica tu mensaje original.',
      });
    }

    return res.json({
      success: true,
      originalText: message,
      enrichedText: enrichedText,
    });
  } catch (error: any) {
    console.error('Error enriqueciendo mensaje con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar la solicitud con IA.',
    });
  }
});

// Catch-all for API endpoints to prevent HTML fallback from Vite SPA middleware
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error iniciando el servidor:', err);
});
