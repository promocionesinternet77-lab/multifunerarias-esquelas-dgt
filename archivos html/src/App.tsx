import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ObituaryCard } from './components/ObituaryCard';
import { CondolenceBook } from './components/CondolenceBook';
import { ShareQRModal } from './components/ShareQRModal';
import { CondolenceFormModal } from './components/CondolenceFormModal';
import { AdminPanel } from './components/AdminPanel';
import { storageService } from './services/storage';
import { Obituary, CondolenceMessage } from './types';
import { getObituaryIdFromCurrentUrl, getAgencyIdFromCurrentUrl } from './services/urlUtils';
import { Shield, Home, RefreshCw, Building2 } from 'lucide-react';
import { FloralDivider, MemorialCross } from './components/FloralMotif';
import { BrandProvider, useBrand } from './context/BrandContext';

function MainApp() {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [currentObituary, setCurrentObituary] = useState<Obituary | null>(null);
  const [messages, setMessages] = useState<CondolenceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [requestedId, setRequestedId] = useState<string | null>(null);

  // Modals & Navigation
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCondolenceModalOpen, setIsCondolenceModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('view') === 'admin' ||
        params.get('admin') === 'true' ||
        params.get('panel') === 'true' ||
        params.get('login') === 'true'
      ) {
        return 'admin';
      }
    }
    return 'public';
  });
  const [editingObituaryId, setEditingObituaryId] = useState<string | null>(null);

  const { currentAgency, setCurrentAgencyById, agencies, currentUser } = useBrand();
  const currentObituaryRef = useRef<Obituary | null>(null);
  currentObituaryRef.current = currentObituary;

  // Main data loader that respects the URL individual identifier and agency
  const loadObituaryFromUrlOrList = useCallback(async (forcedId?: string) => {
    setIsLoading(true);
    const targetId = forcedId !== undefined ? forcedId : getObituaryIdFromCurrentUrl();
    const targetAgencyId = getAgencyIdFromCurrentUrl();

    if (targetAgencyId) {
      setCurrentAgencyById(targetAgencyId);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('view') === 'admin' ||
        params.get('admin') === 'true' ||
        params.get('panel') === 'true' ||
        params.get('login') === 'true'
      ) {
        setActiveView('admin');
      }
    }

    try {
      // 1. Si la URL contiene un identificador específico:
      if (targetId) {
        setRequestedId(targetId);
        const specificObituary = await storageService.fetchObituaryById(targetId);

        if (specificObituary) {
          setCurrentObituary(specificObituary);
          setIsNotFound(false);
          if (typeof document !== 'undefined') {
            document.title = `Esquela: ${specificObituary.fullName} - ${specificObituary.agencyName || 'Libro de Condolencias'}`;
          }
          if (specificObituary.agencyId) {
            setCurrentAgencyById(specificObituary.agencyId);
          }
          const msgs = await storageService.fetchMessagesByObituary(specificObituary.id);
          setMessages(msgs);
        } else {
          setCurrentObituary(null);
          setIsNotFound(true);
          setMessages([]);
        }

        // Cargar lista general en segundo plano
        storageService.fetchObituaries().then(setObituaries).catch(() => {});
      } else {
        // 2. Si la URL no contiene identificador (página principal):
        setIsNotFound(false);
        const allObituaries = await storageService.fetchObituaries();
        setObituaries(allObituaries);

        const prev = currentObituaryRef.current;
        let chosen: Obituary | null = null;
        if (prev) {
          chosen = allObituaries.find((o) => o.id === prev.id) || null;
        }
        if (!chosen && allObituaries.length > 0) {
          chosen = allObituaries[0];
        }

        setCurrentObituary(chosen);

        if (chosen) {
          if (chosen.agencyId) {
            setCurrentAgencyById(chosen.agencyId);
          }
          const msgs = await storageService.fetchMessagesByObituary(chosen.id);
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar datos de esquelas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentAgencyById]);

  // Initial load
  useEffect(() => {
    loadObituaryFromUrlOrList();

    // Listen to browser forward/back buttons (popstate)
    const handlePopState = () => {
      loadObituaryFromUrlOrList();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadObituaryFromUrlOrList]);

  // Selección manual de una esquela
  const handleSelectObituary = async (ob: Obituary) => {
    setCurrentObituary(ob);
    setIsNotFound(false);
    setActiveView('public');

    if (ob.agencyId) {
      setCurrentAgencyById(ob.agencyId);
    }

    if (typeof window !== 'undefined') {
      const agencyQuery = ob.agencyId ? `&funeraria=${encodeURIComponent(ob.agencyId)}` : '';
      window.history.pushState(null, '', `/?esquela=${encodeURIComponent(ob.id)}${agencyQuery}`);
      document.title = `Esquela: ${ob.fullName} - ${ob.agencyName || 'Libro de Condolencias'}`;
    }

    const msgs = await storageService.fetchMessagesByObituary(ob.id);
    setMessages(msgs);
  };

  const handleCandleLit = async () => {
    if (!currentObituary) return;
    const count = await storageService.lightCandle(currentObituary.id);
    if (count > 0) {
      setCurrentObituary((prev) => (prev ? { ...prev, candlesLitCount: count } : null));
    }
  };

  const handleMessageAdded = async () => {
    if (!currentObituary) return;
    const msgs = await storageService.fetchMessagesByObituary(currentObituary.id);
    setMessages(msgs);
    const updated = await storageService.fetchObituaryById(currentObituary.id);
    if (updated) {
      setCurrentObituary(updated);
    }
  };

  const handleResetToHome = async () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    await loadObituaryFromUrlOrList('');
  };

  const brandBg = currentAgency?.backgroundColor || '#FAF8F5';
  const brandPrimary = currentAgency?.primaryColor || '#8C733E';

  return (
    <div
      className="min-h-screen text-[#2C2723] flex flex-col selection:bg-[#E2D4B7] selection:text-[#2A231C] transition-colors duration-300"
      style={{ backgroundColor: brandBg }}
    >
      {/* Notice Banner - SaaS Multi-Tenant & White-Label Status */}
      <aside aria-label="Aviso del sistema" className="bg-[#F3ECE0] border-b border-[#E2D5BD] text-[#695744] text-[11px] sm:text-xs py-2 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: brandPrimary }}
            />
            <span>
              {currentUser ? (
                currentUser.role === 'superadmin' ? (
                  <>
                    <strong>Super Admin (Mi Panel):</strong> Control Total SaaS • Todas las Funerarias
                  </>
                ) : (
                  <>
                    <strong>Funeraria Aliada:</strong> {currentUser.agencyName || currentAgency?.name} • Aislamiento Estricto Activo
                  </>
                )
              ) : (
                <>
                  <strong>Marca Blanca Activa:</strong> {currentAgency?.name || 'Grupo Funeral'} • Enlace público y código QR
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="text-[11px] text-[#8C7B6B] hidden sm:inline">
                {currentUser.role === 'superadmin' ? '👑' : '🏛️'} <strong>{currentUser.username}</strong>
              </span>
            )}
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'public' : 'admin')}
              className="hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              style={{ color: brandPrimary }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {activeView === 'admin'
                  ? 'Ver Esquela Pública'
                  : currentUser
                  ? (currentUser.role === 'superadmin' ? 'Panel Super Admin' : 'Panel Funeraria')
                  : 'Acceso Funerarias / Admin'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Navbar */}
      <Navbar
        currentObituary={currentObituary || obituaries[0] || { id: '', fullName: 'Esquela Digital' } as any}
        obituaries={obituaries}
        onSelectObituary={handleSelectObituary}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenCondolenceModal={() => setIsCondolenceModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6E5E50]">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" style={{ color: brandPrimary }} />
            <p className="font-memorial-serif text-2xl font-semibold">
              Cargando Esquela Memorial...
            </p>
            <p className="text-xs text-[#8C7B6B] mt-1">
              Consultando la base de datos de {currentAgency?.name || 'la funeraria'}
            </p>
          </div>
        ) : isNotFound ? (
          /* STATE: OBITUARY NOT FOUND */
          <div className="w-full max-w-lg mx-auto bg-white border border-[#E2D5BE] rounded-2xl shadow-xl p-8 sm:p-10 text-center my-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF4EA] border border-[#DECFA8] flex items-center justify-center mb-4 shadow-2xs">
              <MemorialCross className="w-7 h-7" style={{ color: brandPrimary }} />
            </div>

            <h2 className="font-memorial-serif text-2xl sm:text-3xl font-bold text-[#2A231C]">
              Esquela no encontrada
            </h2>
            <p className="text-xs text-[#8C7B6B] mt-1 font-medium">
              Esta esquela no está disponible o ha concluido su periodo de conservación
            </p>

            <FloralDivider className="my-3" />

            <div className="p-4 bg-[#FAF8F5] border border-[#E8DEC9] rounded-xl text-xs text-[#6B5A4B] space-y-1 mb-6 text-left">
              <p>
                El identificador <strong>"{requestedId}"</strong> no existe en los registros activos.
              </p>
              <p className="text-[11px] text-[#8C7B6B]">
                Comprueba que el enlace copiado o el código QR escaneado sea el correcto.
              </p>
            </div>

            <button
              onClick={handleResetToHome}
              className="w-full sm:w-auto px-6 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
              style={{ backgroundColor: brandPrimary }}
            >
              <Home className="w-4 h-4" />
              <span>Ver esquelas vigentes</span>
            </button>
          </div>
        ) : activeView === 'public' && currentObituary ? (
          /* PUBLIC VIEW: OBITUARY CARD & CONDOLENCE BOOK */
          <div className="space-y-10">
            <ObituaryCard
              obituary={currentObituary}
              onOpenQRModal={() => setIsQRModalOpen(true)}
              onOpenCondolenceModal={() => setIsCondolenceModalOpen(true)}
              onCandleLit={handleCandleLit}
              onEditObituary={(ob) => {
                setEditingObituaryId(ob.id);
                setActiveView('admin');
              }}
            />

            <CondolenceBook
              obituary={currentObituary}
              messages={messages}
              onOpenCondolenceModal={() => setIsCondolenceModalOpen(true)}
            />
          </div>
        ) : (
          /* Private Admin Panel */
          <AdminPanel
            currentObituary={currentObituary || obituaries[0] || { id: '', fullName: 'Esquela Digital' } as any}
            onSelectObituary={handleSelectObituary}
            onRefreshData={async (selectedIdToKeep?: string) => {
              await loadObituaryFromUrlOrList(selectedIdToKeep);
            }}
            initialEditObituaryId={editingObituaryId}
            onClearInitialEdit={() => setEditingObituaryId(null)}
          />
        )}
      </main>

      {/* Elegant White-Label Memorial Footer */}
      <footer className="mt-auto border-t border-[#E8DECE] bg-[#F7F4EE] py-8 px-4 text-center text-[#7A6B5C] text-xs">
        <div className="max-w-md mx-auto space-y-2">
          {currentAgency?.logoUrl && currentAgency.logoUrl.trim() !== '' ? (
            <img src={currentAgency.logoUrl} alt={currentAgency.name} className="h-8 max-w-[120px] object-contain mx-auto mb-1 opacity-80" />
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4" style={{ color: brandPrimary }} />
              <span className="font-memorial-serif font-bold text-sm tracking-wider text-[#4E4136]">
                {currentAgency?.name || 'Esquela Digital'}
              </span>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-[#8C7B6B]">
            {currentAgency?.tagline || 'Un espacio digno, respetuoso y sensible para honrar y atesorar la memoria.'}
          </p>
          {currentAgency?.address && (
            <p className="text-[10px] text-[#A39382]">
              {currentAgency.address} {currentAgency.phone ? `• Tel: ${currentAgency.phone}` : ''}
            </p>
          )}
          <div className="pt-2 text-[10px] text-[#A39382]">
            Plataforma SaaS Multi-Marca • Códigos QR y enlaces individuales permanentes
          </div>
        </div>
      </footer>

      {/* QR Code and Sharing Modal */}
      {currentObituary && (
        <ShareQRModal
          obituary={currentObituary}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* Condolence Form Modal */}
      {currentObituary && (
        <CondolenceFormModal
          obituary={currentObituary}
          isOpen={isCondolenceModalOpen}
          onClose={() => setIsCondolenceModalOpen(false)}
          onMessageAdded={handleMessageAdded}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <MainApp />
    </BrandProvider>
  );
}
