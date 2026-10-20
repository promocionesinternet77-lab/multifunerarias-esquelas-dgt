/**
 * Utilidades para resolución de URLs públicas e individuales de cada esquela.
 * Garantiza enlaces canónicos públicos y códigos QR universales para compartir por WhatsApp,
 * redes sociales y lectura desde cualquier dispositivo móvil o computadora.
 */

import { Obituary } from '../types';

/**
 * URL pública oficial de la aplicación publicada.
 * Sustituye cualquier dominio temporal o de desarrollo (ais-dev-...run.app).
 */
/**
 * Obtiene el dominio base real y dinámico de la plataforma.
 * Toma siempre de forma dinámica el origen actual del navegador (window.location.origin)
 * para que los códigos QR y enlaces para compartir abran de forma exacta y directa la
 * esquela correspondiente en el entorno actual.
 */
export function resolveClientPublicBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin && origin !== 'null' && origin.trim() !== '') {
      return origin.replace(/\/+$/, '');
    }
  }

  return '';
}

/**
 * Genera la URL individual completa y permanente para una esquela específica.
 * Toma dinámicamente el origen actual de la plataforma (window.location.origin)
 * e incorpora el identificador de la esquela y de la funeraria o marca.
 */
export function getObituaryIndividualUrl(
  obituary: (Pick<Obituary, 'id'> & { agencyId?: string }) | string,
  forcedAgencyId?: string
): string {
  const rawId = typeof obituary === 'string' ? obituary : obituary.id;
  const id = (rawId || '').trim();
  const agencyId = forcedAgencyId || (typeof obituary !== 'string' ? obituary.agencyId : undefined);
  const baseUrl = resolveClientPublicBaseUrl();
  
  const base = baseUrl ? baseUrl : '';
  let url = `${base}/?esquela=${encodeURIComponent(id)}`;
  if (agencyId && agencyId !== 'all') {
    url += `&funeraria=${encodeURIComponent(agencyId)}`;
  }
  return url;
}

/**
 * Extrae el identificador de la esquela desde la URL actual del navegador.
 * Lee prioritariamente el parámetro de consulta "?esquela=IDENTIFICADOR" o "?id=IDENTIFICADOR".
 * Limpia espacios y barras finales para evitar errores de búsqueda.
 */
export function getObituaryIdFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Parámetro de consulta principal ?esquela=IDENTIFICADOR o ?id=IDENTIFICADOR
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('esquela') || params.get('id');
  if (fromQuery && fromQuery.trim()) {
    return decodeURIComponent(fromQuery.trim()).replace(/\/+$/, '');
  }

  // 2. Ruta de fallback /esquela/IDENTIFICADOR si alguien la teclea directamente
  const path = window.location.pathname;
  const match = path.match(/^\/esquela\/([^/?#]+)/i);
  if (match && match[1]) {
    return decodeURIComponent(match[1].trim()).replace(/\/+$/, '');
  }

  // 3. Fallback en hash (#esquela=ID o #/?esquela=ID)
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const searchIdx = hash.indexOf('?');
    const queryPart = searchIdx >= 0 ? hash.substring(searchIdx + 1) : hash;
    const hashParams = new URLSearchParams(queryPart);
    const fromHash = hashParams.get('esquela') || hashParams.get('id');
    if (fromHash && fromHash.trim()) {
      return decodeURIComponent(fromHash.trim()).replace(/\/+$/, '');
    }
  }

  return null;
}

/**
 * Extrae el identificador de la funeraria o marca desde la URL actual.
 * Lee los parámetros "?funeraria=SLUG", "?agencia=SLUG" o "?brand=SLUG".
 */
export function getAgencyIdFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const agency = params.get('funeraria') || params.get('agencia') || params.get('brand');
  if (agency && agency.trim()) {
    return decodeURIComponent(agency.trim()).toLowerCase();
  }
  return null;
}
