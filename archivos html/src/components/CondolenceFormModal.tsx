import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, AlertCircle, CheckCircle2, HeartHandshake, Flame, ArrowLeft, RefreshCw, Feather } from 'lucide-react';
import { Obituary, TributeSymbol } from '../types';
import { storageService, countWords } from '../services/storage';
import { FloralDivider } from './FloralMotif';

interface CondolenceFormModalProps {
  obituary: Obituary;
  isOpen: boolean;
  onClose: () => void;
  onMessageAdded: () => void;
}

const TRIBUTE_SYMBOLS: { id: TributeSymbol; label: string; icon: string }[] = [
  { id: 'candle', label: 'Vela encendida', icon: '🕯️' },
  { id: 'flower', label: 'Rosa blanca', icon: '🌹' },
  { id: 'prayer', label: 'Oración', icon: '🙏' },
  { id: 'dove', label: 'Paloma de paz', icon: '🕊️' },
];

const RELATIONSHIPS = [
  'Familiar cercano',
  'Hijo / Hija',
  'Hermano / Hermana',
  'Nieto / Nieta',
  'Sobrino / Sobrina',
  'Amigo / Amiga entrañable',
  'Compañero / Colega de trabajo',
  'Vecino / Vecina',
  'Conocido / Allegado',
  'Otro',
];

