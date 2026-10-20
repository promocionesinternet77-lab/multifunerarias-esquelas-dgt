import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  KeyRound,
  PlusCircle,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Flame,
  Upload,
  AlertCircle,
  X as XIcon,
  QrCode,
  Share2,
  Pencil,
  Building2,
  Palette,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  Users,
  Award,
  Lock,
  UserCheck,
  LogOut,
  Key,
  Crown,
  CheckSquare,
  Square,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Obituary, CondolenceMessage, FuneralHomeBrand, AuthUser } from '../types';
import { storageService, DEFAULT_AGENCIES } from '../services/storage';
import { FIREBASE_ARCHITECTURE } from '../services/firebaseArchitecture';
import { FloralDivider, MemorialCross } from './FloralMotif';
import { processAndOptimizeImage, ProcessedImageResult } from '../services/imageUtils';
import { getObituaryIndividualUrl, resolveClientPublicBaseUrl } from '../services/urlUtils';
import { ShareQRModal } from './ShareQRModal';
import { CatalogSelectorModal } from './CatalogSelectorModal';
import {
  EPITAPH_CATALOG,
  BIOGRAPHY_TEMPLATES,
  EPITAPH_CATEGORIES,
  BIOGRAPHY_CATEGORIES,
} from '../data/tributeCatalogs';
import { useBrand } from '../context/BrandContext';

interface AdminPanelProps {
  onSelectObituary: (obituary: Obituary) => void;
  onRefreshData: (selectedIdToKeep?: string) => Promise<void> | void;
  currentObituary: Obituary;
  initialEditObituaryId?: string | null;
  onClearInitialEdit?: () => void;
}

// Preset color palettes for funeral brands
const BRAND_COLOR_PRESETS = [
  {
    name: 'Oro Solemne Clásico',
    primary: '#8C733E',
    secondary: '#C5A059',
    background: '#FAF8F5',
    text: '#2A231C',
    dot: 'bg-[#8C733E]',
  },
  {
    name: 'Azul Real Nobilis',
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    background: '#F8FAFC',
    text: '#0F172A',
    dot: 'bg-[#1E3A8A]',
  },
  {
    name: 'Verde Esperanza Memorial',
    primary: '#065F46',
    secondary: '#10B981',
    background: '#F6FBF8',
    text: '#064E3B',
    dot: 'bg-[#065F46]',
  },
  {
    name: 'Borgoña Ceremonial',
    primary: '#831843',
    secondary: '#F43F5E',
    background: '#FFF1F2',
    text: '#4C0519',
    dot: 'bg-[#831843]',
  },
  {
    name: 'Grafito Imperial',
    primary: '#374151',
    secondary: '#9CA3AF',
    background: '#F9FAFB',
    text: '#111827',
    dot: 'bg-[#374151]',
  },
  {
    name: 'Bronce Catedral',
    primary: '#78350F',
    secondary: '#D97706',
    background: '#FFFBEB',
    text: '#451A03',
    dot: 'bg-[#78350F]',
  },
];

