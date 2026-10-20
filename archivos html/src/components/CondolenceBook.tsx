import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, Calendar, User, Eye, Lock, Feather } from 'lucide-react';
import { CondolenceMessage, Obituary, TributeSymbol } from '../types';
import { FloralDivider } from './FloralMotif';

interface CondolenceBookProps {
  obituary: Obituary;
  messages: CondolenceMessage[];
  onOpenCondolenceModal: () => void;
}

const SYMBOL_LABELS: Record<TributeSymbol, { icon: string; label: string }> = {
  candle: { icon: '🕯️', label: 'Luz perpetua' },
  flower: { icon: '🌹', label: 'Ofrenda floral' },
  prayer: { icon: '🙏', label: 'Oración' },
  dove: { icon: '🕊️', label: 'Paz eterna' },
  cross: { icon: '✝️', label: 'Cruz de consuelo' },
};

export function CondolenceBook({
  obituary,
  messages,
  onOpenCondolenceModal,
}: CondolenceBookProps) {
  const [selectedOriginalModal, setSelectedOriginalModal] = useState<CondolenceMessage | null>(null);

  const maxMessages = obituary.maxMessages || 50;
  const currentCount = messages.length;
  const isFull = currentCount >= maxMessages;
  const progressPercent = Math.min(100, Math.round((currentCount / maxMessages) * 100));

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 text-[#2C2723]">
      {/* Book Header Card */}
      <div className="bg-[#FAF8F5] border border-[#E3D7C1] rounded-2xl shadow-md p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F2EAE0] text-[#8C733E] border border-[#E2D5BE] mb-2">
          <Feather className="w-3.5 h-3.5" /> Libro de Condolencias Abierto
        </div>

        <h2 className="font-memorial-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#2C241D]">
          Mensajes y Testimonios de Afecto
        </h2>
        <p className="text-xs sm:text-sm text-[#736353] mt-2 max-w-md mx-auto leading-relaxed">
          Palabras de consuelo, amor y gratitud dedicadas a la memoria de {obituary.fullName}.
        </p>

        <FloralDivider className="my-4" />

        {/* Quota indicator: Max 50 messages (Requirement 6) */}
        <div className="max-w-md mx-auto bg-white border border-[#E9DEC9] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#5A4B3D] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#8C733E]" />
              Capacidad del Libro Memorial:
            </span>
            <span className={`font-bold ${isFull ? 'text-red-700' : 'text-[#8C733E]'}`}>
              {currentCount} de {maxMessages} mensajes
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#EFE9DD] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFull ? 'bg-red-500' : 'bg-gradient-to-r from-[#D5BC85] to-[#8C733E]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8C7B6B] mt-1.5">
            <span>
              {isFull
                ? 'Límite alcanzado con respeto'
                : `Espacio disponible para ${maxMessages - currentCount} mensajes más`}
            </span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Action Button: Add Condolence */}
        <div className="mt-5">
          {isFull ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3ECE0] border border-[#D5C6AF] rounded-xl text-xs text-[#736455]">
              <Lock className="w-3.5 h-3.5 text-[#8C733E]" />
              El libro ha completado su cuota de 50 mensajes de homenaje.
            </div>
          ) : (
            <button
              onClick={onOpenCondolenceModal}
              className="py-3 px-7 bg-[#8C733E] hover:bg-[#786131] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs inline-flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Heart className="w-4 h-4 fill-white/20" />
              Escribir tus Palabras de Condolencia
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#E5DBC7] rounded-2xl p-8 text-center">
            <span className="text-3xl block mb-2">🕊️</span>
            <h4 className="font-memorial-serif text-xl font-medium text-[#4A3E33]">
              Aún no hay mensajes registrados
            </h4>
            <p className="text-xs sm:text-sm text-[#736353] mt-1 max-w-sm mx-auto">
              Sé la primera persona en brindar unas palabras de amor y apoyo a la familia.
            </p>
            <button
              onClick={onOpenCondolenceModal}
              className="mt-4 py-2 px-4 bg-[#8C733E] hover:bg-[#786131] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Dejar el Primer Mensaje
            </button>
          </div>
        ) : (
          messages.map((msg) => {
            const symbolInfo = SYMBOL_LABELS[msg.symbol] || SYMBOL_LABELS.candle;

            return (
              <article
                key={msg.id}
                className="bg-white border border-[#E9DFCE] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#D5C6AF] transition-all relative overflow-hidden"
              >
                {/* Top card bar: Author, relation, date, symbol */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFE6] pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#F5EDE1] border border-[#E2D5BF] flex items-center justify-center text-sm shadow-2xs">
                      {symbolInfo.icon}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-[#2C241D]">
                        {msg.authorName}
                      </h4>
                      <span className="text-[11px] text-[#8C733E] font-medium block">
                        {msg.relationship}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[11px] text-[#918170] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B8A38D]" />
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Message body */}
                <p className="text-xs sm:text-sm text-[#3E332A] leading-relaxed whitespace-pre-wrap font-normal">
                  «{msg.content}»
                </p>

                {/* Card footer: AI Enriched Indicator & symbol tag */}
                <div className="mt-4 pt-3 border-t border-[#F7F2EA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#78695A] bg-[#FAF6EE] border border-[#E7DCB9] px-2.5 py-0.5 rounded-full">
                      <span>{symbolInfo.icon}</span>
                      <span>{symbolInfo.label}</span>
                    </span>

                    {msg.isAiEnriched && (
                      <button
                        onClick={() => setSelectedOriginalModal(msg)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#7A622A] bg-[#FAF2DE] hover:bg-[#F5E8C8] border border-[#DEC795] px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        title="Ver comparativa de revisión con el texto original"
                      >
                        <Sparkles className="w-3 h-3 text-[#B0892D]" />
                        <span>Enriquecido con IA</span>
                        <Eye className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal to view original vs enriched message on click */}
      {selectedOriginalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E2D5BE] rounded-2xl shadow-xl p-6 max-w-md w-full text-[#2C2723]">
            <h4 className="font-memorial-serif text-xl font-bold text-[#2A231C] mb-1">
              Transparencia del Mensaje
            </h4>
            <p className="text-xs text-[#736353] mb-4">
              Condolencia enviada por <span className="font-semibold">{selectedOriginalModal.authorName}</span>
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-white border border-[#E5DAC8] rounded-xl">
                <span className="text-[11px] font-semibold text-[#8C7B6B] uppercase tracking-wider block mb-1">
                  Texto Original Escrito:
                </span>
                <p className="text-xs text-[#524538] italic">
                  "{selectedOriginalModal.originalContent}"
                </p>
              </div>

              <div className="p-3 bg-[#FAF6EE] border border-[#C5A059] rounded-xl">
                <span className="text-[11px] font-semibold text-[#8C733E] uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Texto Publicado (Revisado & Aprobado):
                </span>
                <p className="text-xs text-[#2C241D] font-medium">
                  "{selectedOriginalModal.content}"
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedOriginalModal(null)}
              className="mt-5 w-full py-2 bg-[#8C733E] text-white rounded-xl text-xs font-semibold"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
