import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  FileText,
  Check,
  Quote,
  Info,
} from 'lucide-react';
import {
  EPITAPH_CATALOG,
  BIOGRAPHY_TEMPLATES,
  EPITAPH_CATEGORIES,
  BIOGRAPHY_CATEGORIES,
  EpitaphItem,
  BiographyTemplateItem,
} from '../data/tributeCatalogs';

export interface CatalogSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'epitaph' | 'biography';
  onSelectText: (text: string) => void;
  deceasedName?: string;
  epitaphs?: EpitaphItem[];
  biographies?: BiographyTemplateItem[];
  epitaphCategories?: string[];
  biographyCategories?: string[];
}

export function CatalogSelectorModal({
  isOpen,
  onClose,
  type,
  onSelectText,
  deceasedName,
  epitaphs,
  biographies,
  epitaphCategories,
  biographyCategories,
}: CatalogSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Guarantee fallback to internal tributeCatalogs if props are omitted or empty
  const epitaphList = epitaphs && epitaphs.length > 0 ? epitaphs : EPITAPH_CATALOG;
  const biographyList = biographies && biographies.length > 0 ? biographies : BIOGRAPHY_TEMPLATES;
  const epitaphCatList = epitaphCategories && epitaphCategories.length > 0 ? epitaphCategories : EPITAPH_CATEGORIES;
  const biographyCatList = biographyCategories && biographyCategories.length > 0 ? biographyCategories : BIOGRAPHY_CATEGORIES;

  // Whenever modal opens or type changes, always reset category and search filter cleanly
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('all');
      setSearchQuery('');
      setCopiedId(null);
    }
  }, [isOpen, type]);

  // Close on Escape key
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

  const isEpitaph = type === 'epitaph';

  // Filter items based on active category and search keyword
  const filteredEpitaphs = useMemo(() => {
    if (!isEpitaph) return [];
    return epitaphList.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        item.text.toLowerCase().includes(q) ||
        (item.origin && item.origin.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [isEpitaph, epitaphList, selectedCategory, searchQuery]);

  const filteredBiographies = useMemo(() => {
    if (isEpitaph) return [];
    return biographyList.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.template.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [isEpitaph, biographyList, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (text: string, id: string) => {
    let finalText = text;
    // If user already typed a deceased name and it's a template, substitute [Nombre]
    if (!isEpitaph && deceasedName && deceasedName.trim() !== '') {
      finalText = text.replace(/\[Nombre\]/g, deceasedName.trim());
    }

    setCopiedId(id);
    setTimeout(() => {
      onSelectText(finalText);
      onClose();
    }, 150);
  };

  // Helper to visually render bracketed placeholders like [Nombre]
  const renderTemplateWithHighlightedTokens = (templateText: string) => {
    const parts = templateText.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#FAF2DE] text-[#7A622A] border border-[#DEC795] font-semibold text-[11px] not-italic inline-block"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const activeCategories = isEpitaph ? epitaphCatList : biographyCatList;
  const totalCount = isEpitaph ? epitaphList.length : biographyList.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 sm:p-5 overflow-y-auto"
    >
      <div className="bg-[#FAF8F5] border border-[#E2D5BE] rounded-3xl max-w-3xl w-full h-[88vh] max-h-[820px] min-h-[460px] flex flex-col shadow-2xl overflow-hidden text-[#2C2723] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#ECE1D0] bg-white flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FAF2DE] border border-[#DEC795] flex items-center justify-center text-[#8C733E] shrink-0 shadow-xs">
              {isEpitaph ? <Quote className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C733E]">
                  Catálogo Predeterminado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF2DE] text-[#8C733E] font-bold border border-[#DEC795]">
                  {isEpitaph ? `${totalCount} Epitafios` : `${totalCount} Plantillas`}
                </span>
              </div>
              <h3 id="catalog-modal-title" className="font-memorial-serif text-xl sm:text-2xl font-bold text-[#2A231C]">
                {isEpitaph ? 'Elegir Epitafio o Frase de Homenaje' : 'Elegir Plantilla de Semblanza / Memoria'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DACFBD] text-[#7A6B5D] hover:text-[#2A231C] transition-colors cursor-pointer"
            aria-label="Cerrar catálogo"
            title="Cerrar ventana (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#F6EFE3] border-b border-[#E8DEC9] text-xs text-[#6F5E4F] flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-[#8C733E] shrink-0" />
          <span>
            {isEpitaph
              ? 'Haz clic en cualquier frase para insertarla en el formulario. Podrás adaptarla y editarla libremente.'
              : 'Selecciona una plantilla con marcadores guía [Nombre] y adáptala a la historia de vida de tu ser querido.'}
          </span>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#ECE1D0] space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B6B]" />
            <input
              type="text"
              placeholder={isEpitaph ? 'Buscar epitafios por palabras clave (ej: amor, paz, luz, bendición, madre)...' : 'Buscar plantillas (ej: madre, padre, abuelos, servicio, fe)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-xs sm:text-sm text-[#2A231C] placeholder-[#A39281] focus:outline-none focus:ring-2 focus:ring-[#8C733E]/30 focus:border-[#8C733E]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8C733E] hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#8C733E] text-white shadow-xs'
                  : 'bg-white text-[#695A4D] hover:bg-[#F2ECE1] border border-[#DACFBD]'
              }`}
            >
              Todos ({totalCount})
            </button>
            {activeCategories.map((cat) => {
              const count = isEpitaph
                ? epitaphList.filter((i) => i.category === cat).length
                : biographyList.filter((i) => i.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#8C733E] text-white shadow-xs'
                      : 'bg-white text-[#695A4D] hover:bg-[#F2ECE1] border border-[#DACFBD]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content List with guaranteed scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0 bg-[#FAF8F5]">
          {isEpitaph ? (
            /* Epitaphs Grid */
            filteredEpitaphs.length === 0 ? (
              <div className="py-12 text-center text-[#7A6B5D] bg-white rounded-2xl border border-[#E2D6C2] p-6">
                <p className="text-sm font-medium">No se encontraron epitafios con esa búsqueda o categoría.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs text-[#8C733E] underline font-semibold cursor-pointer"
                >
                  Mostrar todos los {epitaphList.length} epitafios
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredEpitaphs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.text, item.id)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2D6C2] hover:border-[#8C733E] hover:shadow-sm hover:bg-[#FDFBF7] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF4EA] text-[#8C733E] border border-[#DECFA8]">
                          {item.category}
                        </span>
                        {item.origin && (
                          <span className="text-[10px] text-[#8C7B6B] italic">
                            — {item.origin}
                          </span>
                        )}
                      </div>
                      <p className="font-memorial-serif text-base sm:text-lg text-[#2C2723] leading-snug group-hover:text-[#1F1B18] transition-colors">
                        «{item.text}»
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.text, item.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF4EA] group-hover:bg-[#8C733E] text-[#8C733E] group-hover:text-white border border-[#DECFA8] group-hover:border-[#8C733E] text-xs font-semibold shrink-0 transition-all flex items-center justify-center gap-1.5 self-end sm:self-center cursor-pointer shadow-2xs"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                          <span>¡Insertado!</span>
                        </>
                      ) : (
                        <span>Insertar texto</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Biography Templates Grid */
            filteredBiographies.length === 0 ? (
              <div className="py-12 text-center text-[#7A6B5D] bg-white rounded-2xl border border-[#E2D6C2] p-6">
                <p className="text-sm font-medium">No se encontraron plantillas con esa búsqueda o categoría.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs text-[#8C733E] underline font-semibold cursor-pointer"
                >
                  Mostrar todas las {biographyList.length} plantillas
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredBiographies.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2D6C2] hover:border-[#8C733E] hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EDE2] pb-2.5 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF4EA] text-[#8C733E] border border-[#DECFA8]">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-[#2A231C]">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#7A6B5D] mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelect(item.template, item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#8C733E] hover:bg-[#786131] text-white text-xs font-semibold shrink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Insertada!</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>Usar esta plantilla</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-[#4A3E33] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE4D5] font-serif italic">
                      {renderTemplateWithHighlightedTokens(item.template)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#ECE1D0] flex items-center justify-between text-xs text-[#7A6B5D] shrink-0">
          <span>
            {isEpitaph
              ? `Mostrando ${filteredEpitaphs.length} de ${epitaphList.length} epitafios disponibles`
              : `Mostrando ${filteredBiographies.length} de ${biographyList.length} plantillas disponibles`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DACFBD] rounded-xl font-semibold text-[#4A3D31] cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
