import React, { useState } from 'react';
import { Share2, QrCode, Flame, Calendar, Clock, MapPin, Heart, Copy, Check, Pencil, Building2, Phone, Globe } from 'lucide-react';
import { Obituary } from '../types';
import { FloralDivider, FloralCorner, MemorialCross, OliveSprig } from './FloralMotif';
import { storageService } from '../services/storage';
import { getObituaryIndividualUrl } from '../services/urlUtils';
import { useBrand } from '../context/BrandContext';

interface ObituaryCardProps {
  obituary: Obituary;
  onOpenQRModal: () => void;
  onOpenCondolenceModal: () => void;
  onCandleLit: () => void;
  onEditObituary?: (obituary: Obituary) => void;
}

export function ObituaryCard({
  obituary,
  onOpenQRModal,
  onOpenCondolenceModal,
  onCandleLit,
  onEditObituary,
}: ObituaryCardProps) {
  const [justLit, setJustLit] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { currentAgency, agencies } = useBrand();

  // Find agency corresponding to this obituary if different from current
  const obituaryAgency = obituary.agencyId
    ? agencies.find((a) => a.id === obituary.agencyId) || currentAgency
    : currentAgency;

  const brandPrimary = obituaryAgency?.primaryColor || '#8C733E';
  const brandSecondary = obituaryAgency?.secondaryColor || '#C5A059';

  // Calculate days remaining
  const now = Date.now();
  const expireDate = new Date(obituary.expiresAt).getTime();
  const isPerpetual = (obituary.retentionDays || 30) >= 3650; // >= 10 years considered perpetual
  const daysRemaining = Math.max(0, Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24)));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleLightCandle = () => {
    storageService.lightCandle(obituary.id);
    setJustLit(true);
    onCandleLit();
    setTimeout(() => setJustLit(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = getObituaryIndividualUrl(obituary, obituaryAgency?.id);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <article className="relative w-full max-w-2xl mx-auto bg-[#FAF8F5] border border-[#E3D7C1] rounded-2xl shadow-xl p-6 sm:p-10 text-[#2C2723] overflow-hidden">
      {/* Decorative floral corners */}
      <div className="absolute top-3 left-3">
        <FloralCorner position="top-left" />
      </div>
      <div className="absolute top-3 right-3">
        <FloralCorner position="top-right" />
      </div>
      <div className="absolute bottom-3 left-3">
        <FloralCorner position="bottom-left" />
      </div>
      <div className="absolute bottom-3 right-3">
        <FloralCorner position="bottom-right" />
      </div>

      {/* Funeral Home Header & Logo Stamp */}
      <div className="relative z-10 text-center pb-2 mb-2 border-b border-[#ECE2D2]/60">
        {obituaryAgency?.logoUrl && obituaryAgency.logoUrl.trim() !== '' ? (
          <div className="flex flex-col items-center justify-center mb-2">
            <img
              src={obituaryAgency.logoUrl}
              alt={obituaryAgency.name}
              className="h-10 sm:h-12 max-w-[190px] object-contain mx-auto"
            />
            {obituaryAgency.tagline && (
              <span className="text-[10px] sm:text-[11px] text-[#7A6B5D] italic tracking-wide mt-1">
                {obituaryAgency.tagline}
              </span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EDE0] border border-[#DFCFA8] rounded-full text-[11px] font-semibold text-[#57493D] shadow-2xs">
            <Building2 className="w-3.5 h-3.5" style={{ color: brandPrimary }} />
            <span>{obituaryAgency?.name || 'Servicio Funeral'}</span>
          </div>
        )}
      </div>

      {/* Top Memorial Header */}
      <header className="text-center relative z-10 pt-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MemorialCross className="w-5 h-5" style={{ color: brandPrimary }} />
        </div>
        <span
          className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-medium block"
          style={{ color: brandPrimary }}
        >
          En Memoria Eterna
        </span>
        <h1 className="font-memorial-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2 text-[#2A231C] tracking-wide leading-tight">
          {obituary.fullName}
        </h1>

        {/* Birth & Passing Dates */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 text-xs sm:text-sm text-[#6B5C4F]">
          <span className="font-medium">{formatDate(obituary.birthDate)}</span>
          <span style={{ color: brandSecondary }}>•</span>
          <span className="text-[18px] sm:text-[20px] font-normal italic text-center">
            {formatDate(obituary.deathDate)}
          </span>
        </div>
      </header>

      {/* Photo with dignified gold/brand frame */}
      <div className="relative my-7 flex justify-center z-10">
        <div
          className="relative p-2 rounded-2xl shadow-md transition-all"
          style={{
            background: `linear-gradient(to bottom, #E7DBCA, #F4EFE6, ${brandSecondary}40)`,
          }}
        >
          <div className="overflow-hidden rounded-xl w-44 h-56 sm:w-56 sm:h-72 bg-[#EFE9DD] border border-[#D5C6AF]">
            {obituary.photoUrl && obituary.photoUrl.trim() !== '' ? (
              <img
                src={obituary.photoUrl}
                alt={`Fotografía de ${obituary.fullName}`}
                className="w-full h-full object-cover object-center filter saturate-90 brightness-98 transition-all hover:scale-102 duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7B6B] p-4 text-center">
                <OliveSprig className="w-12 h-12 mb-2" style={{ color: brandPrimary }} />
                <span className="text-xs">Fotografía memorial</span>
              </div>
            )}
          </div>
          {/* Subtle gold ribbon or accent below photo */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FAF6EE] border rounded-full shadow-xs flex items-center gap-1.5 text-[11px] font-medium text-[#7A6436]"
            style={{ borderColor: brandSecondary }}
          >
            <span>🕊️</span>
            <span>Descansa en Paz</span>
          </div>
        </div>
      </div>

      <FloralDivider className="my-5" />

      {/* Main Epitaph / Homenaje */}
      <div className="relative z-10 text-center px-2 sm:px-6">
        <blockquote className="font-memorial-serif text-lg sm:text-xl md:text-2xl italic text-[#1E1915] leading-relaxed bg-[#EBE7DF]/80 border border-[#E0D5C3] p-4 sm:p-5 rounded-2xl shadow-2xs">
          «{obituary.epitaph}»
        </blockquote>

        {obituary.familyQuote && (
          <p className="mt-4 text-xs sm:text-sm text-[#736353] font-medium tracking-wide">
            {obituary.familyQuote}
          </p>
        )}
      </div>

      {/* Biography & Ceremony Details */}
      {(obituary.biography || obituary.ceremonyDetails) && (
        <div className="relative z-10 mt-7 space-y-4 pt-5 border-t border-[#ECE3D4]">
          {obituary.biography && (
            <div className="bg-[#FAF6EE]/80 border border-[#E9DFCF] rounded-xl p-4 sm:p-5 text-left">
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: brandPrimary }}
              >
                <OliveSprig className="w-4 h-4" style={{ color: brandPrimary }} /> Semblanza y Recuerdo
              </h4>
              <p className="text-xs sm:text-sm text-[#4E4136] leading-relaxed">
                {obituary.biography}
              </p>
            </div>
          )}

          {obituary.ceremonyDetails && (
            <div className="bg-[#FAF6EE]/80 border border-[#E9DFCF] rounded-xl p-4 sm:p-5 text-left">
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: brandPrimary }}
              >
                <MapPin className="w-4 h-4" style={{ color: brandPrimary }} /> Servicios y Ceremonia
              </h4>
              <p className="text-xs sm:text-sm text-[#4E4136] leading-relaxed">
                {obituary.ceremonyDetails}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Tribute: Light a virtual candle */}
      <div className="relative z-10 mt-7 p-4 bg-gradient-to-r from-[#F9F4EB] via-[#F4EDE0] to-[#F9F4EB] border border-[#DFD2BC] rounded-xl text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-xs font-semibold text-[#4A3D31] flex items-center justify-center sm:justify-start gap-1.5">
              <Flame className={`w-4 h-4 text-[#D97706] ${justLit ? 'animate-bounce' : ''}`} />
              Velas virtuales encendidas
            </span>
            <span className="text-xs text-[#736455]">
              {obituary.candlesLitCount || 0} personas han encendido una luz en su memoria
            </span>
          </div>

          <button
            onClick={handleLightCandle}
            className={`py-2 px-4 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 ${
              justLit
                ? 'bg-[#E59837] text-white scale-102'
                : 'bg-white hover:bg-[#F8F4EC] text-[#7A6436] border border-[#D5C6AF]'
            }`}
          >
            <span>🕯️</span>
            <span>{justLit ? '¡Luz encendida!' : 'Encender una vela'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Leave Condolence, Share, QR */}
      <div className="relative z-10 mt-7 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EAE0D0]">
        <button
          onClick={onOpenCondolenceModal}
          type="button"
          className="w-full sm:w-auto py-3 px-6 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[46px] cursor-pointer"
          style={{ backgroundColor: brandPrimary }}
        >
          <Heart className="w-4 h-4 fill-white/20 shrink-0" />
          <span>Escribir en el Libro de Condolencias</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyLink}
            type="button"
            title="Copiar enlace"
            className="flex-1 sm:flex-none py-2.5 px-4 bg-white hover:bg-[#F2ECE1] border border-[#D9CDB8] text-[#524538] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px] cursor-pointer shadow-2xs active:scale-95"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" style={{ color: brandPrimary }} />}
            <span>{linkCopied ? '¡Copiado!' : 'Copiar enlace'}</span>
          </button>

          <button
            onClick={onOpenQRModal}
            type="button"
            className="flex-1 sm:flex-none py-2.5 px-4 bg-white hover:bg-[#F2ECE1] border border-[#D9CDB8] text-[#524538] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs min-h-[44px] cursor-pointer active:scale-95"
          >
            <QrCode className="w-4 h-4" style={{ color: brandPrimary }} />
            <span>Código QR</span>
          </button>
        </div>
      </div>

      {/* White-Label Footer & Funeral Home Signature */}
      <div className="relative z-10 mt-6 pt-4 border-t border-[#ECE3D4] space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A6B5D]">
          <div className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5" style={{ color: brandPrimary }} />
            <span>{obituaryAgency?.watermarkSignature || `Homenaje provisto por ${obituaryAgency?.name}`}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8C7B6B]">
            {obituaryAgency?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#A89886]" />
                {obituaryAgency.phone}
              </span>
            )}
            {obituaryAgency?.websiteUrl && (
              <a
                href={obituaryAgency.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
                style={{ color: brandPrimary }}
              >
                <Globe className="w-3 h-3" />
                Sitio web
              </a>
            )}
          </div>
        </div>

        {/* Retention info & Admin quick edit */}
        <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C7B6B]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: brandSecondary }} />
              Vigencia:{' '}
              {isPerpetual ? 'Permanente (Sin caducidad)' : `${obituary.retentionDays || 30} días`}
            </span>
            {!isPerpetual && (
              <span className={daysRemaining <= 5 ? 'text-amber-700 font-medium' : ''}>
                • {daysRemaining > 0 ? `Quedan ${daysRemaining} días` : 'Periodo concluido'}
              </span>
            )}
          </div>

          {onEditObituary && (
            <button
              type="button"
              onClick={() => onEditObituary(obituary)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF4EA] hover:bg-[#F2E8D3] border border-[#DFCFA8] text-[#7A622A] font-semibold rounded-lg transition-colors cursor-pointer"
              title="Editar los datos de esta esquela como administrador"
            >
              <Pencil className="w-3 h-3" style={{ color: brandPrimary }} />
              <span>Editar esquela (Admin)</span>
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