export function CondolenceFormModal({
  obituary,
  isOpen,
  onClose,
  onMessageAdded,
}: CondolenceFormModalProps) {
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [content, setContent] = useState('');
  const [originalDraft, setOriginalDraft] = useState('');
  const [enrichedDraft, setEnrichedDraft] = useState('');
  const [isAiEnriched, setIsAiEnriched] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<TributeSymbol>('candle');

  // AI loading and approval state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);
  const [isReviewingComparison, setIsReviewingComparison] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  if (!isOpen) return null;

  const wordCount = countWords(content);
  const maxWords = 250;
  const isOverLimit = wordCount > maxWords;
  const isFull = obituary.messageCount >= (obituary.maxMessages || 50);

  // Trigger Gemini AI enrichment
  const handleEnrichWithAI = async () => {
    if (!content.trim()) {
      setEnrichmentError('Por favor escribe primero tu mensaje para poder enriquecerlo.');
      return;
    }

    setIsEnriching(true);
    setEnrichmentError(null);

    try {
      const response = await fetch('/api/enrich-condolence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          deceasedName: obituary.fullName,
          relationship: relationship,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo conectar con el servicio de IA.');
      }

      setOriginalDraft(content.trim());
      setEnrichedDraft(data.enrichedText);
      setIsReviewingComparison(true);
    } catch (err: any) {
      console.error('Error enriqueciendo mensaje:', err);
      setEnrichmentError(
        err.message || 'No se pudo completar la mejora con IA. Puedes publicar tu mensaje original con total tranquilidad.'
      );
    } finally {
      setIsEnriching(false);
    }
  };

  // User decision after reviewing AI enrichment
  const handleApproveEnriched = () => {
    setContent(enrichedDraft);
    setIsAiEnriched(true);
    setIsReviewingComparison(false);
  };

  const handleKeepOriginal = () => {
    setContent(originalDraft);
    setIsAiEnriched(false);
    setIsReviewingComparison(false);
  };

  const handleEditEnriched = () => {
    setContent(enrichedDraft);
    setIsAiEnriched(true);
    setIsReviewingComparison(false);
  };

  // Submit final message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setSubmitError('Por favor completa tu nombre y el mensaje.');
      return;
    }

    if (isOverLimit) {
      setSubmitError(`Tu mensaje supera el límite permitido (${wordCount} de 250 palabras).`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await storageService.addMessage({
      obituaryId: obituary.id,
      authorName: authorName.trim(),
      relationship,
      originalContent: originalDraft || content.trim(),
      content: content.trim(),
      isAiEnriched,
      symbol: selectedSymbol,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      onMessageAdded();
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        // Reset form
        setContent('');
        setAuthorName('');
        setOriginalDraft('');
        setEnrichedDraft('');
        setIsAiEnriched(false);
      }, 1600);
    } else {
      setSubmitError(result.error || 'Error al guardar la condolencia.');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E2D5BE] rounded-2xl shadow-2xl p-5 sm:p-7 text-[#2C2723] my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#F2EAE0] hover:bg-[#E8DCC9] border border-[#DFCFA8] text-[#4A3D31] hover:text-black transition-colors z-20 cursor-pointer"
          aria-label="Cerrar formulario"
          title="Cerrar ventana (Escape)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F2EAE0] text-[#8C733E] border border-[#E2D5BE]">
            <HeartHandshake className="w-3.5 h-3.5" /> Libro de Condolencias
          </div>
          <h3 className="font-memorial-serif text-2xl sm:text-3xl font-semibold mt-2 text-[#2C2723]">
            Dejar Palabras de Consuelo
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1">
            En memoria de <span className="font-medium text-[#4D3F33]">{obituary.fullName}</span>
          </p>
        </div>

        <FloralDivider className="my-3" />

        {/* Check if quota reached */}
        {isFull ? (
          <div className="text-center py-8 px-4 bg-[#F5EFE6] rounded-xl border border-[#DFD3C0]">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EADBC8] flex items-center justify-center text-[#8C733E] mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-memorial-serif text-xl font-bold text-[#3B322A]">
              Libro Memorial Completo
            </h4>
            <p className="text-sm text-[#6E5E50] mt-2 max-w-xs mx-auto">
              Esta esquela digital ha alcanzado el límite máximo de 50 mensajes de condolencias configurados por la familia.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2 bg-[#8C733E] text-white rounded-xl text-xs font-semibold"
            >
              Cerrar y Ver Mensajes
            </button>
          </div>
        ) : submitSuccess ? (
          <div className="text-center py-10 px-4 bg-[#F6F8F3] rounded-xl border border-[#CDE0C4]">
            <CheckCircle2 className="w-12 h-12 text-[#467B38] mx-auto mb-3 animate-bounce" />
            <h4 className="font-memorial-serif text-2xl font-bold text-[#2A4723]">
              Mensaje Registrado
            </h4>
            <p className="text-sm text-[#4E6746] mt-2">
              Tus palabras de amor y consuelo han sido añadidas con respeto al libro memorial.
            </p>
          </div>
        ) : isReviewingComparison ? (
          /* STEP: REVIEW & APPROVE AI ENRICHMENT (Requirement 5) */
          <div className="space-y-4">
            <div className="p-3 bg-[#F4EDE0] border border-[#DECDB3] rounded-xl text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C733E]">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Revisión del Mensaje Enriquecido
              </span>
              <p className="text-xs text-[#6E5E50] mt-1">
                Compara ambos textos. La IA preservó tu intención original mientras mejoró la redacción y calidez.
              </p>
            </div>

            <div className="space-y-3">
              {/* Original Card */}
              <div className="p-3.5 bg-white border border-[#E5DAC8] rounded-xl shadow-2xs">
                <span className="text-[11px] font-semibold text-[#8C7B6B] uppercase tracking-wider block mb-1">
                  Tu Mensaje Original:
                </span>
                <p className="text-sm text-[#4A3F35] italic leading-relaxed whitespace-pre-wrap">
                  "{originalDraft}"
                </p>
                <div className="mt-2 text-right">
                  <span className="text-[11px] text-[#8C7B6B]">
                    {countWords(originalDraft)} palabras
                  </span>
                </div>
              </div>

              {/* Enriched Card */}
              <div className="p-3.5 bg-[#FAF6EE] border-2 border-[#C5A059] rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#8C733E] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Versión Enriquecida con IA:
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EADBC8] text-[#695427] font-medium">
                    Mejorada
                  </span>
                </div>
                <p className="text-sm text-[#2C241D] leading-relaxed whitespace-pre-wrap font-medium">
                  "{enrichedDraft}"
                </p>
                <div className="mt-2 text-right">
                  <span className="text-[11px] text-[#8C733E]">
                    {countWords(enrichedDraft)} palabras (máx. 250)
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleApproveEnriched}
                className="w-full py-2.5 px-4 bg-[#8C733E] hover:bg-[#786131] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar y Usar Versión Enriquecida
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleKeepOriginal}
                  className="py-2 px-3 bg-white hover:bg-[#F2ECE1] border border-[#D9CDB8] text-[#524538] rounded-xl text-xs font-medium transition-colors"
                >
                  Conservar mi Original
                </button>
                <button
                  type="button"
                  onClick={handleEditEnriched}
                  className="py-2 px-3 bg-white hover:bg-[#F2ECE1] border border-[#D9CDB8] text-[#524538] rounded-xl text-xs font-medium transition-colors"
                >
                  Editar Texto Mejorado
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR FORM (Step 1) */
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {enrichmentError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{enrichmentError}</span>
              </div>
            )}

            {/* Author Name */}
            <div>
              <label className="block text-xs font-semibold text-[#57493D] uppercase tracking-wider mb-1">
                Tu Nombre Completo o de tu Familia <span className="text-[#8C733E]">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ej. Familia Gómez Solís, o María Elena Rivera"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBD] rounded-xl text-sm text-[#2C2723] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-all"
              />
            </div>

            {/* Relationship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#57493D] uppercase tracking-wider mb-1">
                  Parentesco o Relación
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DACFBD] rounded-xl text-xs sm:text-sm text-[#2C2723] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]"
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symbolic Tribute */}
              <div>
                <label className="block text-xs font-semibold text-[#57493D] uppercase tracking-wider mb-1">
                  Símbolo de Acompañamiento
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TRIBUTE_SYMBOLS.map((sym) => (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => setSelectedSymbol(sym.id)}
                      title={sym.label}
                      className={`h-10 flex flex-col items-center justify-center rounded-xl border text-base transition-all ${
                        selectedSymbol === sym.id
                          ? 'bg-[#F2EAE0] border-[#8C733E] ring-2 ring-[#8C733E]/20 scale-102'
                          : 'bg-white border-[#E5DAC8] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span>{sym.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Area with Word Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#57493D] uppercase tracking-wider">
                  Tu Mensaje de Condolencias <span className="text-[#8C733E]">*</span>
                </label>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isOverLimit
                      ? 'bg-red-100 text-red-700 font-bold'
                      : wordCount > 200
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#F2EAE0] text-[#7A6958]'
                  }`}
                >
                  {wordCount} / {maxWords} palabras
                </span>
              </div>

              <textarea
                required
                rows={5}
                placeholder="Escribe tus palabras de cariño, consuelo o un entrañable recuerdo que desees compartir con la familia..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setIsAiEnriched(false);
                }}
                className={`w-full p-3.5 bg-white border rounded-xl text-sm leading-relaxed text-[#2C2723] placeholder-[#A69788] focus:outline-none focus:ring-2 transition-all ${
                  isOverLimit
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[#DACFBD] focus:ring-[#C5A059]/40 focus:border-[#C5A059]'
                }`}
              />

              {isOverLimit && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  El mensaje no puede superar las 250 palabras. Por favor sintetiza el texto.
                </p>
              )}

              {isAiEnriched && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8C733E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Mensaje enriquecido con IA aprobado por ti.</span>
                </div>
              )}
            </div>

            {/* AI Enhancement Button (Requirement 4) */}
            <div className="p-3 bg-[#F7F2E8] border border-[#E5DAC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs font-semibold text-[#4A3E33] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C733E]" />
                  ¿Deseas mejorar la redacción?
                </span>
                <p className="text-[11px] text-[#736353] leading-tight mt-0.5">
                  Revisa ortografía y eleva la sensibilidad sin cambiar tus recuerdos.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnrichWithAI}
                disabled={isEnriching || !content.trim()}
                className="shrink-0 py-2 px-3.5 bg-white hover:bg-[#EFE7D8] border border-[#D5C6AF] text-[#695427] font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
              >
                {isEnriching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Enriqueciendo...
                  </>
                ) : (
                  <>
                    <Feather className="w-3.5 h-3.5 text-[#8C733E]" />
                    Enriquecer mensaje con IA
                  </>
                )}
              </button>
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-transparent hover:bg-[#F2ECE1] text-[#7A6B5D] text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isOverLimit || !content.trim() || !authorName.trim()}
                className="py-2.5 px-6 bg-[#8C733E] hover:bg-[#786131] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  'Publicando...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Publicar Condolencia
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
