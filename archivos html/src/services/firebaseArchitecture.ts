/**
 * Arquitectura de Base de Datos Firebase Firestore & Políticas de Seguridad
 * Diseñada para soportar hasta 2,000 esquelas y 100,000 mensajes de condolencias con alta concurrencia.
 */

export interface FirebaseConfigGuide {
  collectionsStructure: {
    name: string;
    description: string;
    documentLimit: string;
    schema: Record<string, string>;
  }[];
  firestoreRules: string;
  cloudFunctionsTtl: string;
  scalabilitySummary: string[];
}

export const FIREBASE_ARCHITECTURE: FirebaseConfigGuide = {
  collectionsStructure: [
    {
      name: 'obituaries (Colección principal)',
      description: 'Almacena metadatos ligeros de cada esquela. Permite listar y buscar sin transferir mensajes masivos.',
      documentLimit: '2,000 documentos estimados (~1.5 MB total)',
      schema: {
        id: 'string (UUID o slug único)',
        slug: 'string (URL amigable indexada)',
        fullName: 'string (Nombre completo de la persona fallecida)',
        birthDate: 'string (YYYY-MM-DD)',
        deathDate: 'string (YYYY-MM-DD)',
        photoUrl: 'string (URL a Firebase Storage / Cloudinary)',
        epitaph: 'string (Homenaje de 1-3 párrafos)',
        biography: 'string (Opcional)',
        ceremonyDetails: 'string (Opcional)',
        familyQuote: 'string (Opcional)',
        createdAt: 'timestamp (Fecha de publicación)',
        expiresAt: 'timestamp (createdAt + retentionDays, e.g. 30 días)',
        retentionDays: 'number (Default: 30)',
        maxMessages: 'number (Default: 50)',
        messageCount: 'number (Contador atómico con FieldValue.increment)',
        candlesLitCount: 'number (Contador atómico)',
        isActive: 'boolean',
      },
    },
    {
      name: 'obituaries/{obituaryId}/messages (Subcolección escalable)',
      description: 'Cada condolencia es un documento independiente en la subcolección. Evita el límite de 1MB por documento de Firestore y permite crecer hasta 100,000 mensajes globales.',
      documentLimit: 'Hasta 50 documentos por esquela (máx 100,000 en todo el sistema)',
      schema: {
        id: 'string (Auto-generado)',
        obituaryId: 'string (Referencia padre)',
        authorName: 'string (Nombre del firmante, máx 100 caracteres)',
        relationship: 'string (Parentesco o amistad)',
        originalContent: 'string (Mensaje original escrito por el usuario)',
        content: 'string (Mensaje publicado, revisado o enriquecido)',
        isAiEnriched: 'boolean',
        symbol: 'string (candle | flower | cross | dove | prayer)',
        createdAt: 'timestamp',
        approved: 'boolean (Default: true con moderación administrativa)',
      },
    },
  ],
  firestoreRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar si es administrador autenticado
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    // Reglas para la colección principal de esquelas
    match /obituaries/{obituaryId} {
      // Lectura pública para cualquier persona con el enlace o QR
      allow read: if true;
      
      // Solo administradores autorizados pueden crear, editar o eliminar esquelas
      allow create, update, delete: if isAdmin();
      
      // Subcolección de mensajes de condolencias
      match /messages/{messageId} {
        // Lectura pública para familiares y amigos
        allow read: if true;
        
        // Creación pública permitida bajo estrictas reglas de validación:
        // 1. Debe tener nombre y mensaje no vacíos
        // 2. El mensaje no debe exceder 250 palabras (~1,800 caracteres)
        // 3. No puede alterar la esquela si ya alcanzó los 50 mensajes
        allow create: if request.resource.data.authorName is string
                      && request.resource.data.authorName.size() > 0
                      && request.resource.data.authorName.size() <= 100
                      && request.resource.data.content is string
                      && request.resource.data.content.size() > 0
                      && request.resource.data.content.size() <= 2000
                      && request.resource.data.symbol in ['candle', 'flower', 'cross', 'dove', 'prayer']
                      && get(/databases/$(database)/documents/obituaries/$(obituaryId)).data.messageCount < 50;
                      
        // Solo el administrador puede modificar o eliminar mensajes (moderación)
        allow update, delete: if isAdmin();
      }
    }
  }
}`,
  cloudFunctionsTtl: `/**
 * Cloud Function programada para eliminación segura de esquelas vencidas (TTL 30 días)
 * Se ejecuta automáticamente una vez al día a las 03:00 AM UTC.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const purgeExpiredObituariesScheduled = onSchedule("every day 03:00", async (event) => {
  const now = admin.firestore.Timestamp.now();
  
  // Consulta esquelas cuya fecha de expiración haya pasado
  const expiredQuery = await db.collection("obituaries")
    .where("expiresAt", "<=", now)
    .where("isActive", "==", true)
    .limit(100) // Procesamiento por lotes seguro
    .get();

  if (expiredQuery.empty) {
    console.log("No hay esquelas vencidas para depurar.");
    return;
  }

  const batch = db.batch();
  for (const doc of expiredQuery.docs) {
    // 1. Eliminar mensajes de la subcolección
    const messagesSnap = await doc.ref.collection("messages").get();
    for (const msgDoc of messagesSnap.docs) {
      batch.delete(msgDoc.ref);
    }
    // 2. Eliminar esquela principal o marcarla como archivada
    batch.delete(doc.ref);
  }

  await batch.commit();
  console.log(\`Depuradas exitosamente \${expiredQuery.size} esquelas vencidas.\`);
});`,
  scalabilitySummary: [
    'Subcolecciones independientes: Las condolencias no se almacenan en un array dentro del documento de la esquela, garantizando que cada esquela permanezca bajo 2KB y las lecturas sean instantáneas.',
    'Escala hasta 2,000 esquelas: Al listar o filtrar, solo se consultan documentos ligeros con paginación (`limit(20)`), lo que cuesta fracciones de centavo en Firebase.',
    'Límite de 50 mensajes: Controlado tanto a nivel interfaz de usuario como reforzado en `firestore.rules` (`messageCount < 50`), previniendo spam o sobrecostos.',
    'Índices Compuestos recomendados: Índice compuesto en `obituaries` sobre `[expiresAt ASC, isActive ASC]` para la limpieza automática y `[createdAt DESC]` para el listado general.',
  ],
};