export function AdminPanel({
  onSelectObituary,
  onRefreshData,
  currentObituary,
  initialEditObituaryId,
  onClearInitialEdit,
}: AdminPanelProps) {
  // Brand & Auth Context
  const {
    currentAgency,
    agencies,
    currentUser,
    setCurrentUser,
    setCurrentAgencyById,
    updateAgencyBrand,
    refreshAgencies,
    logout,
  } = useBrand();

  // Authentication state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  // Role determinations
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAgencyUser = currentUser?.role === 'agency';

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'obituaries' | 'quickPublisher' | 'branding' | 'agencies' | 'edit' | 'messages' | 'expiration' | 'cloudStatus' | 'credentials'
  >('obituaries');

  // Filter for Super Admin (Agency users are strictly locked to their own agency)
  const [agencyFilter, setAgencyFilter] = useState<string>('all');

  // Data
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [messages, setMessages] = useState<CondolenceMessage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Quick publisher state
  const [pubAgencyId, setPubAgencyId] = useState<string>(
    isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : (currentAgency?.id || 'funeraria-san-angel')
  );
  const [pubFullName, setPubFullName] = useState('');
  const [pubBirthDate, setPubBirthDate] = useState('1950-01-01');
  const [pubDeathDate, setPubDeathDate] = useState(new Date().toISOString().split('T')[0]);
  const [pubPhotoUrl, setPubPhotoUrl] = useState('');
  const [pubPhotoSourceMode, setPubPhotoSourceMode] = useState<'upload' | 'url'>('upload');
  const [pubUploadedImage, setPubUploadedImage] = useState<ProcessedImageResult | null>(null);
  const [pubIsProcessingPhoto, setPubIsProcessingPhoto] = useState(false);
  const [pubPhotoError, setPubPhotoError] = useState<string | null>(null);
  const pubFileInputRef = useRef<HTMLInputElement>(null);

  const [pubEpitaph, setPubEpitaph] = useState('');
  const [pubBiography, setPubBiography] = useState('');
  const [pubCeremony, setPubCeremony] = useState('');
  const [pubFamilyQuote, setPubFamilyQuote] = useState('');
  const [pubRetentionDays, setPubRetentionDays] = useState<number>(30);
  const [pubIsSaving, setPubIsSaving] = useState(false);
  const [pubSuccessObituary, setPubSuccessObituary] = useState<Obituary | null>(null);
  const [pubErrorMessage, setPubErrorMessage] = useState<string | null>(null);

  // Branding Customizer state
  const [selectedBrandAgencyId, setSelectedBrandAgencyId] = useState<string>(
    isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : (currentAgency?.id || 'funeraria-san-angel')
  );
  const [brandName, setBrandName] = useState(currentAgency?.name || '');
  const [brandTagline, setBrandTagline] = useState(currentAgency?.tagline || '');
  const [brandLogoUrl, setBrandLogoUrl] = useState(currentAgency?.logoUrl || '');
  const [brandLogoFile, setBrandLogoFile] = useState<ProcessedImageResult | null>(null);
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(currentAgency?.primaryColor || '#8C733E');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(currentAgency?.secondaryColor || '#C5A059');
  const [brandBgColor, setBrandBgColor] = useState(currentAgency?.backgroundColor || '#FAF8F5');
  const [brandPhone, setBrandPhone] = useState(currentAgency?.phone || '');
  const [brandEmail, setBrandEmail] = useState(currentAgency?.email || '');
  const [brandAddress, setBrandAddress] = useState(currentAgency?.address || '');
  const [brandWebsite, setBrandWebsite] = useState(currentAgency?.websiteUrl || '');
  const [brandRetentionDefault, setBrandRetentionDefault] = useState(currentAgency?.defaultRetentionDays || 30);
  const [brandWatermark, setBrandWatermark] = useState(currentAgency?.watermarkSignature || '');
  const [brandIsSaving, setBrandIsSaving] = useState(false);
  const [brandSaveSuccess, setBrandSaveSuccess] = useState(false);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);

  // Super Admin: New Agency creation state
  const [isCreatingAgency, setIsCreatingAgency] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyTagline, setNewAgencyTagline] = useState('');
  const [newAgencyPreset, setNewAgencyPreset] = useState(0);
  const [newAgencyPhone, setNewAgencyPhone] = useState('');
  const [newAgencyEmail, setNewAgencyEmail] = useState('');
  const [newAgencyAddress, setNewAgencyAddress] = useState('');
  const [newAgencyWebsite, setNewAgencyWebsite] = useState('');
  const [newAgencyRetention, setNewAgencyRetention] = useState(30);
  const [newAgencyUsername, setNewAgencyUsername] = useState('');
  const [newAgencyPassword, setNewAgencyPassword] = useState('');

  // Password reset / credentials manager modal (Super Admin or Agency)
  const [credentialTargetAgency, setCredentialTargetAgency] = useState<FuneralHomeBrand | null>(null);
  const [newCredPassword, setNewCredPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Editing state for existing obituary
  const [editingObituary, setEditingObituary] = useState<Obituary | null>(null);
  const [editAgencyId, setEditAgencyId] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('1950-01-01');
  const [editDeathDate, setEditDeathDate] = useState(new Date().toISOString().split('T')[0]);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editPhotoSourceMode, setEditPhotoSourceMode] = useState<'upload' | 'url'>('upload');
  const [editUploadedImage, setEditUploadedImage] = useState<ProcessedImageResult | null>(null);
  const [editIsProcessingPhoto, setEditIsProcessingPhoto] = useState(false);
  const [editPhotoError, setEditPhotoError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editEpitaph, setEditEpitaph] = useState('');
  const [editBiography, setEditBiography] = useState('');
  const [editCeremony, setEditCeremony] = useState('');
  const [editFamilyQuote, setEditFamilyQuote] = useState('');
  const [editRetentionDays, setEditRetentionDays] = useState(30);
  const [editIsSaving, setEditIsSaving] = useState(false);
  const [editSaveSuccess, setEditSaveSuccess] = useState(false);
  const [editSaveError, setEditSaveError] = useState<string | null>(null);

  // Modals & notifications
  const [obituaryToDelete, setObituaryToDelete] = useState<Obituary | null>(null);
  const [isDeletingObituary, setIsDeletingObituary] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<FuneralHomeBrand | null>(null);
  const [copiedObituaryId, setCopiedObituaryId] = useState<string | null>(null);
  const [copiedAgencyAccessId, setCopiedAgencyAccessId] = useState<string | null>(null);
  const [adminQrModalObituary, setAdminQrModalObituary] = useState<Obituary | null>(null);
  const [adminNotification, setAdminNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedModerationObituaryId, setSelectedModerationObituaryId] = useState<string>('all');
  const [purgeConfirmed, setPurgeConfirmed] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  // Catalog Selector Modal State
  const [catalogModalState, setCatalogModalState] = useState<{
    isOpen: boolean;
    type: 'epitaph' | 'biography';
    target: 'pub' | 'edit';
  }>({
    isOpen: false,
    type: 'epitaph',
    target: 'pub',
  });

  const handleCatalogTextSelect = (text: string) => {
    if (catalogModalState.target === 'pub') {
      if (catalogModalState.type === 'epitaph') {
        setPubEpitaph(text);
      } else {
        setPubBiography(text);
      }
    } else {
      if (catalogModalState.type === 'epitaph') {
        setEditEpitaph(text);
      } else {
        setEditBiography(text);
      }
    }
    setAdminNotification({
      type: 'success',
      text: catalogModalState.type === 'epitaph'
        ? 'Epitafio insertado en el formulario. Puedes editarlo libremente.'
        : 'Plantilla de semblanza insertada. Puedes personalizar los datos entre corchetes [ ] libremente.',
    });
    setTimeout(() => setAdminNotification(null), 4500);
  };

  // Load demo accounts for 1-click test login
  useEffect(() => {
    storageService.fetchDemoAccounts().then(setDemoAccounts).catch(() => {});
  }, []);

  // Auto-populate login identifier from URL query parameter ?funeraria= or ?agencia=
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentUser && !loginIdentifier) {
      const params = new URLSearchParams(window.location.search);
      const agencySlug = params.get('funeraria') || params.get('agencia') || params.get('brand');
      if (agencySlug) {
        const found = agencies.find(
          (a) =>
            a.id.toLowerCase() === agencySlug.toLowerCase() ||
            (a.loginUsername && a.loginUsername.toLowerCase() === agencySlug.toLowerCase())
        );
        if (found) {
          setLoginIdentifier(found.loginUsername || found.id);
        }
      }
    }
  }, [agencies, currentUser, loginIdentifier]);

  // Synchronize effective agency filter with user role
  useEffect(() => {
    if (isAgencyUser && currentUser?.agencyId) {
      setAgencyFilter(currentUser.agencyId);
      setSelectedBrandAgencyId(currentUser.agencyId);
      setPubAgencyId(currentUser.agencyId);
    }
  }, [currentUser, isAgencyUser]);

  // Load obituaries, messages, and stats according to strict isolation
  const loadData = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const effectiveFilter = isAgencyUser && currentUser.agencyId ? currentUser.agencyId : agencyFilter;

      const [obs, msgs, st] = await Promise.all([
        storageService.fetchObituaries(effectiveFilter),
        storageService.fetchAllAdminMessages(selectedModerationObituaryId),
        storageService.fetchStats(effectiveFilter),
      ]);

      // Extra client-side guarantee of strict isolation
      let finalObs = obs;
      if (isAgencyUser && currentUser.agencyId) {
        finalObs = obs.filter(
          (o) => (o.agencyId || 'funeraria-san-angel').toLowerCase() === currentUser.agencyId!.toLowerCase()
        );
      }
      setObituaries(finalObs);
      setMessages(msgs);
      setStats(st);
    } catch (err) {
      console.warn('Error al cargar datos en panel de administración:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, agencyFilter, selectedModerationObituaryId]);

  useEffect(() => {
    if (initialEditObituaryId && obituaries.length > 0) {
      const target = obituaries.find((o) => o.id === initialEditObituaryId);
      if (target) {
        handleStartEdit(target);
      }
    }
  }, [initialEditObituaryId, obituaries]);

  // Sync brand editing form when selected brand changes
  useEffect(() => {
    const targetAgencyId = isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : selectedBrandAgencyId;
    const targetAgency = agencies.find((a) => a.id === targetAgencyId) || currentAgency;

    if (targetAgency) {
      setBrandName(targetAgency.name || '');
      setBrandTagline(targetAgency.tagline || '');
      setBrandLogoUrl(targetAgency.logoUrl || '');
      setBrandLogoFile(null);
      setBrandPrimaryColor(targetAgency.primaryColor || '#8C733E');
      setBrandSecondaryColor(targetAgency.secondaryColor || '#C5A059');
      setBrandBgColor(targetAgency.backgroundColor || '#FAF8F5');
      setBrandPhone(targetAgency.phone || '');
      setBrandEmail(targetAgency.email || '');
      setBrandAddress(targetAgency.address || '');
      setBrandWebsite(targetAgency.websiteUrl || '');
      setBrandRetentionDefault(targetAgency.defaultRetentionDays || 30);
      setBrandWatermark(targetAgency.watermarkSignature || '');
      setBrandSaveSuccess(false);
    }
  }, [selectedBrandAgencyId, agencies, currentAgency, isAgencyUser, currentUser]);

  // Handle Login with Email/Username + Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Por favor ingresa tu usuario/correo y contraseña.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    const result = await storageService.login(loginIdentifier, loginPassword);
    setLoginLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setLoginPassword('');
      setLoginError(null);
      setAdminNotification({
        type: 'success',
        text: `¡Bienvenido, ${result.user.name}! Sesión iniciada como ${
          result.user.role === 'superadmin' ? 'Super Administrador' : 'Funeraria Aliada'
        }.`,
      });
      setTimeout(() => setAdminNotification(null), 5000);
    } else {
      setLoginError(result.error || 'Credenciales inválidas.');
    }
  };

  // Quick 1-click test login for review
  const handleQuickDemoLogin = async (acc: any) => {
    setLoginIdentifier(acc.email || acc.username);
    setLoginPassword(acc.password);
    setLoginLoading(true);
    setLoginError(null);

    const result = await storageService.login(acc.email || acc.username, acc.password);
    setLoginLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setLoginError(null);
      setAdminNotification({
        type: 'success',
        text: `¡Sesión iniciada con éxito como ${result.user.name}!`,
      });
      setTimeout(() => setAdminNotification(null), 4000);
    } else {
      setLoginError(result.error || 'Error al iniciar sesión con cuenta demo.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setLoginIdentifier('');
    setLoginPassword('');
    setObituaries([]);
    setMessages([]);
    setStats(null);
    setActiveTab('obituaries');
  };

  // Branding Handlers
  const handleBrandLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await processAndOptimizeImage(file);
      setBrandLogoFile(result);
      setBrandLogoUrl(result.dataUrl);
    } catch (err: any) {
      alert(err.message || 'Error al procesar el archivo del logotipo.');
    }
  };

  const handleApplyPreset = (preset: typeof BRAND_COLOR_PRESETS[0]) => {
    setBrandPrimaryColor(preset.primary);
    setBrandSecondaryColor(preset.secondary);
    setBrandBgColor(preset.background);
  };

  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandIsSaving(true);
    try {
      const finalLogo = brandLogoFile ? brandLogoFile.dataUrl : brandLogoUrl;
      const targetAgencyId = isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : selectedBrandAgencyId;
      const targetAgency = agencies.find((a) => a.id === targetAgencyId) || currentAgency;

      const updated: FuneralHomeBrand = {
        ...targetAgency,
        name: brandName.trim(),
        tagline: brandTagline.trim(),
        logoUrl: finalLogo,
        primaryColor: brandPrimaryColor,
        secondaryColor: brandSecondaryColor,
        backgroundColor: brandBgColor,
        phone: brandPhone.trim(),
        email: brandEmail.trim(),
        address: brandAddress.trim(),
        websiteUrl: brandWebsite.trim(),
        defaultRetentionDays: Number(brandRetentionDefault) || 30,
        watermarkSignature: brandWatermark.trim(),
      };

      await updateAgencyBrand(updated);
      setBrandSaveSuccess(true);
      setAdminNotification({
        type: 'success',
        text: `Identidad de marca y logotipo para "${updated.name}" actualizados exitosamente.`,
      });
      setTimeout(() => setBrandSaveSuccess(false), 4000);
      setTimeout(() => setAdminNotification(null), 5000);
      await loadData();
    } catch (err: any) {
      setAdminNotification({
        type: 'error',
        text: err?.message || 'Error al guardar los ajustes de marca.',
      });
    } finally {
      setBrandIsSaving(false);
    }
  };

  // Super Admin: Create New Agency
  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;

    try {
      const preset = BRAND_COLOR_PRESETS[newAgencyPreset] || BRAND_COLOR_PRESETS[0];
      const normalized = newAgencyName.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const rawSlug = normalized
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let slug = rawSlug || `funeraria-${Date.now().toString(36)}`;
      if (agencies.some((a) => a.id.toLowerCase() === slug.toLowerCase())) {
        slug = `${slug}-${Date.now().toString(36).substring(0, 5)}`;
      }

      const defaultUsername = (newAgencyUsername || slug).trim().toLowerCase();
      const defaultEmail = (newAgencyEmail || `${slug}@esquelas.pro`).trim().toLowerCase();
      const defaultPassword = newAgencyPassword.trim() || `${newAgencyName.trim().split(' ')[0]}2026!`;

      const newAgency: FuneralHomeBrand & { loginPassword?: string } = {
        id: slug,
        name: newAgencyName.trim(),
        tagline: newAgencyTagline.trim() || 'Servicios y homenajes solemnes',
        logoUrl: '',
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        backgroundColor: preset.background,
        textColor: preset.text,
        phone: newAgencyPhone.trim(),
        email: newAgencyEmail.trim(),
        address: newAgencyAddress.trim(),
        websiteUrl: newAgencyWebsite.trim(),
        defaultRetentionDays: Number(newAgencyRetention) || 30,
        watermarkSignature: `Homenaje provisto por ${newAgencyName.trim()}`,
        isDefault: false,
        loginUsername: defaultUsername,
        loginEmail: defaultEmail,
        loginPassword: defaultPassword,
        createdAt: new Date().toISOString(),
      };

      const saved = await storageService.saveAgency(newAgency);
      await refreshAgencies();
      await loadData();
      storageService.fetchDemoAccounts().then(setDemoAccounts).catch(() => {});

      setSelectedBrandAgencyId(saved.id);
      setIsCreatingAgency(false);
      setNewAgencyName('');
      setNewAgencyTagline('');
      setNewAgencyUsername('');
      setNewAgencyPassword('');
      setNewAgencyPhone('');
      setNewAgencyEmail('');
      setNewAgencyAddress('');
      setNewAgencyWebsite('');
      setNewAgencyRetention(30);

      setAdminNotification({
        type: 'success',
        text: `¡Funeraria "${saved.name}" creada y registrada con su cuenta de acceso independiente!`,
      });
      setTimeout(() => setAdminNotification(null), 5000);
    } catch (err: any) {
      console.error('Error al registrar la funeraria:', err);
      setAdminNotification({
        type: 'error',
        text: `Error al registrar la funeraria: ${err?.message || 'Error de procesamiento'}`,
      });
      setTimeout(() => setAdminNotification(null), 5000);
    }
  };

  const handleDeleteAgencyConfirm = async () => {
    if (!agencyToDelete) return;
    try {
      const success = await storageService.deleteAgency(agencyToDelete.id);
      if (success) {
        setAdminNotification({
          type: 'success',
          text: `Funeraria "${agencyToDelete.name}" eliminada y sus accesos revocados.`,
        });
        setTimeout(() => setAdminNotification(null), 5000);
        await refreshAgencies();
        setAgencyToDelete(null);
        await loadData();
      }
    } catch (err: any) {
      setAdminNotification({
        type: 'error',
        text: err?.message || 'Error al eliminar funeraria.',
      });
      setTimeout(() => setAdminNotification(null), 5000);
    }
  };

  // Super Admin or Agency: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialTargetAgency || !newCredPassword.trim()) return;
    setIsUpdatingCreds(true);
    try {
      await storageService.updateAgencyCredentials(credentialTargetAgency.id, newCredPassword.trim());
      storageService.fetchDemoAccounts().then(setDemoAccounts).catch(() => {});
      setAdminNotification({
        type: 'success',
        text: `Contraseña de acceso para "${credentialTargetAgency.name}" actualizada con éxito.`,
      });
      setTimeout(() => setAdminNotification(null), 5000);
      setCredentialTargetAgency(null);
      setNewCredPassword('');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar contraseña.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Share agency access credentials formatted for WhatsApp
  const handleShareAgencyAccess = async (agency: FuneralHomeBrand) => {
    const baseUrl = resolveClientPublicBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
    const adminLoginUrl = `${baseUrl}/?view=admin&funeraria=${encodeURIComponent(agency.id)}`;

    // Resolve credentials from loaded demo accounts or stored properties
    const matchingAccount = demoAccounts.find(
      (acc) =>
        (acc.agencyId && acc.agencyId.toLowerCase() === agency.id.toLowerCase()) ||
        (acc.username && agency.loginUsername && acc.username.toLowerCase() === agency.loginUsername.toLowerCase()) ||
        (acc.email && agency.loginEmail && acc.email.toLowerCase() === agency.loginEmail.toLowerCase())
    );

    const username = agency.loginUsername || matchingAccount?.username || agency.id;
    const email = agency.loginEmail || matchingAccount?.email || `${agency.id}@esquelas.pro`;
    const password = matchingAccount?.password || (agency as any).loginPassword || `${username}2026!`;

    const message = `Estimado equipo de *${agency.name}*:

Les compartimos su enlace directo y credenciales de acceso para administrar sus esquelas digitales y libros de condolencias:

🌐 *Enlace de Inicio de Sesión:*
${adminLoginUrl}

👤 *Usuario:* ${username}
📧 *Correo registrado:* ${email}
🔑 *Contraseña temporal:* ${password}

Desde su panel podrán publicar nuevas esquelas con código QR, moderar los mensajes de condolencia de los deudos y personalizar los colores y logotipo de su funeraria.

Atentamente,
*Administración de Esquelas Digitales*`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('Error al copiar portapapeles:', err);
      }
    }

    setCopiedAgencyAccessId(agency.id);
    setTimeout(() => setCopiedAgencyAccessId(null), 3000);

    setAdminNotification({
      type: 'success',
      text: 'Enlace y credenciales copiados',
    });
    setTimeout(() => setAdminNotification(null), 4000);
  };

  // Quick Publisher
  const handlePhotoFileChangePub = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPubIsProcessingPhoto(true);
    setPubPhotoError(null);

    try {
      const result = await processAndOptimizeImage(file);
      setPubUploadedImage(result);
      setPubPhotoSourceMode('upload');
      setPubPhotoUrl('');
    } catch (err: any) {
      setPubPhotoError(err.message || 'Error al cargar la fotografía.');
    } finally {
      setPubIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleQuickPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubFullName.trim() || !pubEpitaph.trim()) return;

    setPubIsSaving(true);
    setPubErrorMessage(null);
    setPubSuccessObituary(null);

    const uniqueId = `esq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const retention = pubRetentionDays;
    const expiresAt = new Date(now.getTime() + retention * 24 * 60 * 60 * 1000).toISOString();

    // Strict multi-tenant isolation: agency is locked
    const targetAgencyId = isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : pubAgencyId;
    const selectedAgency = agencies.find((a) => a.id === targetAgencyId) || currentAgency;

    const photoToUse = pubUploadedImage
      ? pubUploadedImage.dataUrl
      : pubPhotoUrl.trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80';

    const newOb: Obituary = {
      id: uniqueId,
      slug: uniqueId,
      agencyId: selectedAgency.id,
      agencyName: selectedAgency.name,
      fullName: pubFullName.trim(),
      birthDate: pubBirthDate,
      deathDate: pubDeathDate,
      photoUrl: photoToUse,
      epitaph: pubEpitaph.trim(),
      biography: pubBiography.trim() || undefined,
      ceremonyDetails: pubCeremony.trim() || undefined,
      familyQuote: pubFamilyQuote.trim() || undefined,
      createdAt: now.toISOString(),
      expiresAt: expiresAt,
      retentionDays: retention,
      maxMessages: 50,
      messageCount: 0,
      candlesLitCount: 0,
      isActive: true,
    };

    try {
      const savedOb = await storageService.saveObituary(newOb);
      const verifiedOb = await storageService.fetchObituaryById(savedOb.id);

      if (!verifiedOb || verifiedOb.id !== savedOb.id) {
        throw new Error('No se pudo verificar la recuperación de la esquela desde la base de datos.');
      }

      setPubSuccessObituary(verifiedOb);
      setAdminNotification({
        type: 'success',
        text: `¡Esquela de "${verifiedOb.fullName}" publicada bajo "${selectedAgency.name}" con enlace y QR generados!`,
      });
      setTimeout(() => setAdminNotification(null), 5000);

      await loadData();
      onSelectObituary(verifiedOb);
      await onRefreshData(verifiedOb.id);
    } catch (err: any) {
      setPubErrorMessage(err?.message || 'Error al guardar la esquela.');
    } finally {
      setPubIsSaving(false);
    }
  };

  const handleResetPublisher = () => {
    setPubSuccessObituary(null);
    setPubErrorMessage(null);
    setPubFullName('');
    setPubEpitaph('');
    setPubBiography('');
    setPubCeremony('');
    setPubFamilyQuote('');
    setPubPhotoUrl('');
    setPubUploadedImage(null);
    setPubPhotoError(null);
  };

  // Edit Obituary
  const handleStartEdit = (ob: Obituary) => {
    // Isolation safety check
    if (isAgencyUser && currentUser?.agencyId && ob.agencyId?.toLowerCase() !== currentUser.agencyId.toLowerCase()) {
      alert('Acceso denegado: Queda estrictamente prohibido modificar las esquelas de otras funerarias.');
      return;
    }

    setEditingObituary(ob);
    setEditAgencyId(ob.agencyId || currentAgency?.id || 'funeraria-san-angel');
    setEditFullName(ob.fullName || '');
    setEditBirthDate(ob.birthDate || '1950-01-01');
    setEditDeathDate(ob.deathDate || new Date().toISOString().split('T')[0]);
    setEditPhotoUrl(ob.photoUrl && !ob.photoUrl.startsWith('data:') ? ob.photoUrl : '');
    setEditPhotoSourceMode(ob.photoUrl && ob.photoUrl.startsWith('data:') ? 'upload' : 'url');
    setEditUploadedImage(null);
    setEditPhotoError(null);
    setEditEpitaph(ob.epitaph || '');
    setEditBiography(ob.biography || '');
    setEditCeremony(ob.ceremonyDetails || '');
    setEditFamilyQuote(ob.familyQuote || '');
    setEditRetentionDays(ob.retentionDays || 30);
    setEditSaveSuccess(false);
    setEditSaveError(null);
    setActiveTab('edit');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObituary) return;
    if (!editFullName.trim() || !editEpitaph.trim()) return;

    setEditIsSaving(true);
    setEditSaveError(null);
    setEditSaveSuccess(false);

    try {
      let photoToUse = editingObituary.photoUrl;
      if (editPhotoSourceMode === 'upload' && editUploadedImage) {
        photoToUse = editUploadedImage.dataUrl;
      } else if (editPhotoSourceMode === 'url' && editPhotoUrl.trim()) {
        photoToUse = editPhotoUrl.trim();
      }

      // If agency user, strictly preserve their agencyId
      const targetAgencyId = isAgencyUser && currentUser?.agencyId ? currentUser.agencyId : editAgencyId;
      const targetAgency = agencies.find((a) => a.id === targetAgencyId) || currentAgency;
      const baseDate = editingObituary.createdAt ? new Date(editingObituary.createdAt) : new Date();
      const updatedExpiresAt = new Date(baseDate.getTime() + editRetentionDays * 24 * 60 * 60 * 1000).toISOString();

      const updatedOb: Obituary = {
        ...editingObituary,
        agencyId: targetAgency.id,
        agencyName: targetAgency.name,
        fullName: editFullName.trim(),
        birthDate: editBirthDate,
        deathDate: editDeathDate,
        photoUrl: photoToUse,
        epitaph: editEpitaph.trim(),
        biography: editBiography.trim() || undefined,
        ceremonyDetails: editCeremony.trim() || undefined,
        familyQuote: editFamilyQuote.trim() || undefined,
        retentionDays: editRetentionDays,
        expiresAt: updatedExpiresAt,
      };

      const saved = await storageService.saveObituary(updatedOb);
      setEditSaveSuccess(true);
      setAdminNotification({
        type: 'success',
        text: `¡Esquela de "${saved.fullName}" actualizada con éxito en la base de datos!`,
      });
      setTimeout(() => setAdminNotification(null), 5000);

      await loadData();
      if (currentObituary.id === saved.id) {
        onSelectObituary(saved);
      }
      await onRefreshData(saved.id);
    } catch (err: any) {
      setEditSaveError(err?.message || 'Error al guardar los cambios en la base de datos.');
    } finally {
      setEditIsSaving(false);
    }
  };

  const handleConfirmDeleteObituary = async () => {
    if (!obituaryToDelete) return;
    setIsDeletingObituary(true);
    try {
      const idToDelete = obituaryToDelete.id;
      const nameToDelete = obituaryToDelete.fullName;

      await storageService.deleteObituary(idToDelete);

      setAdminNotification({
        type: 'success',
        text: `La esquela de "${nameToDelete}" fue eliminada definitivamente.`,
      });
      setTimeout(() => setAdminNotification(null), 5000);

      if (editingObituary?.id === idToDelete) {
        setEditingObituary(null);
        setActiveTab('obituaries');
      }

      setObituaryToDelete(null);
      await loadData();
      await onRefreshData();
    } catch (err: any) {
      setAdminNotification({
        type: 'error',
        text: err?.message || 'Error al eliminar la esquela de la base de datos.',
      });
    } finally {
      setIsDeletingObituary(false);
    }
  };

  const handleCopyLinkForObituary = async (ob: Obituary) => {
    const url = getObituaryIndividualUrl(ob, ob.agencyId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedObituaryId(ob.id);
      setTimeout(() => setCopiedObituaryId(null), 2500);
    } catch {
      setCopiedObituaryId(ob.id);
      setTimeout(() => setCopiedObituaryId(null), 2500);
    }
  };

  const handleToggleMessage = async (msgId: string, currentApproved: boolean) => {
    await storageService.toggleMessageApproval(msgId, !currentApproved);
    await loadData();
  };

  const handleDeleteMessage = async (id: string) => {
    await storageService.deleteMessage(id);
    setAdminNotification({
      type: 'success',
      text: 'Mensaje de condolencias eliminado de forma segura.',
    });
    setTimeout(() => setAdminNotification(null), 3000);
    await loadData();
    onRefreshData();
  };

  const handleToggleObituaryActive = async (ob: Obituary) => {
    await storageService.toggleObituaryActive(ob.id);
    setAdminNotification({
      type: 'success',
      text: `Estado de "${ob.fullName}" cambiado a ${!ob.isActive ? 'Activa' : 'Archivada'}.`,
    });
    setTimeout(() => setAdminNotification(null), 4000);
    await loadData();
    onRefreshData();
  };

  const handleUpdateObituaryRetention = async (ob: Obituary, days: number) => {
    await storageService.updateObituaryRetention(ob.id, days);
    setAdminNotification({
      type: 'success',
      text: `Vigencia de "${ob.fullName}" actualizada a ${days >= 3650 ? 'Permanente' : `${days} días`}.`,
    });
    setTimeout(() => setAdminNotification(null), 4000);
    await loadData();
    onRefreshData();
  };

  const handleTestPurge = async () => {
    const result = await storageService.purgeExpiredObituaries(purgeConfirmed);
    setPurgeResult(result.message);
    await loadData();
    onRefreshData();
  };

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATION SCREEN (LOGIN POR CORREO/USUARIO Y CONTRASEÑA)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto my-10 p-6 sm:p-8 bg-[#FAF8F5] border border-[#E2D5BE] rounded-3xl shadow-2xl text-[#2C2723]">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F4EDE2] border border-[#DFCFA8] flex items-center justify-center text-[#8C733E] mb-3 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#8C733E]">
            Plataforma SaaS Multi-Tenant
          </span>
          <h2 className="font-memorial-serif text-2xl sm:text-3xl font-bold text-[#2A231C] mt-0.5">
            Iniciar Sesión Administrativa
          </h2>
          <p className="text-xs text-[#7A6B5D] mt-1.5 leading-relaxed max-w-sm mx-auto">
            Ingreso con credenciales seguras para <strong>Super Admin</strong> o cuentas independientes para cada <strong>Funeraria Aliada</strong>.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A3E33] mb-1.5">
              Correo Electrónico o Nombre de Usuario:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ej: admin@esquelas.pro o sanangel"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full text-sm py-2.5 px-3.5 bg-white border border-[#DACFBD] rounded-xl text-[#2A231C] placeholder-[#A89886] focus:outline-none focus:ring-2 focus:ring-[#8C733E]/30 focus:border-[#8C733E]"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#4A3E33]">
                Contraseña:
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#8C733E] hover:underline cursor-pointer"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-sm py-2.5 px-3.5 bg-white border border-[#DACFBD] rounded-xl text-[#2A231C] placeholder-[#A89886] focus:outline-none focus:ring-2 focus:ring-[#8C733E]/30 focus:border-[#8C733E]"
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 bg-[#8C733E] hover:bg-[#786131] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loginLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Switcher */}
        <div className="mt-6 pt-5 border-t border-[#E8DEC9]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-[#6D5D4E] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#8C733E]" /> Acceso Rápido de Prueba (Demo Roles)
            </span>
            <span className="text-[10px] text-[#9E8E7D]">1-clic para probar</span>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc, idx) => {
              const isAccSuper = acc.role === 'superadmin';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isAccSuper
                      ? 'bg-[#FAF3E7] hover:bg-[#F5EAD4] border-[#DEC79C] text-[#5C451F]'
                      : 'bg-white hover:bg-[#F7F2EA] border-[#E0D3BE] text-[#3D3328]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      {isAccSuper ? (
                        <Crown className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-[#8C733E] shrink-0" />
                      )}
                      <span className="text-xs font-bold truncate">{acc.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                          isAccSuper
                            ? 'bg-[#EED9B3] text-[#69480C]'
                            : 'bg-[#EDE5D8] text-[#5E5143]'
                        }`}
                      >
                        {isAccSuper ? 'Super Admin' : 'Funeraria'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7A6B5C] font-mono mt-0.5">
                      user: <strong>{acc.username}</strong> • clave: <strong>{acc.password}</strong>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#8C733E] group-hover:translate-x-0.5 transition-transform shrink-0">
                    Probar →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto my-8 bg-[#FAF8F5] border border-[#E2D5BE] rounded-3xl shadow-xl p-5 sm:p-8 text-[#2C2723]">
      {/* Top Header with Role & Session Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE1D0] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-700" /> Super Admin • Control Total SaaS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Funeraria: {currentUser?.agencyName || currentAgency.name}
              </span>
            )}
            <span className="text-[11px] text-[#7A6B5D]">
              Sesión activa: <strong>{currentUser?.username || currentUser?.email}</strong>
            </span>
          </div>

          <h2 className="font-memorial-serif text-2xl sm:text-3xl font-bold text-[#2A231C] mt-1">
            {isSuperAdmin
              ? 'Panel de Control SaaS y Gestión Global'
              : `Portal de Gestión: ${currentAgency?.name || 'Mi Funeraria'}`}
          </h2>
          <p className="text-xs text-[#7A6B5D] mt-0.5">
            {isSuperAdmin
              ? 'Acceso irrestricto a todas las funerarias aliadas, gestión de marcas y esquelas globales.'
              : 'Gestión exclusiva y aislada de tus esquelas vigentes, condolencias e identidad de marca.'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-[#DACFBD] hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs text-[#7A6B5D] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Cerrar sesión segura"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* SUPER ADMIN TENANT SWITCHER OR AGENCY STATUS BAR */}
      {isSuperAdmin ? (
        <div className="my-4 p-3.5 bg-gradient-to-r from-amber-50 to-[#FAF5EC] border border-amber-200 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-amber-900 uppercase font-bold tracking-wider">
                  Vista Global / Filtro de Funeraria:
                </label>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
                  Modo Super Admin
                </span>
              </div>
              <select
                value={agencyFilter}
                onChange={(e) => {
                  setAgencyFilter(e.target.value);
                  if (e.target.value !== 'all') {
                    setCurrentAgencyById(e.target.value);
                    setSelectedBrandAgencyId(e.target.value);
                    setPubAgencyId(e.target.value);
                  }
                }}
                className="mt-0.5 font-bold text-sm text-[#2A231C] bg-white border border-amber-300 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="all">🌐 Todas las funerarias (Consolidado)</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    🏛️ {agency.name} {agency.isDefault ? '(Principal)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-[#6B5C4F]">
            <span className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg font-medium">
              📋 {obituaries.length} esquelas
            </span>
            <span className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg font-medium">
              🏛️ {agencies.length} agencias aliadas
            </span>
            <button
              onClick={() => {
                setIsCreatingAgency(true);
                setActiveTab('agencies');
              }}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Nueva Funeraria</span>
            </button>
          </div>
        </div>
      ) : (
        /* AGENCY TENANT STATUS BAR (DATA STRICTLY ISOLATED) */
        <div className="my-4 p-3.5 bg-white border border-[#E2D5BE] rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: currentAgency?.primaryColor || '#8C733E' }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8C7B6B] uppercase font-bold tracking-wider">
                  Mi Funeraria:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Aislamiento Estricto Activo
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#2A231C]">
                {currentAgency?.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-[#6B5C4F]">
            <span className="px-2.5 py-1 bg-[#FAF6EE] border border-[#DECDB3] rounded-lg font-medium">
              📋 {obituaries.length} mis esquelas
            </span>
            <span className="px-2.5 py-1 bg-[#FAF6EE] border border-[#DECDB3] rounded-lg font-medium">
              💬 {messages.length} condolencias
            </span>
          </div>
        </div>
      )}

      {/* MAIN ADMIN TABS */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#ECE1D0] pb-2">
        <button
          onClick={() => setActiveTab('obituaries')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'obituaries'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
          }`}
        >
          {isSuperAdmin ? `Esquelas Globales (${obituaries.length})` : `Mis Esquelas (${obituaries.length})`}
        </button>

        <button
          onClick={() => setActiveTab('quickPublisher')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'quickPublisher'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-[#FAF2DE] hover:bg-[#F2E6C8] text-[#7A6025] border border-[#DEC795]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Publicar Esquela</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'branding'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isSuperAdmin ? 'Personalizar Marcas' : 'Mi Marca y Logotipo'}</span>
        </button>

        {/* Multi-Funerarias tab ONLY available for Super Admin */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('agencies')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'agencies'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Gestión de Funerarias ({agencies.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'messages'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
          }`}
        >
          Moderar Mensajes ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('expiration')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'expiration'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
          }`}
        >
          Vigencia
        </button>

        {editingObituary && (
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-[#8C733E] text-white shadow-xs'
                : 'bg-[#FAF4EA] hover:bg-[#F2E8D3] text-[#7A622A] border border-[#DECFA8]'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar: {editingObituary.fullName.substring(0, 15)}...</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('cloudStatus')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'cloudStatus'
              ? 'bg-[#8C733E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F2ECE1] text-[#695A4D] border border-[#DACFBD]'
          }`}
        >
          Diagnóstico y Nube
        </button>
      </div>

      {/* Admin Notification Banner */}
      {adminNotification && (
        <div
          className={`my-3 p-3 rounded-xl border flex items-center justify-between gap-2 text-xs animate-in fade-in ${
            adminNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{adminNotification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAdminNotification(null)}
            className="text-[#7A6B5D] hover:text-[#2C2723] p-1 cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OBITUARIES LIST (TENANT ISOLATED OR GLOBAL FOR SUPER ADMIN) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'obituaries' && (
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#42372E] uppercase tracking-wider">
                {isSuperAdmin ? 'Catálogo General de Esquelas' : `Esquelas de ${currentAgency?.name}`}
              </h3>
              <p className="text-xs text-[#7A6B5D]">
                {isSuperAdmin
                  ? 'Visualización y gestión de todas las esquelas publicadas en el sistema SaaS.'
                  : 'Esquelas administradas exclusivamente por tu funeraria con sus enlaces y códigos QR.'}
              </p>
            </div>

            {/* Filter by Agency (Visible for Super Admin only) */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A6B5D] font-medium">Filtrar por marca:</span>
                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 bg-white border border-[#DACFBD] rounded-xl text-[#4A3D31] focus:outline-none"
                >
                  <option value="all">Todas las funerarias</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isLoadingData ? (
            <div className="p-8 text-center text-[#7A6B5D]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8C733E]" />
              <p className="text-xs">Cargando esquelas...</p>
            </div>
          ) : obituaries.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E2D5BE] rounded-2xl">
              <p className="text-sm text-[#7A6B5D]">No hay esquelas registradas para esta funeraria.</p>
              <button
                onClick={() => setActiveTab('quickPublisher')}
                className="mt-3 px-4 py-2 bg-[#8C733E] text-white text-xs font-semibold rounded-xl"
              >
                + Publicar Primera Esquela
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {obituaries.map((ob) => {
                const now = Date.now();
                const expireDate = new Date(ob.expiresAt).getTime();
                const isPerpetual = (ob.retentionDays || 30) >= 3650;
                const daysLeft = Math.max(0, Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24)));
                const isSelected = currentObituary.id === ob.id;
                const obAgency = agencies.find((a) => a.id === ob.agencyId) || currentAgency;

                return (
                  <div
                    key={ob.id}
                    className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all ${
                      isSelected ? 'border-[#C5A059] ring-2 ring-[#C5A059]/20' : 'border-[#E2D6C2]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {ob.photoUrl && ob.photoUrl.trim() !== '' ? (
                        <img
                          src={ob.photoUrl}
                          alt={ob.fullName}
                          className="w-14 h-18 object-cover rounded-lg border border-[#DACFBD] bg-[#F5EDE1] shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-18 rounded-lg border border-[#DACFBD] bg-[#FAF4EA] flex items-center justify-center text-[#8C733E] shrink-0">
                          <MemorialCross className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-[#2A231C] truncate">
                            {ob.fullName}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2DE] text-[#8C733E] border border-[#DEC795] shrink-0">
                              Activa en pantalla
                            </span>
                          )}
                        </div>

                        {/* Agency badge */}
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: obAgency?.primaryColor || '#8C733E' }}
                          />
                          <span className="text-[11px] font-medium text-[#7A6B5D] truncate">
                            {ob.agencyName || obAgency?.name || 'Funeraria San Ángel'}
                          </span>
                        </div>

                        <p className="text-xs text-[#7A6B5D] mt-0.5">
                          {ob.birthDate} a {ob.deathDate}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8C7B6B]">
                          <span>💬 {ob.messageCount || 0}/50 mensajes</span>
                          <span>•</span>
                          <span>🕯️ {ob.candlesLitCount || 0} velas</span>
                        </div>

                        <div className="mt-2 text-[11px] text-[#78695A] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C5A059]" />
                          <span>
                            {isPerpetual
                              ? 'Vigencia Permanente'
                              : daysLeft > 0
                              ? `Quedan ${daysLeft} días de vigencia`
                              : 'Vigencia concluida'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-[#F4EFE6] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(ob)}
                          className="px-2.5 py-1.5 bg-[#FAF4EA] hover:bg-[#F2E8D3] text-[#7A622A] text-xs font-semibold rounded-lg border border-[#DECFA8] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminQrModalObituary(ob)}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#F7F2EA] text-[#695A4D] text-xs font-semibold rounded-lg border border-[#DACFBD] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver QR público con marca asignada"
                        >
                          <QrCode className="w-3 h-3 text-[#8C733E]" />
                          <span>QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLinkForObituary(ob)}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#F7F2EA] text-[#695A4D] text-xs font-semibold rounded-lg border border-[#DACFBD] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copiar enlace público de la esquela"
                        >
                          {copiedObituaryId === ob.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Enlace</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectObituary(ob);
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#F7F2EA] text-[#695A4D] text-xs font-semibold rounded-lg border border-[#DACFBD] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Visualizar esquela pública"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setObituaryToDelete(ob)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title="Eliminar esquela definitivamente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: QUICK PUBLISHER (LOCKED TO TENANT OR SELECTABLE FOR SUPERADMIN) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'quickPublisher' && (
        <div className="pt-6 space-y-5">
          <div className="border-b border-[#ECE1D0] pb-3">
            <h3 className="text-base font-bold text-[#3D3227] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C733E]" />
              <span>Publicar Nueva Esquela Digital</span>
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              Genera al instante el enlace único y el código QR ceremonial con la marca de la funeraria.
            </p>
          </div>

          {pubSuccessObituary ? (
            <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-sm text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-memorial-serif text-2xl font-bold text-[#2A231C]">
                ¡Esquela Publicada Exitosamente!
              </h4>
              <p className="text-xs text-[#6B5A4B] max-w-md mx-auto">
                La esquela de <strong>{pubSuccessObituary.fullName}</strong> ya está activa bajo la marca de{' '}
                <strong>{pubSuccessObituary.agencyName}</strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setAdminQrModalObituary(pubSuccessObituary)}
                  className="px-4 py-2 bg-[#8C733E] hover:bg-[#786131] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Ver y Descargar Código QR</span>
                </button>
                <button
                  onClick={() => handleCopyLinkForObituary(pubSuccessObituary)}
                  className="px-4 py-2 bg-white hover:bg-[#F7F2EA] border border-[#DACFBD] text-[#4A3D31] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace Directo</span>
                </button>
                <button
                  onClick={handleResetPublisher}
                  className="px-4 py-2 bg-white hover:bg-[#F7F2EA] border border-[#DACFBD] text-[#4A3D31] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Publicar Otra Esquela
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuickPublish} className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2D5BE]">
              {/* Agency Assignment: Selectable for Super Admin, LOCKED for Agency */}
              {isSuperAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-[#4A3E33] mb-1">
                    Funeraria que publica la esquela:
                  </label>
                  <select
                    value={pubAgencyId}
                    onChange={(e) => setPubAgencyId(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#3D3227] font-semibold"
                  >
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF6EE] border border-[#DECDB3] rounded-xl flex items-center gap-2 text-xs text-[#6B5A4B]">
                  <Building2 className="w-4 h-4 text-[#8C733E] shrink-0" />
                  <span>
                    Esta esquela será publicada con la marca y logotipo de <strong>{currentAgency?.name}</strong>.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                    Nombre completo de la persona fallecida: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Don Roberto Garza González"
                    value={pubFullName}
                    onChange={(e) => setPubFullName(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                      Nacimiento:
                    </label>
                    <input
                      type="date"
                      value={pubBirthDate}
                      onChange={(e) => setPubBirthDate(e.target.value)}
                      className="w-full text-xs py-2 px-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                      Fallecimiento:
                    </label>
                    <input
                      type="date"
                      value={pubDeathDate}
                      onChange={(e) => setPubDeathDate(e.target.value)}
                      className="w-full text-xs py-2 px-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Fotografía de homenaje:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={pubFileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileChangePub}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pubFileInputRef.current?.click()}
                    className="px-3 py-2 bg-white hover:bg-[#F2ECE1] border border-[#DACFBD] rounded-xl text-xs font-semibold text-[#4A3D31] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde dispositivo</span>
                  </button>
                  {pubUploadedImage && (
                    <span className="text-xs text-emerald-700 font-medium">
                      ✓ Foto procesada y lista
                    </span>
                  )}
                  {pubIsProcessingPhoto && (
                    <span className="text-xs text-[#8C733E] flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Procesando foto...
                    </span>
                  )}
                </div>
                {pubPhotoError && <p className="text-xs text-red-600 mt-1">{pubPhotoError}</p>}
              </div>

              {/* Epitaph with Catalog Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#4A3E33]">
                    Epitafio o mensaje principal de homenaje: *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCatalogModalState({ isOpen: true, type: 'epitaph', target: 'pub' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#8C733E] bg-[#FAF4EA] hover:bg-[#F2E8D3] border border-[#DECFA8] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Ver catálogo con más de 50 epitafios organizados por categoría"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Elegir del catálogo</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Tu bondad, amor y ejemplo vivirán eternamente en nosotros..."
                  value={pubEpitaph}
                  onChange={(e) => setPubEpitaph(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>

              {/* Semblance & Ceremony */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#4A3E33]">
                      Semblanza o memoria (opcional):
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatalogModalState({ isOpen: true, type: 'biography', target: 'pub' })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#8C733E] bg-[#FAF4EA] hover:bg-[#F2E8D3] border border-[#DECFA8] rounded-lg transition-colors cursor-pointer shadow-2xs"
                      title="Elegir entre 18 plantillas guiadas con marcadores de personalización"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Elegir plantilla</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Dedicó su vida a su familia y su comunidad..."
                    value={pubBiography}
                    onChange={(e) => setPubBiography(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                    Detalles de la ceremonia o velatorio (opcional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Misa en Capilla San José, sábado 18 a las 12:00 hrs."
                    value={pubCeremony}
                    onChange={(e) => setPubCeremony(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  />
                </div>
              </div>

              {/* Retention Policy */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Periodo de vigencia activa:
                </label>
                <select
                  value={pubRetentionDays}
                  onChange={(e) => setPubRetentionDays(Number(e.target.value))}
                  className="w-full sm:w-auto text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                >
                  <option value={15}>15 días</option>
                  <option value={30}>30 días (Estándar)</option>
                  <option value={60}>60 días</option>
                  <option value={365}>1 año</option>
                  <option value={3650}>Homenaje Permanente (Perpetuo)</option>
                </select>
              </div>

              {pubErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {pubErrorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={pubIsSaving}
                className="w-full py-3 bg-[#8C733E] hover:bg-[#786131] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {pubIsSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando en base de datos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publicar Esquela y Generar QR</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: BRANDING & LOGO CUSTOMIZER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'branding' && (
        <div className="pt-6 space-y-5">
          <div className="border-b border-[#ECE1D0] pb-3">
            <h3 className="text-base font-bold text-[#3D3227] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#8C733E]" />
              <span>{isSuperAdmin ? 'Personalización de Marca Blanca' : `Identidad de ${currentAgency?.name}`}</span>
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              Personaliza el logotipo oficial, colores y pie de página que verán las familias al escanear el QR.
            </p>
          </div>

          <form onSubmit={handleSaveBrandSettings} className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2D5BE]">
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-bold text-[#4A3E33] mb-1">
                  Seleccionar funeraria a personalizar:
                </label>
                <select
                  value={selectedBrandAgencyId}
                  onChange={(e) => setSelectedBrandAgencyId(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#3D3227] font-semibold"
                >
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Nombre de la Funeraria o Corporativo:
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Eslogan o Frase Distintiva:
                </label>
                <input
                  type="text"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                Logotipo Oficial:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={brandLogoInputRef}
                  accept="image/*"
                  onChange={handleBrandLogoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => brandLogoInputRef.current?.click()}
                  className="px-3 py-2 bg-white hover:bg-[#F2ECE1] border border-[#DACFBD] rounded-xl text-xs font-semibold text-[#4A3D31] flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir logotipo</span>
                </button>
                {brandLogoUrl && (
                  <img
                    src={brandLogoUrl}
                    alt="Logo preview"
                    className="h-9 max-w-[120px] object-contain border border-[#DECFA8] p-1 rounded-lg bg-white"
                  />
                )}
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3E33] mb-2">
                Paleta de Color Rápida:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {BRAND_COLOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#DACFBD] text-[11px] font-medium flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] cursor-pointer"
                  >
                    <span className={`w-3 h-3 rounded-full ${preset.dot}`} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Hex Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A6B5D] mb-1">
                  Color Primario:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#DACFBD] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7A6B5D] mb-1">
                  Color Secundario:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandSecondaryColor}
                    onChange={(e) => setBrandSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#DACFBD] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandSecondaryColor}
                    onChange={(e) => setBrandSecondaryColor(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7A6B5D] mb-1">
                  Color de Fondo:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandBgColor}
                    onChange={(e) => setBrandBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#DACFBD] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandBgColor}
                    onChange={(e) => setBrandBgColor(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 bg-[#FAF8F5] border border-[#DACFBD] rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Teléfono de Contacto:
                </label>
                <input
                  type="text"
                  value={brandPhone}
                  onChange={(e) => setBrandPhone(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Sitio Web:
                </label>
                <input
                  type="text"
                  value={brandWebsite}
                  onChange={(e) => setBrandWebsite(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                Firma y Marca de Agua ceremonial (Pie de página):
              </label>
              <input
                type="text"
                value={brandWatermark}
                onChange={(e) => setBrandWatermark(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
              />
            </div>

            <button
              type="submit"
              disabled={brandIsSaving}
              className="w-full py-3 bg-[#8C733E] hover:bg-[#786131] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {brandIsSaving ? 'Guardando cambios de marca...' : 'Guardar Identidad de Marca'}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SUPER ADMIN ONLY - MULTI-FUNERARIAS (TENANT MANAGEMENT) */}
      {/* ------------------------------------------------------------- */}
      {isSuperAdmin && activeTab === 'agencies' && (
        <div className="pt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE1D0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#3D3227] flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Gestión de Funerarias Aliadas y Cuentas de Acceso</span>
              </h3>
              <p className="text-xs text-[#7A6B5D] mt-0.5">
                Crea nuevas agencias, gestiona sus credenciales de login y audita el aislamiento de datos.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingAgency(!isCreatingAgency)}
              className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isCreatingAgency ? 'Cancelar' : 'Dar de Alta Funeraria'}</span>
            </button>
          </div>

          {/* Form to register a new Agency with its independent login credentials */}
          {isCreatingAgency && (
            <form onSubmit={handleCreateAgency} className="p-5 bg-white border border-amber-300 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Alta de Nueva Funeraria Aliada (Tenant)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                    Nombre comercial de la Funeraria: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Capillas Señoriales"
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                    Eslogan o lema:
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Homenajes con dignidad"
                    value={newAgencyTagline}
                    onChange={(e) => setNewAgencyTagline(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  />
                </div>
              </div>

              {/* Independent Login Account for this Funeral Home */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" /> Credenciales de Inicio de Sesión para esta Funeraria
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A4B3C] mb-1">
                      Usuario de acceso:
                    </label>
                    <input
                      type="text"
                      placeholder="ej: capillas"
                      value={newAgencyUsername}
                      onChange={(e) => setNewAgencyUsername(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-white border border-[#DACFBD] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A4B3C] mb-1">
                      Correo oficial:
                    </label>
                    <input
                      type="email"
                      placeholder="contacto@funeraria.com"
                      value={newAgencyEmail}
                      onChange={(e) => setNewAgencyEmail(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-white border border-[#DACFBD] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A4B3C] mb-1">
                      Contraseña inicial:
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Senoriales2026!"
                      value={newAgencyPassword}
                      onChange={(e) => setNewAgencyPassword(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-white border border-[#DACFBD] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingAgency(false)}
                  className="px-3 py-1.5 bg-white border border-[#DACFBD] text-xs font-semibold rounded-xl text-[#695A4D]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Crear Funeraria y Cuenta
                </button>
              </div>
            </form>
          )}

          {/* List of Registered Agencies */}
          <div className="space-y-3">
            {agencies.map((agency) => {
              const agencyObituaries = obituaries.filter((o) => (o.agencyId || '').toLowerCase() === agency.id.toLowerCase());

              return (
                <div
                  key={agency.id}
                  className="p-4 bg-white border border-[#E2D5BE] rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: agency.primaryColor || '#8C733E' }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#2A231C]">{agency.name}</h4>
                        {agency.isDefault && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            Predeterminada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7A6B5D]">{agency.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8C7B6B] flex-wrap">
                        <span>ID Tenant: <code className="font-mono bg-[#FAF6EE] px-1 py-0.5 rounded">{agency.id}</code></span>
                        <span>•</span>
                        <span>Usuario: <strong className="text-[#3D3227]">{agency.loginUsername || agency.id}</strong></span>
                        <span>•</span>
                        <span>{agencyObituaries.length} esquelas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleShareAgencyAccess(agency)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        copiedAgencyAccessId === agency.id
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-[#FAF2DE] hover:bg-[#F3E5C3] text-[#7A6025] border-[#DEC795]'
                      }`}
                      title="Copiar credenciales y enlace directo para enviar por WhatsApp"
                    >
                      {copiedAgencyAccessId === agency.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Compartir Acceso</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCredentialTargetAgency(agency);
                        setNewCredPassword('');
                      }}
                      className="px-2.5 py-1.5 bg-[#FAF4EA] hover:bg-[#F2E8D3] text-[#7A622A] text-xs font-semibold rounded-lg border border-[#DECFA8] flex items-center gap-1 cursor-pointer"
                      title="Gestionar contraseña de la funeraria"
                    >
                      <Key className="w-3 h-3" />
                      <span>Cambiar Clave</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrandAgencyId(agency.id);
                        setActiveTab('branding');
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#F7F2EA] text-[#695A4D] text-xs font-semibold rounded-lg border border-[#DACFBD] flex items-center gap-1 cursor-pointer"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Marca</span>
                    </button>

                    {!agency.isDefault && (
                      <button
                        type="button"
                        onClick={() => setAgencyToDelete(agency)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title="Eliminar funeraria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: CONDOLENCE MESSAGES MODERATION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'messages' && (
        <div className="pt-6 space-y-4">
          <div className="border-b border-[#ECE1D0] pb-3">
            <h3 className="text-base font-bold text-[#3D3227]">
              Moderación de Mensajes de Condolencia
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              {isSuperAdmin
                ? 'Monitorea y modera las condolencias recibidas a través de todas las marcas.'
                : `Mensajes recibidos exclusivamente para las esquelas de ${currentAgency?.name}.`}
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E2D5BE] rounded-2xl">
              <p className="text-xs text-[#7A6B5D]">No hay mensajes de condolencia registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border bg-white transition-all ${
                    msg.approved ? 'border-[#E2D5BE]' : 'border-amber-300 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#2A231C]">{msg.authorName}</h4>
                        <span className="text-[10px] text-[#8C7B6B]">({msg.relationship})</span>
                        {msg.isAiEnriched && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#FAF2DE] text-[#8C733E] border border-[#DEC795] rounded-full font-semibold">
                            IA Enriquecido
                          </span>
                        )}
                        {!msg.approved && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-semibold">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4A3E33] mt-1.5 leading-relaxed italic font-serif">
                        «{msg.content}»
                      </p>
                      <span className="text-[10px] text-[#A89886] mt-1 block">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleMessage(msg.id, msg.approved)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                          msg.approved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-[#4A3D31] border-[#DACFBD]'
                        }`}
                      >
                        {msg.approved ? 'Aprobado' : 'Aprobar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: EXPIRATION & PURGE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'expiration' && (
        <div className="pt-6 space-y-4">
          <div className="border-b border-[#ECE1D0] pb-3">
            <h3 className="text-base font-bold text-[#3D3227]">
              Políticas de Vigencia y Depuración Segura
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              Supervisión de esquelas que han concluido su periodo de retención según el plan contratado.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E2D5BE] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3E33]">
              Depurar Esquelas Vencidas
            </h4>
            <p className="text-xs text-[#7A6B5D] leading-relaxed">
              Las esquelas que sobrepasen su fecha límite de retención pueden ser archivadas o depuradas de forma permanente.
            </p>

            <label className="flex items-center gap-2 text-xs text-[#4A3E33] cursor-pointer">
              <input
                type="checkbox"
                checked={purgeConfirmed}
                onChange={(e) => setPurgeConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-[#8C733E]"
              />
              <span>Confirmo que deseo depurar todas las esquelas cuyo periodo de vigencia ya venció.</span>
            </label>

            <button
              type="button"
              onClick={handleTestPurge}
              disabled={!purgeConfirmed}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Ejecutar Depuración
            </button>

            {purgeResult && (
              <p className="text-xs text-emerald-700 font-medium">{purgeResult}</p>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: EDIT OBITUARY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'edit' && editingObituary && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE1D0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#3D3227] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#8C733E]" />
                <span>Editando: {editingObituary.fullName}</span>
              </h3>
              <p className="text-xs text-[#7A6B5D]">
                Modifica los datos del homenaje en la base de datos.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('obituaries')}
              className="text-xs text-[#8C733E] hover:underline cursor-pointer"
            >
              ← Volver al listado
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2D5BE]">
            <div>
              <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                Nombre Completo: *
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#4A3E33]">
                  Epitafio / Mensaje de Homenaje: *
                </label>
                <button
                  type="button"
                  onClick={() => setCatalogModalState({ isOpen: true, type: 'epitaph', target: 'edit' })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#8C733E] bg-[#FAF4EA] hover:bg-[#F2E8D3] border border-[#DECFA8] rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Ver catálogo con más de 50 epitafios organizados por categoría"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Elegir del catálogo</span>
                </button>
              </div>
              <textarea
                required
                rows={3}
                value={editEpitaph}
                onChange={(e) => setEditEpitaph(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#4A3E33]">
                    Semblanza:
                  </label>
                  <button
                    type="button"
                    onClick={() => setCatalogModalState({ isOpen: true, type: 'biography', target: 'edit' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#8C733E] bg-[#FAF4EA] hover:bg-[#F2E8D3] border border-[#DECFA8] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Elegir entre 18 plantillas guiadas con marcadores de personalización"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Elegir plantilla</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editBiography}
                  onChange={(e) => setEditBiography(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Ceremonia:
                </label>
                <textarea
                  rows={2}
                  value={editCeremony}
                  onChange={(e) => setEditCeremony(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DACFBD] rounded-xl text-[#2A231C]"
                />
              </div>
            </div>

            {editSaveError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                {editSaveError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('obituaries')}
                className="px-4 py-2 bg-white border border-[#DACFBD] text-xs font-semibold rounded-xl text-[#695A4D]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editIsSaving}
                className="px-5 py-2 bg-[#8C733E] hover:bg-[#786131] text-white text-xs font-semibold rounded-xl"
              >
                {editIsSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: CLOUD STATUS & DIAGNOSTICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cloudStatus' && (
        <div className="pt-6 space-y-4">
          <div className="border-b border-[#ECE1D0] pb-3">
            <h3 className="text-base font-bold text-[#3D3227]">
              Diagnóstico del Sistema y Arquitectura de Nube
            </h3>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              Estado de sincronización y conectividad de almacenamiento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#E2D5BE] rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3E33] mb-2">
                Almacenamiento Centralizado
              </h4>
              <p className="text-xs text-[#7A6B5D]">
                Los datos están centralizados en el servidor de la plataforma para sincronizarse en tiempo real entre todos los dispositivos que lean el código QR.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Base de datos persistente en línea</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E2D5BE] rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3E33] mb-2">
                Aislamiento Multi-Tenant
              </h4>
              <p className="text-xs text-[#7A6B5D]">
                Cada funeraria tiene sus datos estrictamente separados con autenticación de credenciales independiente.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Separación estricta de tenencia activa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RESET PASSWORD FOR AN AGENCY */}
      {/* ------------------------------------------------------------- */}
      {credentialTargetAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#E2D5BE] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-memorial-serif text-xl font-bold text-[#2A231C] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#8C733E]" />
                <span>Actualizar Contraseña de Funeraria</span>
              </h4>
              <button
                type="button"
                onClick={() => setCredentialTargetAgency(null)}
                className="text-[#7A6B5D] hover:text-[#2A231C]"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6B5D] mb-4">
              Funeraria: <strong>{credentialTargetAgency.name}</strong>
              <br />
              Usuario: <strong>{credentialTargetAgency.loginUsername || credentialTargetAgency.id}</strong>
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] mb-1">
                  Nueva Contraseña:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: NuevaClave2026!"
                  value={newCredPassword}
                  onChange={(e) => setNewCredPassword(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-[#DACFBD] rounded-xl text-[#2A231C]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCredentialTargetAgency(null)}
                  className="px-3.5 py-1.5 bg-white border border-[#DACFBD] text-xs font-semibold rounded-xl text-[#695A4D]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCreds}
                  className="px-4 py-1.5 bg-[#8C733E] hover:bg-[#786131] text-white text-xs font-semibold rounded-xl"
                >
                  {isUpdatingCreds ? 'Guardando...' : 'Actualizar Clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE OBITUARY CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {obituaryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-memorial-serif text-xl font-bold text-[#2A231C]">
              ¿Eliminar esta esquela definitivamente?
            </h4>
            <p className="text-xs text-[#7A6B5D]">
              Estás a punto de eliminar la esquela de <strong>"{obituaryToDelete.fullName}"</strong> y todos sus mensajes de condolencia. Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setObituaryToDelete(null)}
                className="px-4 py-2 bg-white border border-[#DACFBD] text-xs font-semibold rounded-xl text-[#695A4D]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteObituary}
                disabled={isDeletingObituary}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
              >
                {isDeletingObituary ? 'Eliminando...' : 'Sí, Eliminar Esquela'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE AGENCY CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {agencyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-memorial-serif text-xl font-bold text-[#2A231C]">
              ¿Eliminar la funeraria "{agencyToDelete.name}"?
            </h4>
            <p className="text-xs text-[#7A6B5D]">
              Se revocarán sus accesos de login y las esquelas publicadas se reasignarán a la funeraria principal.
            </p>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAgencyToDelete(null)}
                className="px-4 py-2 bg-white border border-[#DACFBD] text-xs font-semibold rounded-xl text-[#695A4D]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAgencyConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SHARE QR FOR OBITUARY */}
      {/* ------------------------------------------------------------- */}
      {adminQrModalObituary && (
        <ShareQRModal
          obituary={adminQrModalObituary}
          isOpen={Boolean(adminQrModalObituary)}
          onClose={() => setAdminQrModalObituary(null)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EPITAPH & BIOGRAPHY CATALOG SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <CatalogSelectorModal
        isOpen={catalogModalState.isOpen}
        onClose={() => setCatalogModalState((prev) => ({ ...prev, isOpen: false }))}
        type={catalogModalState.type}
        onSelectText={handleCatalogTextSelect}
        deceasedName={catalogModalState.target === 'pub' ? pubFullName : editFullName}
        epitaphs={EPITAPH_CATALOG}
        biographies={BIOGRAPHY_TEMPLATES}
        epitaphCategories={EPITAPH_CATEGORIES}
        biographyCategories={BIOGRAPHY_CATEGORIES}
      />
    </div>
  );
}
