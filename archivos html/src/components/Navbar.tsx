import React from 'react';
import { Heart, QrCode, Shield, Feather, Menu, X, Building2 } from 'lucide-react';
import { Obituary } from '../types';
import { useBrand } from '../context/BrandContext';

interface NavbarProps {
  currentObituary: Obituary;
  obituaries: Obituary[];
  onSelectObituary: (ob: Obituary) => void;
  onOpenQRModal: () => void;
  onOpenCondolenceModal: () => void;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
}

export function Navbar({
  currentObituary,
  obituaries,
  onSelectObituary,
  onOpenQRModal,
  onOpenCondolenceModal,
  activeView,
  setActiveView,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { currentAgency, currentUser } = useBrand();

  const brandPrimary = currentAgency?.primaryColor || '#8C733E';
  const brandBg = currentAgency?.backgroundColor || '#FAF8F5';


  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[#E7DCBE]/80 text-[#2C2723] transition-colors duration-300"
      style={{ backgroundColor: `${brandBg}E6` }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {currentAgency?.logoUrl && currentAgency.logoUrl.trim() !== '' ? (
            <div className="flex items-center gap-2.5">
              <img
                src={currentAgency.logoUrl}
                alt={currentAgency.name}
                className="h-10 sm:h-12 max-w-[140px] sm:max-w-[180px] object-contain object-left transition-all"
              />
              <div className="hidden lg:block border-l border-[#DFCFA8] pl-2.5">
                <span className="text-[10px] text-[#8C7B6B] tracking-wider uppercase font-medium block">
                  Esquela Digital
                </span>
                <span className="text-[11px] font-semibold text-[#524538] block truncate max-w-[140px]">
                  {currentAgency.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 transition-colors"
                style={{ backgroundColor: brandPrimary }}
              >
                <Feather className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-memorial-serif text-lg sm:text-xl font-bold tracking-tight text-[#2A231C] block leading-none truncate">
                  {currentAgency?.name || 'Esquela Digital'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#8C7B6B] tracking-wider uppercase font-medium block truncate mt-0.5">
                  {currentAgency?.tagline || 'Libro de Condolencias'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Obituary Switcher if multiple */}
          {obituaries.length > 1 && (
            <select
              value={currentObituary.id}
              onChange={(e) => {
                const found = obituaries.find((o) => o.id === e.target.value);
                if (found) {
                  onSelectObituary(found);
                  setActiveView('public');
                }
              }}
              className="text-xs py-1.5 px-3 bg-white border border-[#DACFBD] rounded-xl text-[#4A3D31] focus:outline-none max-w-[160px] truncate"
              title="Cambiar esquela"
            >
              {obituaries.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fullName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setActiveView('public')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeView === 'public'
                ? 'text-white shadow-xs'
                : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
            }`}
            style={activeView === 'public' ? { backgroundColor: brandPrimary } : {}}
          >
            Ver Esquela
          </button>

          <button
            onClick={() => {
              setActiveView('public');
              onOpenCondolenceModal();
            }}
            className="px-3 py-1.5 bg-white hover:bg-[#F2ECE1] border border-[#DACFBD] text-[#695A4D] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" style={{ color: brandPrimary }} />
            Dejar Mensaje
          </button>

          <button
            onClick={onOpenQRModal}
            className="px-3 py-1.5 bg-white hover:bg-[#F2ECE1] border border-[#DACFBD] text-[#695A4D] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" style={{ color: brandPrimary }} />
            QR
          </button>

          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'public' : 'admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'admin'
                ? 'bg-[#372E27] text-white shadow-xs'
                : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {currentUser
                ? currentUser.role === 'superadmin'
                  ? 'Panel Super Admin'
                  : 'Panel Funeraria'
                : 'Acceso Funerarias'}
            </span>
          </button>
        </nav>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenQRModal}
            className="p-2 bg-white border border-[#DACFBD] rounded-xl text-xs"
            style={{ color: brandPrimary }}
            aria-label="Código QR"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white border border-[#DACFBD] text-[#4A3D31] rounded-xl"
            aria-label="Menú principal"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E7DCBE] px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Agency Badge */}
          <div className="p-2.5 bg-white border border-[#E2D5BE] rounded-xl flex items-center gap-2.5">
            {currentAgency?.logoUrl && currentAgency.logoUrl.trim() !== '' ? (
              <img src={currentAgency.logoUrl} alt={currentAgency.name} className="h-8 max-w-[90px] object-contain" />
            ) : (
              <Building2 className="w-5 h-5" style={{ color: brandPrimary }} />
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#2A231C] block truncate">{currentAgency?.name}</span>
              <span className="text-[10px] text-[#7A6B5D] block truncate">{currentAgency?.tagline}</span>
            </div>
          </div>

          {obituaries.length > 1 && (
            <div className="pb-2">
              <label className="text-[11px] text-[#8C7B6B] uppercase font-semibold block mb-1">
                Cambiar de esquela:
              </label>
              <select
                value={currentObituary.id}
                onChange={(e) => {
                  const found = obituaries.find((o) => o.id === e.target.value);
                  if (found) {
                    onSelectObituary(found);
                    setActiveView('public');
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full text-xs py-2 px-3 bg-white border border-[#DACFBD] rounded-xl text-[#4A3D31]"
              >
                {obituaries.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              setActiveView('public');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 bg-white border border-[#DACFBD] rounded-xl text-xs font-semibold text-left text-[#3D3227] flex items-center justify-between"
          >
            <span>Ver Esquela y Homenaje</span>
            <span>🕊️</span>
          </button>

          <button
            onClick={() => {
              setActiveView('public');
              onOpenCondolenceModal();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 text-white rounded-xl text-xs font-semibold text-left flex items-center justify-between"
            style={{ backgroundColor: brandPrimary }}
          >
            <span>Escribir en el Libro de Condolencias</span>
            <Heart className="w-4 h-4 fill-white/20" />
          </button>

          <button
            onClick={() => {
              onOpenQRModal();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 bg-white border border-[#DACFBD] rounded-xl text-xs font-semibold text-left text-[#3D3227] flex items-center justify-between"
          >
            <span>Ver y Compartir Código QR</span>
            <QrCode className="w-4 h-4" style={{ color: brandPrimary }} />
          </button>

          <button
            onClick={() => {
              setActiveView('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 bg-[#FAF2DE] border border-[#DEC795] rounded-xl text-xs font-semibold text-left text-[#7A6025] flex items-center justify-between"
          >
            <span>
              {currentUser
                ? currentUser.role === 'superadmin'
                  ? 'Panel Super Admin'
                  : `Panel Funeraria (${currentAgency?.name || 'Cliente'})`
                : 'Acceso Funerarias / Admin'}
            </span>
            <Shield className="w-4 h-4 text-[#8C733E]" />
          </button>
        </div>
      )}
    </header>
  );
}
