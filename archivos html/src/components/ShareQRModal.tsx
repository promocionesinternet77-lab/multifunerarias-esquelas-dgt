import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, Share2, MessageCircle, ArrowLeft, Building2, Printer } from 'lucide-react';
import { Obituary } from '../types';
import { FloralDivider, MemorialCross } from './FloralMotif';
import { getObituaryIndividualUrl } from '../services/urlUtils';
import { useBrand } from '../context/BrandContext';

interface ShareQRModalProps {
  obituary: Obituary;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareQRModal({ obituary, isOpen, onClose }: ShareQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrStatus, setQrStatus] = useState<'generando' | 'listo' | 'error'>('generando');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const { currentAgency, agencies } = useBrand();

  const printCardRef = useRef<HTMLDivElement>(null);

  // Agency corresponding to this obituary
  const obituaryAgency = obituary.agencyId
    ? agencies.find((a) => a.id === obituary.agencyId) || currentAgency
    : currentAgency;

  const brandPrimary = obituaryAgency?.primaryColor || '#8C733E';
  const brandSecondary = obituaryAgency?.secondaryColor || '#C5A059';

  // Genera la URL pública real individual con el ID permanente y la marca funeraria
  const shareUrl = getObituaryIndividualUrl(obituary, obituaryAgency?.id);

  // Detect native Web Share API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate QR Code with high resolution
  useEffect(() => {
    if (!isOpen || !shareUrl) return;

    setQrStatus('generando');
    QRCode.toDataURL(shareUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#201A16',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setQrStatus('listo');
      })
      .catch((err) => {
        console.error('Error generando código QR:', err);
        setQrStatus('error');
      });
  }, [isOpen, shareUrl, obituary.slug, obituary.id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-${obituaryAgency?.name ? obituaryAgency.name.replace(/\s+/g, '-') + '-' : ''}${obituary.fullName.replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrintCard = () => {
    window.print();
  };

  const shareText = `En memoria de ${obituary.fullName}. Te invito a leer su esquela digital y acompañar a la familia con tus palabras de condolencia: ${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Esquela: ${obituary.fullName} - ${obituaryAgency?.name || 'Esquela Digital'}`,
          text: `En memoria de ${obituary.fullName}. Te invito a leer su esquela digital y dejar unas palabras de condolencia:`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error al compartir en dispositivo:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-[#FAF8F5] border border-[#E2D5BE] rounded-2xl shadow-2xl p-5 sm:p-6 text-[#2C2723] overflow-y-auto my-auto">
        {/* Close button with 44px touch target */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#F2EAE0] hover:bg-[#E8DCC9] border border-[#DFCFA8] text-[#4A3D31] hover:text-black transition-all shadow-2xs active:scale-95 z-20 cursor-pointer"
          aria-label="Cerrar ventana de código QR"
          title="Cerrar ventana (Escape)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Agency Branding Banner inside Modal */}
        <div className="text-center pt-1 pr-8 pl-8">
          {obituaryAgency?.logoUrl && obituaryAgency.logoUrl.trim() !== '' ? (
            <img
              src={obituaryAgency.logoUrl}
              alt={obituaryAgency.name}
              className="h-9 max-w-[150px] object-contain mx-auto mb-1.5"
            />
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-[#F2EAE0] border border-[#E2D5BE] mb-1.5"
              style={{ color: brandPrimary }}
            >
              <Building2 className="w-3.5 h-3.5" /> {obituaryAgency?.name || 'Esquela Digital'}
            </span>
          )}

          <h3 id="qr-modal-title" className="font-memorial-serif text-2xl sm:text-3xl font-bold text-[#2C2723] leading-tight">
            Código QR Memorial
          </h3>
          <p className="text-xs sm:text-sm text-[#6B5E52] mt-0.5 font-medium line-clamp-1">
            En memoria de {obituary.fullName}
          </p>
        </div>

        <FloralDivider className="my-2.5" />

        {/* Printable Memorial Badge Preview */}
        <div
          ref={printCardRef}
          className="flex flex-col items-center justify-center bg-white border border-[#EAE0D0] rounded-2xl p-4 sm:p-5 shadow-xs mx-auto w-full max-w-[300px] text-center"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#8C7B6B] uppercase tracking-wider mb-2">
            <MemorialCross className="w-3.5 h-3.5" style={{ color: brandPrimary }} />
            <span>Ficha de Condolencias</span>
          </div>

          <h4 className="font-memorial-serif text-base sm:text-lg font-bold text-[#2A231C] truncate max-w-full">
            {obituary.fullName}
          </h4>
          <span className="text-[11px] text-[#7A6B5D] mb-3">
            {obituary.birthDate} • {obituary.deathDate}
          </span>

          {qrStatus === 'generando' && (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-[#8C7B6B]">
              Generando código QR...
            </div>
          )}
          {qrStatus === 'listo' && qrDataUrl && qrDataUrl.trim() !== '' && (
            <div className="flex flex-col items-center p-2 bg-[#FAF8F5] border border-[#E2D5BE] rounded-xl shadow-2xs">
              <img
                src={qrDataUrl}
                alt={`Código QR para la esquela de ${obituary.fullName}`}
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg"
              />
            </div>
          )}
          {qrStatus === 'error' && (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-red-600 text-center p-2">
              No se pudo generar el código QR. Puedes compartir el enlace directo.
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-[#F0E8DB] w-full">
            <span className="text-[10px] sm:text-[11px] text-[#8C7B6B] block font-medium">
              Escanea para leer el homenaje y dejar condolencias
            </span>
            <span className="text-[9px] text-[#A39281] block truncate mt-0.5">
              {obituaryAgency?.name}
            </span>
          </div>
        </div>

        {/* Share actions */}
        <div className="mt-4 space-y-2.5">
          {/* Direct Link box with Copy */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-[#F3ECE0]/80 border border-[#E5DAC6] rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-[#524538] flex-1 px-2 py-1 outline-none select-all truncate font-mono"
              aria-label="Enlace web de la esquela"
            />
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-medium transition-all active:scale-95 shadow-2xs whitespace-nowrap min-h-[38px] cursor-pointer"
              style={{ backgroundColor: brandPrimary }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Action buttons: WhatsApp, Download PNG */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:bg-[#20BE5B] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={handleDownloadQR}
              type="button"
              disabled={!qrDataUrl}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-[#F2ECE1] border border-[#D9CDB8] text-[#524538] rounded-xl text-xs font-medium shadow-2xs transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" style={{ color: brandPrimary }} />
              <span>Descargar QR</span>
            </button>
          </div>

          {/* Native device share */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#F4EDE0] hover:bg-[#EAE0D0] border border-[#DECFA8] text-[#695427] rounded-xl text-xs font-semibold transition-colors min-h-[42px] cursor-pointer"
            >
              <Share2 className="w-4 h-4" style={{ color: brandPrimary }} />
              Compartir con mi celular (aplicaciones)
            </button>
          )}

          <p className="text-[11px] text-center text-[#7F7162] pt-0.5 leading-relaxed">
            Listo para imprimir en recordatorios funerarios, trípticos o esquelas impresas.
          </p>

          {/* Dedicated Cerrar button */}
          <div className="pt-2 border-t border-[#EAE0D0]">
            <button
              onClick={onClose}
              type="button"
              className="w-full py-2.5 px-4 bg-[#EDE5D8] hover:bg-[#E0D5C3] border border-[#D5C6AF] text-[#4A3D31] font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 min-h-[44px] cursor-pointer active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: brandPrimary }} />
              Cerrar y volver a la esquela
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
