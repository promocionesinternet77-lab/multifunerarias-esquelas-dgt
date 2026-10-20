import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { FuneralHomeBrand, AuthUser } from '../types';
import { storageService, DEFAULT_AGENCIES } from '../services/storage';
import { getAgencyIdFromCurrentUrl } from '../services/urlUtils';

interface BrandContextType {
  currentAgency: FuneralHomeBrand;
  agencies: FuneralHomeBrand[];
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  selectedAgencyFilter: string; // 'all' or agencyId
  setSelectedAgencyFilter: (id: string) => void;
  setCurrentAgencyById: (id: string) => void;
  refreshAgencies: () => Promise<void>;
  updateAgencyBrand: (agency: FuneralHomeBrand & { loginPassword?: string }) => Promise<FuneralHomeBrand>;
  logout: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [agencies, setAgencies] = useState<FuneralHomeBrand[]>(DEFAULT_AGENCIES);
  const [currentAgency, setCurrentAgency] = useState<FuneralHomeBrand>(DEFAULT_AGENCIES[0]);
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(storageService.getCurrentUser());

  // Check current session on mount
  useEffect(() => {
    storageService.fetchCurrentUser().then((u) => {
      if (u) {
        setCurrentUser(u);
      }
    });
  }, []);

  // Load agencies from storage/server
  const loadAgencies = useCallback(async () => {
    try {
      const list = await storageService.fetchAgencies();
      if (list && list.length > 0) {
        setAgencies([...list]);

        // If an agency user is logged in, their active brand is strictly locked
        const activeUser = storageService.getCurrentUser();
        if (activeUser && activeUser.role === 'agency' && activeUser.agencyId) {
          const matchedAgency = list.find(
            (a) => a.id.toLowerCase() === activeUser.agencyId!.toLowerCase()
          );
          if (matchedAgency) {
            setCurrentAgency(matchedAgency);
            setSelectedAgencyFilter(matchedAgency.id);
            return;
          }
        }

        // Check if current URL contains ?funeraria=SLUG (for public view)
        const urlAgencyId = getAgencyIdFromCurrentUrl();
        if (urlAgencyId) {
          const matched = list.find((a) => a.id.toLowerCase() === urlAgencyId.toLowerCase());
          if (matched) {
            setCurrentAgency(matched);
            return;
          }
        }

        // Keep current or select default
        setCurrentAgency((prev) => {
          const found = list.find((a) => a.id === prev.id);
          if (found) return found;
          const defaultAgency = list.find((a) => a.isDefault) || list[0];
          return defaultAgency;
        });
      }
    } catch (err) {
      console.warn('Error loading agencies:', err);
    }
  }, []);

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  // When currentUser changes (login/logout), adjust agency context
  useEffect(() => {
    if (currentUser && currentUser.role === 'agency' && currentUser.agencyId) {
      setSelectedAgencyFilter(currentUser.agencyId);
      const matched = agencies.find(
        (a) => a.id.toLowerCase() === currentUser.agencyId!.toLowerCase()
      );
      if (matched) {
        setCurrentAgency(matched);
      }
    } else if (currentUser && currentUser.role === 'superadmin') {
      setSelectedAgencyFilter('all');
    }
  }, [currentUser, agencies]);

  // Apply CSS variables dynamically to body based on currentAgency
  useEffect(() => {
    if (!currentAgency) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', currentAgency.primaryColor || '#8C733E');
    root.style.setProperty('--brand-secondary', currentAgency.secondaryColor || '#C5A059');
    root.style.setProperty('--brand-bg', currentAgency.backgroundColor || '#FAF8F5');
    root.style.setProperty('--brand-text', currentAgency.textColor || '#2A231C');
  }, [currentAgency]);

  const setCurrentAgencyById = useCallback((id: string) => {
    if (!id) return;
    setCurrentAgency((prev) => {
      if (prev.id.toLowerCase() === id.toLowerCase()) return prev;
      const found = agencies.find((a) => a.id.toLowerCase() === id.toLowerCase());
      return found || prev;
    });
  }, [agencies]);

  const updateAgencyBrand = async (updated: FuneralHomeBrand & { loginPassword?: string }) => {
    const saved = await storageService.saveAgency(updated);
    await loadAgencies();
    if (currentAgency.id === saved.id) {
      setCurrentAgency(saved);
    }
    return saved;
  };

  const logout = async () => {
    await storageService.logout();
    setCurrentUser(null);
    await loadAgencies();
  };

  return (
    <BrandContext.Provider
      value={{
        currentAgency,
        agencies,
        currentUser,
        setCurrentUser,
        selectedAgencyFilter,
        setSelectedAgencyFilter,
        setCurrentAgencyById,
        refreshAgencies: loadAgencies,
        updateAgencyBrand,
        logout,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
