import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Table,
  Download,
  Plus,
  Upload,
  Trash2,
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  Search,
  Loader2,
  FileCode,
  FileArchive,
  User,
  Camera,
  CheckCircle2,
  RefreshCw,
  Calendar,
  ShieldCheck,
  HardDrive,
  Calculator,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import ProductCalculator from '../components/ProductCalculator';
import { supabase } from '../lib/supabase';
import { uploadToR2, deleteFromR2 } from '../lib/r2-upload';
import { useAuth } from '../context/AuthContext';
import { ResellerFolder, ResellerFile, Profile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, IMAGE_CONFIGS } from '../lib/image-optimization';

const ResellerArea: React.FC = () => {
  const { user, profile: authProfile, refreshProfile, role, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'files' | 'profile' | 'calculator'>('files');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<ResellerFolder[]>([]);
  const [files, setFiles] = useState<ResellerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Drive' }]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Profile State
  const [currentUserProfile, setCurrentUserProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  
  // UI States
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename state
  const [renameTarget, setRenameTarget] = useState<{ type: 'file' | 'folder'; item: ResellerFile | ResellerFolder } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Move state
  const [moveTarget, setMoveTarget] = useState<ResellerFile | null>(null);
  const [allFolders, setAllFolders] = useState<ResellerFolder[]>([]);

  // Open context menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Drag & drop
  const [draggedFile, setDraggedFile] = useState<ResellerFile | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Role access editor
  const [rolesTarget, setRolesTarget] = useState<{ type: 'file' | 'folder'; item: ResellerFile | ResellerFolder } | null>(null);
  const [rolesValue, setRolesValue] = useState<string[]>([]);

  const ALL_ROLES = ['super', 'restricted', 'reseller', 'hr', 'mkt'] as const;

  const STATIC_FILES: ResellerFile[] = [
    {
      id: 'static-1',
      name: 'Catálogo Krenke 2026',
      file_url: 'https://s3.krenke.com.br/CataloVFINAL-%20digital.pdf',
      file_type: 'pdf',
      folder_id: null,
      size: 0,
      created_at: '',
      allowed_roles: null,
    },
    {
      id: 'static-2',
      name: 'Produtos Krenke Atualizado AVULSOS 2026',
      file_url: 'https://s3.krenke.com.br/Produtos%20Krenke%20%20Atualizado%20AVULSOS%202026.pdf',
      file_type: 'pdf',
      folder_id: null,
      size: 0,
      created_at: '',
      allowed_roles: null,
    },
    {
      id: 'static-3',
      name: 'Tabela Playgrounds Matriz Revenda Atualizada 2026',
      file_url: 'https://s3.krenke.com.br/TABELA%20%20PLAYGROUNDS%20MATRIZ%20REVENDA%20%20ATUALIZADA%202026.pdf',
      file_type: 'pdf',
      folder_id: null,
      size: 0,
      created_at: '',
      allowed_roles: null,
    },
  ];

  const isRoleAllowed = (allowedRoles: string[] | null) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (isSuperAdmin) return true;
    return role ? allowedRoles.includes(role) : false;
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let folderQuery = supabase.from('reseller_folders').select('*');
      if (currentFolderId) {
        folderQuery = folderQuery.eq('parent_id', currentFolderId);
      } else {
        folderQuery = folderQuery.is('parent_id', null);
      }
      const { data: foldersResult } = await folderQuery.order('name');
      const visibleFolders = (foldersResult || []).filter(f => isRoleAllowed(f.allowed_roles));
      setFolders(visibleFolders);

      let fileQuery = supabase.from('reseller_files').select('*');
      if (currentFolderId) {
        fileQuery = fileQuery.eq('folder_id', currentFolderId);
      } else {
        fileQuery = fileQuery.is('folder_id', null);
      }
      const { data: filesResult } = await fileQuery.order('name');
      const visibleFiles = (filesResult || []).filter(f => isRoleAllowed(f.allowed_roles));

      if (!currentFolderId) {
        setFiles([...STATIC_FILES, ...visibleFiles]);
      } else {
        setFiles(visibleFiles);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      if (!currentFolderId) setFiles(STATIC_FILES);
      else setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserProfile = async () => {
    if (!supabase || !user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (err) {
      console.error('Error fetching current profile:', err);
    }
  };

  const fetchAllFolders = async () => {
    const { data } = await supabase.from('reseller_folders').select('*').order('name');
    setAllFolders(data || []);
  };

  useEffect(() => {
    fetchContent();
    fetchCurrentUserProfile();
    if (isSuperAdmin) fetchAllFolders();
  }, [currentFolderId]);

  // Keep editing state in sync with fresh profile updates from context if needed
  useEffect(() => {
    if (authProfile && !currentUserProfile.id) {
      setCurrentUserProfile(authProfile);
    }
  }, [authProfile, currentUserProfile.id]);

  const handleSaveProfile = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: currentUserProfile.full_name,
          avatar_url: currentUserProfile.avatar_url,
          phone: currentUserProfile.phone
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    setSaving(true);
    try {
      // Compress image before upload
      const optimizedFile = await compressImage(file, IMAGE_CONFIGS.AVATAR);
      const optimizedFileExt = optimizedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${optimizedFileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, optimizedFile, { cacheControl: '31536000', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setCurrentUserProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      // Auto-save the avatar_url to the profile table immediately
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      await refreshProfile();
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('reseller_folders')
        .insert([{ 
          name: newFolderName, 
          parent_id: currentFolderId 
        }]);

      if (error) throw error;
      
      setNewFolderName('');
      setIsCreatingFolder(false);
      fetchContent();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Erro ao criar pasta');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || '';
      const folder = currentFolderId || undefined;

      const { publicUrl, key } = await uploadToR2(file, folder);

      const { error: dbError } = await supabase
        .from('reseller_files')
        .insert([{
          name: file.name,
          file_url: publicUrl,
          file_type: fileExt,
          folder_id: currentFolderId,
          size: file.size,
          storage_path: key,
        }]);

      if (dbError) throw dbError;

      fetchContent();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Erro ao subir arquivo: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncR2 = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/r2-sync', { method: 'POST' });
      const text = await res.text();
      console.log('r2-sync raw response:', res.status, text);
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}: ${text}`);
      alert(`Sync concluído! ${data.synced} arquivo(s) novo(s) importado(s) de ${data.found} no bucket.`);
      fetchContent();
    } catch (err: any) {
      alert('Erro no sync: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    const { type, item } = renameTarget;
    const table = type === 'file' ? 'reseller_files' : 'reseller_folders';
    await supabase.from(table).update({ name: renameValue.trim() }).eq('id', item.id);
    setRenameTarget(null);
    fetchContent();
  };

  const handleMoveFile = async (targetFolderId: string | null) => {
    if (!moveTarget) return;
    await supabase.from('reseller_files').update({ folder_id: targetFolderId }).eq('id', moveTarget.id);
    setMoveTarget(null);
    fetchContent();
  };

  const handleSaveRoles = async () => {
    if (!rolesTarget) return;
    const { type, item } = rolesTarget;
    const table = type === 'file' ? 'reseller_files' : 'reseller_folders';
    const value = rolesValue.length === 0 ? null : rolesValue;
    await supabase.from(table).update({ allowed_roles: value }).eq('id', item.id);
    setRolesTarget(null);
    fetchContent();
  };

  const handleDeleteFile = async (file: ResellerFile) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${file.name}?`)) return;

    try {
      if (file.storage_path) {
        await deleteFromR2(file.storage_path).catch(console.error);
      }

      const { error } = await supabase
        .from('reseller_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDeleteFolder = async (folder: ResellerFolder) => {
    if (!window.confirm(`Excluir pasta "${folder.name}" e TUDO que houver dentro?`)) return;

    try {
      const { error } = await supabase
        .from('reseller_folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const navigateToFolder = (folder: ResellerFolder | null) => {
    if (folder === null) {
      setCurrentFolderId(null);
      setPath([{ id: null, name: 'Drive' }]);
    } else {
      setCurrentFolderId(folder.id);
      // Update path breadcrumbs
      const newPath = [...path];
      // Check if folder is already in path to prevent duplicates if user clicks breadcrumb
      const folderIndex = newPath.findIndex(p => p.id === folder.id);
      if (folderIndex !== -1) {
        setPath(newPath.slice(0, folderIndex + 1));
      } else {
        setPath([...newPath, { id: folder.id, name: folder.name }]);
      }
    }
  };

  const getFileIcon = (type: string) => {
    const t = type?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(t)) return <ImageIcon className="text-blue-500" />;
    if (['pdf'].includes(t)) return <FileText className="text-red-500" />;
    if (['xlsx', 'xls', 'csv'].includes(t)) return <Table className="text-green-500" />;
    if (['zip', 'rar', '7z'].includes(t)) return <FileArchive className="text-yellow-500" />;
    return <File className="text-gray-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#312783] mb-2 flex items-center gap-3">
              Área do Revendedor
              {isSuperAdmin && <span className="text-xs bg-krenke-orange text-white px-2 py-1 rounded-full">Painel Admin</span>}
            </h1>
            <p className="text-slate-500">Materiais de apoio e gestão de conta.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-12 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'files' ? 'bg-[#312783] text-white shadow-lg' : 'text-slate-400 hover:text-[#312783] hover:bg-slate-50'}`}
          >
            <HardDrive size={20} /> Arquivos
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'calculator' ? 'bg-[#312783] text-white shadow-lg' : 'text-slate-400 hover:text-[#312783] hover:bg-slate-50'}`}
          >
            <Calculator size={20} /> Calculadora
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-[#312783] text-white shadow-lg' : 'text-slate-400 hover:text-[#312783] hover:bg-slate-50'}`}
          >
            <User size={20} /> Meu Perfil
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'files' ? (
            <motion.div
              key="files-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Search and Breadcrumbs */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    id="form-reseller-search"
                    placeholder="Pesquisar materiais..." 
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-[#312783] transition-all shadow-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {path.map((p, index) => (
                    <React.Fragment key={p.id || 'root'}>
                      {index > 0 && <ChevronRight size={16} className="text-slate-400 shrink-0" />}
                      <button
                        onClick={() => {
                          if (p.id === null) {
                            navigateToFolder(null);
                          } else {
                            navigateToFolder({ id: p.id, name: p.name, parent_id: null, allowed_roles: null, created_at: '' });
                          }
                        }}
                        className={`text-sm font-bold whitespace-nowrap px-3 py-1.5 rounded-lg transition-all ${
                          index === path.length - 1
                          ? 'bg-white text-[#312783] shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:text-[#312783] hover:bg-slate-100'
                        }`}
                      >
                        {index === 0 ? <Folder size={16} className="inline mr-1" /> : null}
                        {p.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Drop zone for moving file back to current folder / root */}
              {draggedFile && currentFolderId && (
                <div
                  className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 text-blue-500 font-bold text-sm transition-all"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (draggedFile) {
                      supabase.from('reseller_files').update({ folder_id: null }).eq('id', draggedFile.id).then(() => fetchContent());
                      setDraggedFile(null);
                    }
                  }}
                >
                  <Folder size={18} /> Soltar aqui para mover para a raiz (Drive)
                </div>
              )}

              {/* Admin Actions */}
              {isSuperAdmin && (
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center gap-2 bg-white text-[#312783] border-2 border-slate-100 px-6 py-3 rounded-2xl font-bold hover:border-[#312783] transition-all shadow-sm"
                  >
                    <Plus size={20} /> Nova Pasta
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-[#312783] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#3f31a1] transition-all shadow-lg disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    {isUploading ? 'Enviando...' : 'Subir Arquivo'}
                  </button>
                  <button
                    onClick={handleSyncR2}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-white text-slate-500 border-2 border-slate-100 px-6 py-3 rounded-2xl font-bold hover:border-slate-400 transition-all shadow-sm disabled:opacity-50"
                    title="Importa arquivos do bucket R2 que ainda não aparecem aqui"
                  >
                    {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    {isSyncing ? 'Sincronizando...' : 'Sync R2'}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
              )}

              {/* Files/Folders Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 className="animate-spin text-[#312783]" size={48} />
                  <p className="text-slate-500 font-bold italic">Sincronizando drive...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Folder List */}
                  {filteredFolders.map(folder => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={folder.id}
                      className={`group relative bg-white rounded-3xl p-6 border-2 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer ${
                        dragOverFolderId === folder.id
                          ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                          : 'border-slate-100'
                      }`}
                      onClick={() => { setOpenMenuId(null); navigateToFolder(folder); }}
                      onDragOver={e => { e.preventDefault(); setDragOverFolderId(folder.id); }}
                      onDragLeave={() => setDragOverFolderId(null)}
                      onDrop={e => {
                        e.preventDefault();
                        setDragOverFolderId(null);
                        if (draggedFile && draggedFile.folder_id !== folder.id) {
                          supabase.from('reseller_files').update({ folder_id: folder.id }).eq('id', draggedFile.id).then(() => fetchContent());
                        }
                        setDraggedFile(null);
                      }}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Folder size={24} />
                        </div>
                        {isSuperAdmin && (
                          <div className="relative z-10" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === folder.id ? null : folder.id); }}
                              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openMenuId === folder.id && (
                              <div className="absolute right-0 top-8 z-[50] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 w-44">
                                <button onClick={() => { setRenameTarget({ type: 'folder', item: folder }); setRenameValue(folder.name); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Renomear</button>
                                <button onClick={() => { setRolesTarget({ type: 'folder', item: folder }); setRolesValue(folder.allowed_roles || []); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Acesso...</button>
                                <button onClick={() => { handleDeleteFolder(folder); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50">Excluir</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 line-clamp-1">{folder.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400 uppercase font-black tracking-widest">
                          {dragOverFolderId === folder.id ? '📂 Soltar aqui' : 'Pasta'}
                        </p>
                        {isSuperAdmin && folder.allowed_roles && folder.allowed_roles.length > 0 && (
                          <span className="text-[9px] uppercase font-black tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Lock size={9} /> {folder.allowed_roles.join(', ')}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* File List */}
                  {filteredFiles.map(file => {
                    const isDraggable = isSuperAdmin && !file.id.startsWith('static-');
                    const isDragging = draggedFile?.id === file.id;
                    return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={file.id}
                      draggable={isDraggable}
                      onDragStart={() => { setDraggedFile(file); setOpenMenuId(null); }}
                      onDragEnd={() => setDraggedFile(null)}
                      className={`group relative bg-white rounded-3xl p-6 border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all select-none ${
                        isDragging ? 'opacity-40 scale-95 border-[#312783] cursor-grabbing' : 'border-slate-100 cursor-default'
                      } ${isDraggable ? 'cursor-grab' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-slate-50">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="flex gap-1 items-start relative z-10">
                          <a
                            href={file.file_url}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-300 hover:text-[#312783] transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <Download size={18} />
                          </a>
                          {isDraggable && (
                            <div className="relative">
                              <button
                                onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === file.id ? null : file.id); }}
                                className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === file.id && (
                                <div className="absolute right-0 top-8 z-[50] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 w-44">
                                  <button onClick={() => { setRenameTarget({ type: 'file', item: file }); setRenameValue(file.name); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Renomear</button>
                                  <button onClick={() => { setMoveTarget(file); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Mover para...</button>
                                  <button onClick={() => { setRolesTarget({ type: 'file', item: file }); setRolesValue(file.allowed_roles || []); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Acesso...</button>
                                  <button onClick={() => { handleDeleteFile(file); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50">Excluir</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 line-clamp-2 mb-4 h-12" title={file.name}>{file.name}</h3>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#312783] bg-[#312783]/5 px-2 py-1 rounded-lg">
                          {file.file_type || 'unkn'}
                        </span>
                        <div className="flex items-center gap-2">
                          {isSuperAdmin && file.allowed_roles && file.allowed_roles.length > 0 && (
                            <span className="text-[9px] uppercase font-black tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Lock size={9} /> {file.allowed_roles.join(', ')}
                            </span>
                          )}
                          {file.size > 0 && <span className="text-xs text-slate-400 font-bold">{formatSize(file.size)}</span>}
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}

                  {/* Empty State */}
                  {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                        <HardDrive size={48} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-400">Nenhum arquivo encontrado</h3>
                      <p className="text-slate-400 mt-2">Os materiais aparecerão aqui.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'calculator' ? (
            <motion.div
              key="calculator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProductCalculator />
            </motion.div>
          ) : (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfileView
                profile={currentUserProfile}
                saving={saving}
                onSave={handleSaveProfile}
                onProfileChange={updates => setCurrentUserProfile(prev => ({ ...prev, ...updates }))}
                onImageUpload={handleAvatarUpload}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close menus on outside click */}
        {openMenuId && (
          <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
        )}

        {/* Modal: Rename */}
        <AnimatePresence>
          {renameTarget && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#312783]/20 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-2xl font-black text-[#312783] mb-6">Renomear</h3>
                <input
                  autoFocus
                  type="text"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#312783] mb-8 outline-none transition-all font-bold text-slate-900"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                />
                <div className="flex gap-4">
                  <button onClick={() => setRenameTarget(null)} className="flex-1 px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 uppercase tracking-widest text-xs">Cancelar</button>
                  <button onClick={handleRename} className="flex-1 px-4 py-4 rounded-2xl font-black bg-[#312783] text-white hover:bg-[#3f31a1] shadow-lg uppercase tracking-widest text-xs">Salvar</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Move File */}
        <AnimatePresence>
          {moveTarget && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#312783]/20 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-2xl font-black text-[#312783] mb-2">Mover arquivo</h3>
                <p className="text-slate-500 font-bold mb-6 line-clamp-1">{moveTarget.name}</p>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-8">
                  <button
                    onClick={() => handleMoveFile(null)}
                    className="w-full text-left px-5 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 border border-slate-100 flex items-center gap-3"
                  >
                    <Folder size={18} className="text-blue-400" /> Drive (raiz)
                  </button>
                  {allFolders.filter(f => f.id !== moveTarget.folder_id).map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleMoveFile(f.id)}
                      className="w-full text-left px-5 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 border border-slate-100 flex items-center gap-3"
                    >
                      <Folder size={18} className="text-blue-400" /> {f.name}
                    </button>
                  ))}
                </div>
                <button onClick={() => setMoveTarget(null)} className="w-full px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 uppercase tracking-widest text-xs">Cancelar</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Role Access */}
        <AnimatePresence>
          {rolesTarget && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#312783]/20 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-amber-50 rounded-2xl"><Lock size={20} className="text-amber-500" /></div>
                  <h3 className="text-2xl font-black text-[#312783]">Controle de Acesso</h3>
                </div>
                <p className="text-slate-500 font-bold mb-6 line-clamp-1 ml-1">{rolesTarget.item.name}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Roles com acesso (vazio = todos)</p>
                <div className="space-y-2 mb-8">
                  {ALL_ROLES.map(r => (
                    <label key={r} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                      <input
                        type="checkbox"
                        checked={rolesValue.includes(r)}
                        onChange={e => {
                          if (e.target.checked) setRolesValue(prev => [...prev, r]);
                          else setRolesValue(prev => prev.filter(x => x !== r));
                        }}
                        className="w-5 h-5 rounded accent-[#312783]"
                      />
                      <span className="font-bold text-slate-700 capitalize">{r}</span>
                      {r === 'super' && <span className="ml-auto text-[10px] text-slate-400">superadmin</span>}
                      {r === 'reseller' && <span className="ml-auto text-[10px] text-slate-400">revendedor</span>}
                      {r === 'restricted' && <span className="ml-auto text-[10px] text-slate-400">restrito</span>}
                      {r === 'hr' && <span className="ml-auto text-[10px] text-slate-400">RH</span>}
                      {r === 'mkt' && <span className="ml-auto text-[10px] text-slate-400">marketing</span>}
                    </label>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-xs text-blue-700 font-bold">
                  {rolesValue.length === 0
                    ? 'Nenhuma role selecionada = visível para todos os usuários autenticados.'
                    : `Visível apenas para: ${rolesValue.join(', ')}`}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setRolesTarget(null)} className="flex-1 px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 uppercase tracking-widest text-xs">Cancelar</button>
                  <button onClick={handleSaveRoles} className="flex-1 px-4 py-4 rounded-2xl font-black bg-[#312783] text-white hover:bg-[#3f31a1] shadow-lg uppercase tracking-widest text-xs">Salvar</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: New Folder */}
        <AnimatePresence>
          {isCreatingFolder && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#312783]/20 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                    <Folder size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#312783] mb-2">Nova Pasta</h3>
                <p className="text-slate-500 mb-8 font-bold">Organize seus materiais de revenda.</p>
                
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ex: Catálogos 2024"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#312783] mb-8 outline-none transition-all font-bold text-slate-900"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsCreatingFolder(false)}
                    className="flex-1 px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateFolder}
                    className="flex-1 px-4 py-4 rounded-2xl font-black bg-[#312783] text-white hover:bg-[#3f31a1] transition-all shadow-lg shadow-[#312783]/20 uppercase tracking-widest text-xs"
                  >
                    Criar Pasta
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Profile View Component ---
const ProfileView = ({
  profile,
  onSave,
  saving,
  onProfileChange,
  onImageUpload
}: {
  profile: Partial<Profile>,
  onSave: () => void,
  saving: boolean,
  onProfileChange: (updates: Partial<Profile>) => void,
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwMsg, setPwMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPwMsg({ type: 'err', text: 'Senha deve ter ao menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'As senhas não conferem.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMsg({ type: 'err', text: error.message });
    } else {
      setPwMsg({ type: 'ok', text: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
  <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Avatar Column */}
              <div className="space-y-4 flex flex-col items-center">
                  <div className="relative group">
                      <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                          {profile.avatar_url ? (
                              <img src={profile.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#312783] to-[#3f31a1] text-white text-5xl font-black italic uppercase">
                                  {(profile.email?.[0] || 'K').toUpperCase()}
                              </div>
                          )}
                      </div>
                      <label className="absolute bottom-2 right-2 p-3 bg-krenke-orange text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                          <Camera size={20} />
                          <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
                      </label>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Foto do Perfil</p>
              </div>

              {/* Info Column */}
              <div className="flex-1 space-y-8 w-full">
                  <div className="grid gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase px-2 tracking-widest">Nome Completo</label>
                          <input
                              type="text"
                              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-slate-900 transition-all outline-none"
                              value={profile.full_name || ''}
                              onChange={e => onProfileChange({ full_name: e.target.value })}
                              placeholder="Digite seu nome"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase px-2 tracking-widest">E-mail de Acesso</label>
                          <input
                              type="email"
                              disabled
                              className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed italic"
                              value={profile.email || ''}
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase px-2 tracking-widest">Telefone / WhatsApp</label>
                          <input
                              type="text"
                              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-slate-900 transition-all outline-none"
                              value={profile.phone || ''}
                              onChange={e => onProfileChange({ phone: e.target.value })}
                              placeholder="(00) 00000-0000"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase px-2 tracking-widest">Data de Cadastro</label>
                          <div className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-500 italic flex items-center gap-2">
                              <Calendar size={16} />
                              {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                          </div>
                      </div>
                  </div>

                  <button
                      onClick={onSave}
                      disabled={saving}
                      className="w-full py-5 bg-[#312783] text-white font-black rounded-2xl hover:bg-[#3f31a1] shadow-lg shadow-[#312783]/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                  >
                      {saving ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                      ATUALIZAR MEU PERFIL
                  </button>
              </div>
          </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-[#312783]/10 rounded-2xl">
                  <Lock size={22} className="text-[#312783]" />
              </div>
              <div>
                  <h2 className="text-xl font-black text-slate-900">Alterar Senha</h2>
                  <p className="text-sm text-slate-400">Mínimo 6 caracteres</p>
              </div>
          </div>
          <div className="space-y-5 max-w-md">
              <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nova Senha</label>
                  <div className="relative">
                      <input
                          type={showNew ? 'text' : 'password'}
                          className="w-full p-4 pr-12 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-slate-900 transition-all outline-none"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirmar Nova Senha</label>
                  <div className="relative">
                      <input
                          type={showConfirm ? 'text' : 'password'}
                          className="w-full p-4 pr-12 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-slate-900 transition-all outline-none"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
              </div>
              {pwMsg && (
                  <div className={`p-4 rounded-2xl font-bold text-sm ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {pwMsg.text}
                  </div>
              )}
              <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  className="w-full py-4 bg-[#312783] text-white font-black rounded-2xl hover:bg-[#3f31a1] shadow-lg shadow-[#312783]/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
              >
                  {pwSaving ? <RefreshCw className="animate-spin" size={20} /> : <Lock size={20} />}
                  ALTERAR SENHA
              </button>
          </div>
      </div>
  </div>
  );
};

export default ResellerArea;
