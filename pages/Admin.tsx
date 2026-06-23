import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, AppScript, Page, NavItem, Profile, JobOpening, JobApplication } from '../types';
import AdminLayout from '../components/AdminLayout';
import RichTextEditor from '../components/RichTextEditor';
import ProductSpecsManager from '../components/ProductSpecsManager';
import { useAuth } from '../context/AuthContext';
import { compressImage, IMAGE_CONFIGS } from '../lib/image-optimization';
import {
    Save,
    Upload,
    Search,
    Edit2,
    Plus,
    Trash2,
    Package,
    TrendingUp,
    Clock,
    X,
    RefreshCw,
    MessageSquare,
    FileText,
    Users,
    Mail,
    Phone,
    Calendar,
    ChevronRight,
    ExternalLink,
    Code,
    ToggleLeft,
    ToggleRight,
    ShieldCheck,
    Settings,
    User,
    Camera,
    CheckCircle2,
    LayoutTemplate,
    Sliders,
    GripVertical,
    Check,
    KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    products: string[];
    created_at: string;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string;
    author: string;
    published: boolean;
    created_at: string;
}



const ALL_SPECS_FIELDS = [
    { id: 'tamanho', label: 'Tamanho' },
    { id: 'dimensoesSeguranca', label: 'Dim. Segurança' },
    { id: 'areaMinima', label: 'Área Mínima' },
    { id: 'areaSeguranca', label: 'Área Segurança' },
    { id: 'criancas', label: 'Crianças' },
    { id: 'altura', label: 'Altura' },
    { id: 'peso', label: 'Peso' },
    { id: 'cubagem', label: 'Cubagem' },
    { id: 'norma', label: 'Norma' },
    { id: 'idade', label: 'Idade' },
];

// --- Sub-componente para o Formulário de Produto ---
interface ProductFormProps {
    product: Product;
    siteSettings: any[];
    saving: boolean;
    onSave: () => void;
    onDelete: () => void;
    onFormChange: (form: Partial<Product>) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'gallery') => void;
    scanStorage: (id: string) => Promise<any>;
    scanning: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
    product,
    siteSettings,
    saving,
    onSave,
    onDelete,
    onFormChange,
    onImageUpload,
    scanStorage,
    scanning
}) => {
    const [localForm, setLocalForm] = useState<Partial<Product>>({...product});
    const lastId = useRef<string | null>(product.id);

    // Sincroniza o estado local quando o produto selecionado ou seus assets mudam (ex: após upload ou save)
    useEffect(() => {
        const hasIdChanged = product.id !== lastId.current;
        const hasAssetsChanged = product.image !== localForm.image || 
                                JSON.stringify(product.images) !== JSON.stringify(localForm.images);
        
        if (hasIdChanged || hasAssetsChanged) {
            setLocalForm({...product});
            lastId.current = product.id;
            
            // Auto-scan se necessário
            if (!product.image && (!product.images || product.images.length === 0) && product.id) {
                scanStorage(product.id).then(assets => {
                    if (assets && lastId.current === product.id) {
                        setLocalForm(prev => ({ ...prev, image: assets.main, images: assets.gallery }));
                    }
                });
            }
        }
    }, [product]);

    // Sempre que o localForm mudar, avisa o pai (para que o handleSave consiga ler)
    useEffect(() => {
        onFormChange(localForm);
    }, [localForm]);

    const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, type: 'image' | 'gallery') => {
        if ('preventDefault' in e) e.preventDefault();
        
        let files: FileList | null = null;
        if ('target' in e && e.target instanceof HTMLInputElement) {
            files = e.target.files;
        } else if ('dataTransfer' in e) {
            files = e.dataTransfer.files;
        }

        if (files && files.length > 0) {
            // Criamos um evento fake ou passamos os arquivos diretamente se o pai suportar
            // Como onImageUpload do pai espera um ChangeEvent, vamos adaptar
            const fakeEvent = {
                target: { files }
            } as any;
            onImageUpload(fakeEvent, type);
        }
    };

    const reorderImages = (fromIndex: number, toIndex: number) => {
        const newImages = [...(localForm.images || [])];
        const [movedItem] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedItem);
        setLocalForm(prev => ({ ...prev, images: newImages }));
    };

    const [isDraggingOverGallery, setIsDraggingOverGallery] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    return (
        <form className="space-y-8" onSubmit={e => { e.preventDefault(); onSave(); }}>
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-6 z-10 border-b -mx-8 px-8">
                <div>
                    <h2 className="text-2xl font-black text-krenke-blue">{product.id ? 'Editar Produto' : 'Novo Produto'}</h2>
                    {scanning && <span className="text-xs text-krenke-orange animate-pulse">Escaneando Storage...</span>}
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onDelete} disabled={saving || !product.id} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Excluir Produto">
                        <Trash2 size={20} />
                    </button>
                    <button type="submit" disabled={saving} className="px-8 py-3 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                        SALVAR
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">ID / Código</label>
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-mono" value={localForm.id || ''} onChange={e => setLocalForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))} />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Nome</label>
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-bold" value={localForm.name || ''} onChange={e => setLocalForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Slug (URL)</label>
                    <input type="text" placeholder="auto-gerado" className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm" value={localForm.slug || ''} onChange={e => setLocalForm(prev => ({ ...prev, slug: e.target.value }))} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Categoria</label>
                    <select className="w-full p-4 bg-gray-50 border rounded-xl" value={localForm.category || ''} onChange={e => setLocalForm(prev => ({ ...prev, category: e.target.value }))}>
                        <option value="">Selecione...</option>
                        {(siteSettings.find(s => s.key === 'product_categories')?.value ? JSON.parse(siteSettings.find(s => s.key === 'product_categories')!.value!) : ["Playgrounds Completos", "Little Play", "Brinquedos Avulsos", "Linha Pet", "Mobiliário Urbano e Jardim", "LINHA TEMÁTICA"]).map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Capa</label>
                    <div 
                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-krenke-orange', 'bg-orange-50'); }}
                        onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-krenke-orange', 'bg-orange-50'); }}
                        onDrop={e => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-krenke-orange', 'bg-orange-50');
                            handleLocalImageUpload(e, 'image');
                        }}
                        className="border-2 border-dashed rounded-2xl aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden group transition-all"
                    >
                        {localForm.image ? (
                            <>
                                <img src={localForm.image} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                                    <label htmlFor="capa-produto" className="cursor-pointer p-3 bg-white rounded-full text-gray-900 hover:bg-orange-100 shadow-xl transition-all hover:scale-110" title="Trocar Capa">
                                        <Upload size={20} />
                                        <input id="capa-produto" type="file" className="hidden" onChange={e => handleLocalImageUpload(e, 'image')} />
                                    </label>
                                    <button type="button" onClick={() => setLocalForm(prev => ({...prev, image: ''}))} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl transition-all hover:scale-110" title="Remover Capa">
                                        <X size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label htmlFor="capa-produto" className="cursor-pointer flex flex-col items-center p-8 w-full h-full justify-center">
                                <Upload className="text-gray-300 mb-2" size={40} />
                                <span className="text-xs text-gray-400 font-bold uppercase">Arraste a capa aqui</span>
                                <span className="text-[10px] text-gray-300">ou clique para selecionar</span>
                                <input id="capa-produto" type="file" className="hidden" onChange={e => handleLocalImageUpload(e, 'image')} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-400 uppercase">Galeria</label>
                    <label className="text-krenke-orange text-xs font-bold cursor-pointer hover:underline">
                        + Adicionar fotos
                        <input type="file" className="hidden" multiple onChange={e => handleLocalImageUpload(e, 'gallery')} />
                    </label>
                </div>
                <div 
                    onDragOver={e => { e.preventDefault(); setIsDraggingOverGallery(true); }}
                    onDragLeave={() => setIsDraggingOverGallery(false)}
                    onDrop={e => {
                        e.preventDefault();
                        setIsDraggingOverGallery(false);
                        handleLocalImageUpload(e, 'gallery');
                    }}
                    className={`grid grid-cols-4 md:grid-cols-6 gap-4 p-4 rounded-xl border min-h-[140px] transition-all relative ${
                        isDraggingOverGallery ? 'bg-orange-50 border-krenke-orange scale-[1.01] shadow-inner' : 'bg-gray-50'
                    }`}
                >
                    <AnimatePresence mode="popLayout">
                        {localForm.images?.map((img, i) => (
                            <motion.div 
                                key={img}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative aspect-square rounded-lg overflow-hidden border bg-white group cursor-move shadow-sm hover:shadow-md transition-shadow"
                                draggable
                                onDragStart={() => setDraggedItemIndex(i)}
                                onDragEnd={() => setDraggedItemIndex(null)}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (draggedItemIndex !== null && draggedItemIndex !== i) {
                                        reorderImages(draggedItemIndex, i);
                                        setDraggedItemIndex(i);
                                    }
                                }}
                            >
                                <img src={img} className="w-full h-full object-cover pointer-events-none" />
                                
                                {/* Grip Overlay para indicar arrastável */}
                                <div className="absolute top-1 left-1 p-1 bg-white/80 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={14} className="text-gray-400" />
                                </div>

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                    <button type="button" onClick={() => {
                                        const oldCover = localForm.image;
                                        const newImages = localForm.images?.filter(u => u !== img) || [];
                                        if (oldCover) newImages.push(oldCover);
                                        setLocalForm(prev => ({...prev, image: img, images: newImages}));
                                    }} className="p-1.5 bg-krenke-blue text-white rounded-full hover:bg-blue-600 shadow-lg" title="Definir como Capa">
                                        <Check size={16} />
                                    </button>
                                    <button type="button" onClick={() => setLocalForm(prev => ({ ...prev, images: prev.images?.filter(u => u !== img) }))} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg" title="Remover Foto">
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {(!localForm.images || localForm.images.length === 0) && !isDraggingOverGallery && (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-300 py-8">
                            <Upload size={32} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Arraste fotos aqui</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase">Descrição Curta</label>
                <textarea rows={3} className="w-full p-4 bg-gray-50 border rounded-xl" value={localForm.description || ''} onChange={e => setLocalForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>

            {(() => {
                const configVal = siteSettings.find(s => s.key === 'category_specs_config')?.value;
                const config = configVal ? JSON.parse(configVal) : {};
                const catConfig = config[localForm.category || ''] || { mode: 'html', fields: [] };
                
                const isDefaultStructured = !configVal && (localForm.category === 'Playgrounds Completos' || localForm.category === 'Little Play');
                const useStructured = catConfig.mode === 'structured' || isDefaultStructured;

                return useStructured ? (
                    <ProductSpecsManager
                        value={localForm.specs || ''}
                        productDescription={localForm.description || ''}
                        enabledFields={catConfig.fields || ALL_SPECS_FIELDS.map(f => f.id)}
                        onChange={val => setLocalForm(prev => ({ ...prev, specs: val }))}
                    />
                ) : (
                    <RichTextEditor
                        label="HTML Personalizado (Especificações)"
                        value={localForm.specs || ''}
                        onChange={val => setLocalForm(prev => ({ ...prev, specs: val }))}
                    />
                );
            })()}
        </form>
    );
};

// --- Dashboard View Component ---
const DashboardView = ({ stats }: { stats: any }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Total de Produtos', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
                { label: 'Novos Orçamentos', value: stats.totalLeads, icon: Mail, color: 'bg-orange-500' },
                { label: 'Artigos no Blog', value: stats.totalPosts || 0, icon: FileText, color: 'bg-purple-500' },
                { label: 'Usuários', value: stats.totalUsers || 0, icon: Users, color: 'bg-indigo-500' },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-xl text-white`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-krenke-blue flex items-center gap-2">
                        <Mail className="text-krenke-orange" /> Últimos Orçamentos
                    </h3>
                </div>
                <div className="space-y-4">
                    {stats.recentLeads?.length > 0 ? stats.recentLeads.map((lead: any) => (
                        <div key={lead.id} className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{lead.name}</p>
                                <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-krenke-orange rounded">
                                {lead.products?.length || 0} produtos
                            </span>
                        </div>
                    )) : <p className="text-gray-400 italic text-center py-4">Nenhum orçamento recente</p>}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-krenke-blue flex items-center gap-2">
                        <FileText className="text-krenke-orange" /> Artigos Recentes
                    </h3>
                </div>
                <div className="space-y-4">
                    {stats.recentPosts?.length > 0 ? stats.recentPosts.map((post: any) => (
                        <div key={post.id} className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 truncate max-w-[200px]">{post.title}</p>
                                <p className="text-xs text-gray-500">{post.published ? 'Publicado' : 'Rascunho'}</p>
                            </div>
                            <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-gray-400 italic text-center py-4">Nenhum artigo recente</p>}
                </div>
            </div>
        </div>
    </div>
);

// --- Users View Component ---
const UsersView = ({
    users,
    onUpdateRole,
    onCreateUser,
    onResendInvite,
    onDeleteUser,
}: {
    users: Profile[],
    onUpdateRole: (id: string, role: 'super' | 'restricted' | 'reseller' | 'hr') => void,
    onCreateUser: (data: { full_name: string; email: string; phone: string; role: string }) => Promise<void>,
    onResendInvite: (email: string) => Promise<void>,
    onDeleteUser: (id: string, email: string) => Promise<void>,
}) => {
    const [showCreate, setShowCreate] = React.useState(false);
    const [resetingId, setResetingId] = React.useState<string | null>(null);

    const handleResetPassword = async (userId: string, email: string) => {
        if (!confirm(`Enviar e-mail de redefinição de senha para ${email}?`)) return;
        setResetingId(userId);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/revendedor`
        });
        setResetingId(null);
        if (error) {
            alert('Erro ao enviar e-mail: ' + error.message);
        } else {
            alert(`E-mail de redefinição enviado para ${email}!`);
        }
    };
    const [creating, setCreating] = React.useState(false);
    const [newUser, setNewUser] = React.useState({ full_name: '', email: '', phone: '', role: 'restricted' });

    const handleCreate = async () => {
        if (!newUser.full_name || !newUser.email) {
            alert('Preencha nome e e-mail.');
            return;
        }
        setCreating(true);
        try {
            await onCreateUser(newUser);
            setNewUser({ full_name: '', email: '', phone: '', role: 'restricted' });
            setShowCreate(false);
        } finally {
            setCreating(false);
        }
    };

    const roleColor = (role: string) => {
        if (role === 'super') return 'bg-orange-100 text-krenke-orange';
        if (role === 'reseller') return 'bg-green-100 text-green-600';
        if (role === 'hr') return 'bg-purple-100 text-purple-600';
        return 'bg-blue-100 text-krenke-blue';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-krenke-blue">Gestão de Usuários</h1>
                <button
                    onClick={() => setShowCreate(v => !v)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 transition-colors"
                >
                    <Plus size={18} /> Novo Usuário
                </button>
            </div>

            {showCreate && (
                <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                    <h2 className="font-black text-krenke-blue text-lg">Criar Novo Usuário</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase">Nome Completo</label>
                            <input type="text" className="w-full p-3 bg-gray-50 border rounded-xl font-bold" value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} placeholder="Nome completo" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase">E-mail</label>
                            <input type="email" className="w-full p-3 bg-gray-50 border rounded-xl" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase">Telefone / WhatsApp</label>
                            <input type="text" className="w-full p-3 bg-gray-50 border rounded-xl" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="(00) 00000-0000" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase">Nível de Acesso</label>
                            <select className="w-full p-3 bg-gray-50 border rounded-xl font-bold" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                                <option value="super">Super Admin</option>
                                <option value="hr">RH (Vagas e Candidaturas)</option>
                                <option value="reseller">Revendedor</option>
                                <option value="restricted">Acesso Restrito</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleCreate} disabled={creating} className="px-6 py-2.5 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                            {creating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />} Criar Usuário
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Usuário</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Nível de Acesso</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {u.avatar_url ? (
                                            <img src={u.avatar_url} className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg ${u.role === 'super' ? 'bg-krenke-orange' : u.role === 'hr' ? 'bg-purple-500' : 'bg-krenke-blue'}`}>
                                                {u.email[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{u.full_name || 'Usuário Krenke'}</span>
                                            {u.role === 'restricted' && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Aguardando Autorização</span>}
                                            {u.role === 'reseller' && <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Revendedor Autorizado</span>}
                                            {u.role === 'hr' && <span className="text-[10px] text-purple-500 font-bold uppercase tracking-tight">RH</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-600">{u.email}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={u.role}
                                        onChange={(e) => onUpdateRole(u.id, e.target.value as any)}
                                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-krenke-orange/20 cursor-pointer ${roleColor(u.role)}`}
                                    >
                                        <option value="super">Super Admin</option>
                                        <option value="hr">RH</option>
                                        <option value="reseller">Revendedor</option>
                                        <option value="restricted">Acesso Restrito</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    {u.email_confirmed_at ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black uppercase text-green-500">Confirmado</span>
                                            <span className="text-[10px] text-gray-400">{u.last_sign_in_at ? `Último acesso: ${new Date(u.last_sign_in_at).toLocaleDateString('pt-BR')}` : 'Nunca acessou'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black uppercase text-amber-500">Aguardando convite</span>
                                            <span className="text-[10px] text-gray-400">Desde {new Date(u.created_at).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {!u.email_confirmed_at && (
                                            <button
                                                onClick={() => onResendInvite(u.email)}
                                                title="Reenviar convite por e-mail"
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                                <Mail size={12} /> Enviar Convite
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleResetPassword(u.id, u.email)}
                                            title="Enviar e-mail de redefinição de senha"
                                            disabled={resetingId === u.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors disabled:opacity-50"
                                        >
                                            {resetingId === u.id ? <RefreshCw size={12} className="animate-spin" /> : <KeyRound size={12} />} Senha
                                        </button>
                                        <button
                                            onClick={() => onDeleteUser(u.id, u.email)}
                                            title="Excluir usuário"
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
}) => (
    <div className="max-w-4xl space-y-8">
        <h1 className="text-2xl font-black text-krenke-blue flex items-center gap-3">
            <User className="text-krenke-orange" /> Meu Perfil
        </h1>

        <div className="bg-white rounded-[2rem] border shadow-premium p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Avatar Column */}
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-krenke-blue to-vibrant-purple text-white text-5xl font-black italic uppercase">
                                    {(profile.email?.[0] || 'K').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-2 right-2 p-3 bg-krenke-orange text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            <Camera size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
                        </label>
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 space-y-8 w-full">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">Nome Completo</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-gray-900 transition-all outline-none"
                                value={profile.full_name || ''}
                                onChange={e => onProfileChange({ full_name: e.target.value })}
                                placeholder="Digite seu nome"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">E-mail</label>
                            <input
                                type="email"
                                disabled
                                className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed italic"
                                value={profile.email || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-krenke-orange rounded-2xl font-bold text-gray-900 transition-all outline-none"
                                value={profile.phone || ''}
                                onChange={e => onProfileChange({ phone: e.target.value })}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">Data de Cadastro</label>
                            <div className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-gray-500 italic flex items-center gap-2">
                                <Calendar size={16} />
                                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="w-full py-5 bg-krenke-orange text-white font-black rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                        ATUALIZAR MEU PERFIL
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// --- Scripts View Component ---
const ScriptsView = ({
    scripts,
    onSelect,
    selected,
    form,
    setForm,
    onSave,
    onDelete,
    saving,
    onNew
}: {
    scripts: AppScript[],
    onSelect: (s: AppScript) => void,
    selected: AppScript | null,
    form: Partial<AppScript>,
    setForm: (f: any) => void,
    onSave: () => void,
    onDelete: () => void,
    saving: boolean,
    onNew: () => void
}) => (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
        <div className="lg:col-span-4 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2 text-krenke-blue">
                        <Code size={20} className="text-krenke-orange" /> Scripts & Tags
                    </h2>
                    <button onClick={onNew} className="p-2 bg-krenke-orange text-white rounded-lg">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {scripts.map(s => (
                    <button
                        key={s.id}
                        onClick={() => onSelect(s)}
                        className={`w-full p-4 border-b text-left flex items-center gap-4 ${selected?.id === s.id ? 'bg-orange-50 border-l-4 border-l-krenke-orange' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {s.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">{s.title}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.placement}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm overflow-y-auto p-8 relative">
            {selected ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-6 z-10 border-b -mx-8 px-8">
                        <h2 className="text-2xl font-black text-krenke-blue">{selected.id ? 'Editar Script' : 'Novo Script'}</h2>
                        <div className="flex items-center gap-3">
                            {selected.id && (
                                <button onClick={onDelete} disabled={saving} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button onClick={onSave} disabled={saving} className="px-8 py-3 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                                {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                                SALVAR
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Título do Script</label>
                            <input
                                type="text"
                                placeholder="ex: Google Tag Manager, Facebook Pixel"
                                className="w-full p-4 bg-gray-50 border rounded-xl font-bold"
                                value={form.title || ''}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase">Posicionamento</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border rounded-xl font-bold"
                                    value={form.placement || 'head'}
                                    onChange={e => setForm({ ...form, placement: e.target.value as any })}
                                >
                                    <option value="head">Inserir no &lt;HEAD&gt;</option>
                                    <option value="body">Inserir no &lt;BODY&gt;</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase">Status</label>
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs uppercase ${form.is_active ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                    >
                                        {form.is_active ? (
                                            <><ToggleRight size={18} /> Ativado</>
                                        ) : (
                                            <><ToggleLeft size={18} /> Desativado</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Código (HTML/JS)</label>
                            <textarea
                                rows={12}
                                className="w-full p-6 bg-gray-900 text-green-400 font-mono text-sm border rounded-2xl outline-none focus:ring-2 focus:ring-krenke-orange/20"
                                placeholder="<!-- Cole seu código aqui -->"
                                value={form.content || ''}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                            />
                            <p className="text-[11px] text-gray-400 italic">Certifique-se de incluir as tags &lt;script&gt; ou &lt;style&gt; se necessário.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <Code size={80} strokeWidth={1} />
                    <p className="mt-4 font-bold">Selecione um script ou crie um novo</p>
                </div>
            )}
        </div>
    </div>
);

// --- Menu Builder Component ---
const MenuBuilder = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const [items, setItems] = useState<NavItem[]>([]);

    useEffect(() => {
        try {
            if (value) setItems(JSON.parse(value));
            else setItems([]);
        } catch {
            setItems([]);
        }
    }, [value]);

    const handleUpdate = (newItems: NavItem[]) => {
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        handleUpdate([...items, { id: Date.now().toString(), label: 'Novo Item', path: '/', isExternal: false }]);
    };

    const removeItem = (id: string) => {
        handleUpdate(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, updates: Partial<NavItem>) => {
        handleUpdate(items.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                <div>
                    <h4 className="font-bold">Menu Principal do Site</h4>
                    <p className="text-xs text-gray-500">Configure os links da barra de navegação superior.</p>
                </div>
                <button type="button" onClick={addItem} className="p-2 bg-krenke-blue text-white rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Plus size={16} /> ADD ITEM
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id || index} className="flex gap-4 items-start p-4 border rounded-xl bg-white relative group">
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Rótulo (ex: Produtos)"
                                    className="p-3 border rounded-lg text-sm font-bold"
                                    value={item.label}
                                    onChange={e => updateItem(item.id || '', { label: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Link (ex: /produtos ou https://...)"
                                    className="p-3 border rounded-lg text-sm font-mono"
                                    value={item.path}
                                    onChange={e => updateItem(item.id || '', { path: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`ext-${item.id}`}
                                    className="rounded border-gray-300"
                                    checked={item.isExternal || false}
                                    onChange={e => updateItem(item.id || '', { isExternal: e.target.checked })}
                                />
                                <label htmlFor={`ext-${item.id}`} className="text-xs text-gray-500 cursor-pointer">Abrir em nova aba (Link Externo)</label>
                            </div>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id || '')} className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center p-8 text-gray-400 border border-dashed rounded-xl bg-gray-50">
                        Nenhum item no menu. Adicione um clicando no botão acima.
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Category Builder Component ---
const CategoryBuilder = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [newCat, setNewCat] = useState('');

    useEffect(() => {
        try {
            if (value) setCategories(JSON.parse(value));
            else setCategories(["Playgrounds Completos", "Little Play", "Brinquedos Avulsos", "Linha Pet", "Mobiliário Urbano e Jardim"]);
        } catch {
            setCategories([]);
        }
    }, [value]);

    const handleAdd = () => {
        if (newCat.trim() && !categories.includes(newCat.trim())) {
            const updated = [...categories, newCat.trim()];
            setCategories(updated);
            onChange(JSON.stringify(updated));
            setNewCat('');
        }
    };

    const handleRemove = (cat: string) => {
        const updated = categories.filter(c => c !== cat);
        setCategories(updated);
        onChange(JSON.stringify(updated));
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Nova categoria..." 
                    className="flex-1 p-3 border rounded-lg text-sm" 
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button type="button" onClick={handleAdd} className="p-3 bg-krenke-blue text-white rounded-lg font-bold text-sm">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-100 border px-3 py-2 rounded-full text-sm font-bold text-gray-700">
                        {cat}
                        <button type="button" onClick={() => handleRemove(cat)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};



// --- Category Specs Configuration Component ---
const CategorySpecsConfig = ({ value, categories, onChange }: { value: string, categories: string[], onChange: (v: string) => void }) => {
    const [config, setConfig] = useState<Record<string, { mode: 'structured' | 'html', fields: string[] }>>({});

    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value);
                // Garantir que todas as categorias atuais existam no config
                const newConfig = { ...parsed };
                categories.forEach(cat => {
                    if (!newConfig[cat]) {
                        newConfig[cat] = { mode: 'html', fields: ALL_SPECS_FIELDS.map(f => f.id) };
                    }
                });
                setConfig(newConfig);
            } else {
                const initial: any = {};
                categories.forEach(cat => {
                    const isDefaultStructured = cat === 'Playgrounds Completos' || cat === 'Little Play';
                    initial[cat] = { 
                        mode: isDefaultStructured ? 'structured' : 'html', 
                        fields: ALL_SPECS_FIELDS.map(f => f.id) 
                    };
                });
                setConfig(initial);
            }
        } catch {
            setConfig({});
        }
    }, [value, categories]);

    const handleUpdate = (updated: any) => {
        setConfig(updated);
        onChange(JSON.stringify(updated));
    };

    const toggleMode = (cat: string) => {
        const updated = { ...config };
        updated[cat].mode = updated[cat].mode === 'structured' ? 'html' : 'structured';
        handleUpdate(updated);
    };

    const toggleField = (cat: string, fieldId: string) => {
        const updated = { ...config };
        const fields = updated[cat].fields || [];
        if (fields.includes(fieldId)) {
            updated[cat].fields = fields.filter(f => f !== fieldId);
        } else {
            updated[cat].fields = [...fields, fieldId];
        }
        handleUpdate(updated);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {categories.map(cat => (
                    <div key={cat} className="p-6 bg-gray-50 border rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${config[cat]?.mode === 'structured' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <h4 className="font-bold text-gray-900">{cat}</h4>
                            </div>
                            <button 
                                type="button"
                                onClick={() => toggleMode(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                                    config[cat]?.mode === 'structured' 
                                    ? 'bg-green-100 text-green-600 border border-green-200' 
                                    : 'bg-gray-200 text-gray-500 border border-gray-300'
                                }`}
                            >
                                {config[cat]?.mode === 'structured' ? 'Modo Estruturado' : 'Modo HTML'}
                            </button>
                        </div>

                        {config[cat]?.mode === 'structured' && (
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campos Visíveis:</p>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_SPECS_FIELDS.map(field => (
                                        <button
                                            key={field.id}
                                            type="button"
                                            onClick={() => toggleField(cat, field.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                config[cat].fields?.includes(field.id)
                                                ? 'bg-krenke-blue text-white border-krenke-blue'
                                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {field.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Settings View Component ---
const SettingsView = ({
    settings,
    onSave,
    saving,
    onSettingChange
}: {
    settings: any[],
    onSave: () => void,
    saving: boolean,
    onSettingChange: (key: string, value: string) => void
}) => (
    <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-krenke-blue flex items-center gap-3">
                <Settings className="text-krenke-orange" /> Configurações do Sistema
            </h1>
            <button
                onClick={onSave}
                disabled={saving}
                className="px-8 py-3 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
                {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                SALVAR ALTERAÇÕES
            </button>
        </div>

        <div className="bg-white rounded-[2rem] border shadow-sm p-8 md:p-12 space-y-10">
            {/* Webhook Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-orange-100 text-krenke-orange rounded-lg">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter">Integração Webhook (n8n)</h3>
                        <p className="text-xs text-gray-400">Configure para onde os dados dos formulários serão enviados</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase px-2">Webhook de Teste</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm"
                            value={settings.find(s => s.key === 'webhook_test_url')?.value || ''}
                            onChange={e => onSettingChange('webhook_test_url', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase px-2">Webhook de Produção</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm"
                            value={settings.find(s => s.key === 'webhook_prod_url')?.value || ''}
                            onChange={e => onSettingChange('webhook_prod_url', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase px-2">Modo Ativo</label>
                        <div className="flex gap-4">
                            {[
                                { id: 'test', label: 'Teste (Development)', color: 'bg-blue-500' },
                                { id: 'prod', label: 'Produção (Live)', color: 'bg-green-500' }
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => onSettingChange('webhook_mode', mode.id)}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between ${settings.find(s => s.key === 'webhook_mode')?.value === mode.id
                                        ? 'border-krenke-orange bg-orange-50 shadow-md'
                                        : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${mode.color}`} />
                                        <span className="font-bold text-gray-900">{mode.label}</span>
                                    </div>
                                    {settings.find(s => s.key === 'webhook_mode')?.value === mode.id && (
                                        <ShieldCheck size={20} className="text-krenke-orange" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 italic px-2 pt-2">
                            * O modo selecionado determina qual URL receberá as notificações do formulário de orçamento.
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Builder Section */}
            <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-blue-50 text-krenke-blue rounded-lg">
                        <LayoutTemplate size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter">Navegação e Menus</h3>
                        <p className="text-xs text-gray-400">Gerencie a estrutura de links do seu site</p>
                    </div>
                </div>
                
                <MenuBuilder 
                    value={settings.find(s => s.key === 'main_menu')?.value || '[]'} 
                    onChange={val => onSettingChange('main_menu', val)} 
                />
            </div>

            {/* Product Categories Section */}
            <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-purple-50 text-krenke-purple rounded-lg">
                        <Package size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter">Categorias de Produtos</h3>
                        <p className="text-xs text-gray-400">Gerencie as categorias que aparecem no menu de navegação e nas páginas vinculadas para seleção nos Produtos.</p>
                    </div>
                </div>
                
                <CategoryBuilder 
                    value={settings.find(s => s.key === 'product_categories')?.value || '[]'} 
                    onChange={val => onSettingChange('product_categories', val)} 
                />

                <div className="pt-8 border-t space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Sliders size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter">Modo de Especificações por Categoria</h3>
                            <p className="text-xs text-gray-400">Artesanalmente selecione quais categorias usam especificações técnicas estruturadas ou HTML personalizado.</p>
                        </div>
                    </div>
                    
                    <CategorySpecsConfig 
                        value={settings.find(s => s.key === 'category_specs_config')?.value || ''}
                        categories={JSON.parse(settings.find(s => s.key === 'product_categories')?.value || '["Playgrounds Completos", "Little Play", "Brinquedos Avulsos", "Linha Pet", "Mobiliário Urbano e Jardim"]')}
                        onChange={val => onSettingChange('category_specs_config', val)}
                    />
                </div>
            </div>
        </div>
    </div>
);

// --- Pages View Component ---
const PagesView = ({
    pages,
    onSelect,
    selected,
    form,
    setForm,
    onSave,
    onDelete,
    saving,
    onNew,
    onImageUpload
}: {
    pages: Page[],
    onSelect: (p: Page) => void,
    selected: Page | null,
    form: Partial<Page>,
    setForm: (f: any) => void,
    onSave: () => void,
    onDelete: () => void,
    saving: boolean,
    onNew: () => void,
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
        <div className="lg:col-span-4 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2 text-krenke-blue">
                        <LayoutTemplate size={20} className="text-krenke-orange" /> Páginas
                    </h2>
                    <button onClick={onNew} className="p-2 bg-krenke-orange text-white rounded-lg">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {pages.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onSelect(p)}
                        className={`w-full p-4 border-b text-left flex items-center gap-4 ${selected?.id === p.id ? 'bg-orange-50 border-l-4 border-l-krenke-orange' : ''}`}
                    >
                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                            {p.cover_image && <img src={p.cover_image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">{p.title}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{p.is_published ? 'Publicada' : 'Rascunho'}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm overflow-y-auto p-8 relative">
            {selected ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-6 z-10 border-b -mx-8 px-8">
                        <h2 className="text-2xl font-black text-krenke-blue">{selected.id ? 'Editar Página' : 'Nova Página'}</h2>
                        <div className="flex items-center gap-3">
                            {selected.id && (
                                <button onClick={onDelete} disabled={saving} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button onClick={onSave} disabled={saving} className="px-8 py-3 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                                {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                                SALVAR
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Título da Página</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-gray-50 border rounded-xl font-bold text-xl"
                                value={form.title || ''}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase">Slug (URL)</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm"
                                    value={form.slug || ''}
                                    placeholder="auto-gerado-se-vazio"
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase">Status</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border rounded-xl"
                                    value={form.is_published ? 'true' : 'false'}
                                    onChange={e => setForm({ ...form, is_published: e.target.value === 'true' })}
                                >
                                    <option value="false">Rascunho</option>
                                    <option value="true">Publicada</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Imagem de Capa (Opcional)</label>
                            <div className="border-2 border-dashed rounded-2xl aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                                {form.cover_image ? (
                                    <>
                                        <img src={form.cover_image} className="w-full h-full object-cover" />
                                        <label htmlFor="capa-pagina" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                            <Upload className="text-white" />
                                            <input id="capa-pagina" type="file" className="hidden" onChange={onImageUpload} />
                                        </label>
                                    </>
                                ) : (
                                    <label htmlFor="capa-pagina" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-gray-300 mb-2" size={40} />
                                        <span className="text-xs text-gray-400">Subir Imagem</span>
                                        <input id="capa-pagina" type="file" className="hidden" onChange={onImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <RichTextEditor label="Conteúdo da Página" value={form.content || ''} onChange={val => setForm({ ...form, content: val })} />
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <LayoutTemplate size={80} strokeWidth={1} />
                    <p className="mt-4 font-bold">Selecione uma página ou crie uma nova</p>
                </div>
            )}
        </div>
    </div>
);

// --- Main Page Component ---
const AdminPage: React.FC = () => {
    const location = useLocation();
    const activeView = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/produtos')) return 'produtos';
        if (path.includes('/paginas')) return 'paginas';
        if (path.includes('/blog')) return 'blog';
        if (path.includes('/leads')) return 'leads';
        if (path.includes('/candidaturas')) return 'candidaturas';
        if (path.includes('/vagas')) return 'vagas';
        if (path.includes('/usuarios')) return 'usuarios';
        if (path.includes('/scripts')) return 'scripts';
        if (path.includes('/configuracoes')) return 'configuracoes';
        if (path.includes('/perfil')) return 'perfil';
        return 'dashboard';
    }, [location.pathname]);
    const [products, setProducts] = useState<Product[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
    const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
    const [jobOpeningForm, setJobOpeningForm] = useState<Partial<JobOpening>>({ contract_types: [], is_active: true });
    const [editingOpening, setEditingOpening] = useState<JobOpening | null>(null);
    const navigate = useNavigate();
    const { user, profile, refreshProfile, role } = useAuth();

    useEffect(() => {
        if (role === 'hr' && activeView === 'dashboard') {
            navigate('/pgadmin/vagas', { replace: true });
        }
    }, [role, activeView]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<Partial<Profile>>({});
    const [scripts, setScripts] = useState<AppScript[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [siteSettings, setSiteSettings] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedScript, setSelectedScript] = useState<AppScript | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [postForm, setPostForm] = useState<Partial<Post>>({});
    const [scriptForm, setScriptForm] = useState<Partial<AppScript>>({});
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [pageForm, setPageForm] = useState<Partial<Page>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        // Double check session validity on mount to address security requirements (TC010)
        const checkSession = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login';
            }
        };
        checkSession();
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchProducts(),
            fetchLeads(),
            fetchPosts(),
            fetchProfiles(),
            fetchScripts(),
            fetchSettings(),
            fetchCurrentUserProfile(),
            fetchPages(),
            fetchJobOpenings(),
            fetchJobApplications(),
        ]);
        setLoading(false);
    };

    const fetchJobOpenings = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('job_openings').select('*').order('created_at', { ascending: false });
        setJobOpenings(data || []);
    };

    const fetchJobApplications = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('job_applications').select('*').order('submitted_at', { ascending: false });
        setJobApplications(data || []);
    };

    const deleteJobApplication = async (id: string) => {
        if (!confirm('Cancelar esta candidatura? A ação não pode ser desfeita.')) return;
        const { error } = await supabase.from('job_applications').delete().eq('id', id);
        if (error) { alert('Erro ao cancelar candidatura: ' + error.message); return; }
        setJobApplications(prev => prev.filter(a => a.id !== id));
    };

    const saveJobOpening = async () => {
        if (!supabase) return;
        const form = editingOpening ? { ...jobOpeningForm } : { ...jobOpeningForm };
        if (!form.title?.trim()) { alert('Informe o título da vaga.'); return; }
        if (editingOpening) {
            await supabase.from('job_openings').update(form).eq('id', editingOpening.id);
        } else {
            await supabase.from('job_openings').insert([form]);
        }
        setEditingOpening(null);
        setJobOpeningForm({ contract_types: [], is_active: true });
        fetchJobOpenings();
    };

    const deleteJobOpening = async (id: string) => {
        if (!supabase) return;
        if (!confirm('Excluir esta vaga? As candidaturas associadas não serão apagadas.')) return;
        await supabase.from('job_openings').delete().eq('id', id);
        fetchJobOpenings();
    };

    const toggleJobOpening = async (opening: JobOpening) => {
        if (!supabase) return;
        await supabase.from('job_openings').update({ is_active: !opening.is_active }).eq('id', opening.id);
        fetchJobOpenings();
    };

    const fetchProfiles = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.rpc('get_users_with_auth');
            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        }
    };

    const handleCreateUser = async (data: { full_name: string; email: string; phone: string; role: string }) => {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert('Sessão expirada. Faça login novamente.'); return; }

        const res = await fetch('/api/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) { alert('Erro ao criar usuário: ' + json.error); return; }
        alert('Convite enviado para ' + data.email + '! O usuário receberá um e-mail para definir a própria senha.');
        fetchProfiles();
    };

    const handleResendInvite = async (email: string) => {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert('Sessão expirada.'); return; }
        const res = await fetch('/api/resend-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ email }),
        });
        const json = await res.json();
        if (!res.ok) { alert('Erro ao enviar convite: ' + json.error); return; }
        alert('Convite reenviado para ' + email + '!');
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (!supabase) return;
        if (!confirm(`Excluir o usuário ${email}? Esta ação não pode ser desfeita.`)) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert('Sessão expirada.'); return; }
        const res = await fetch('/api/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ userId: id }),
        });
        const json = await res.json();
        if (!res.ok) { alert('Erro ao excluir usuário: ' + json.error); return; }
        alert('Usuário excluído.');
        fetchProfiles();
    };

    const updateUserRole = async (id: string, role: 'super' | 'restricted' | 'reseller' | 'hr') => {
        if (!supabase) return;
        const roleLabel = role === 'super' ? 'Super Admin' : role === 'reseller' ? 'Revendedor' : 'Acesso Restrito';
        if (!confirm(`Deseja alterar o nível de acesso deste usuário para ${roleLabel}?`)) return;

        try {
            const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
            if (error) throw error;
            alert('Permissão atualizada com sucesso!');
            fetchProfiles();
        } catch (err: any) {
            alert('Erro ao atualizar permissão: ' + err.message);
        }
    };

    const fetchLeads = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        }
    };

    const fetchPosts = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const fetchPages = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPages(data || []);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
    };

    const fetchScripts = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('app_scripts').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setScripts(data || []);
        } catch (err) {
            console.error('Error fetching scripts:', err);
        }
    };

    const fetchSettings = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            setSiteSettings(data || []);
        } catch (err) {
            console.error('Error fetching settings:', err);
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

    // Keep editing state in sync with fresh profile updates from context if needed
    useEffect(() => {
        if (profile && !currentUserProfile.id) {
            setCurrentUserProfile(profile);
        }
    }, [profile, currentUserProfile.id]);

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

    const handleSaveSettings = async () => {
        if (!supabase) return;
        setSaving(true);
        try {
            // Upsert all settings
            const { error } = await supabase.from('site_settings').upsert(siteSettings);
            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        setFilteredProducts(
            products.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.id?.toLowerCase().includes(term) ||
                p.category?.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('products').select('*').order('name');
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const scanStorageForImages = async (productId: string) => {
        if (!productId) return null;
        setScanning(true);
        try {
            const folder = productId.toLowerCase();
            const { data: files, error } = await supabase.storage.from('products').list(folder);
            if (error || !files || files.length === 0) return null;

            const imageFiles = files.filter(f => f.name.match(/\.(webp|jpg|jpeg|png|gif)$/i));
            if (imageFiles.length === 0) return null;

            const urls = imageFiles.map(file =>
                supabase.storage.from('products').getPublicUrl(`${folder}/${file.name}`).data.publicUrl
            );

            const mainImage = urls.find(url =>
                url.toLowerCase().includes('perspectiva') ||
                url.toLowerCase().includes('capa') ||
                url.toLowerCase().includes('principal')
            ) || urls[0];

            return { main: mainImage, gallery: urls };
        } catch (err) {
            return null;
        } finally {
            setScanning(false);
        }
    };

    // Variável para rastrear a última seleção iniciada e evitar condições de corrida em operações assíncronas
    const lastSelectedId = React.useRef<string | null>(null);

    const handleSelectProduct = async (p: Product) => {
        lastSelectedId.current = p.id;
        console.log(`Produto selecionado: ${p.name} (${p.id})`);
        
        setSelectedProduct(p);
        setEditForm({ ...p });

        // Só busca no storage automaticamente se o produto não tiver NENHUMA imagem definida no banco
        // e se não for um produto que acabamos de "limpar" manualmente (Novo Produto)
        if (!p.image && (!p.images || p.images.length === 0) && p.id && p.id !== '') {
            console.log(`Buscando imagens no storage para ${p.id}...`);
            const assets = await scanStorageForImages(p.id);
            
            // Verifica se este ainda é o produto selecionado antes de atualizar o estado
            if (assets && lastSelectedId.current === p.id) {
                console.log("Assets encontrados e sincronizados:", p.id);
                setEditForm(prev => {
                    // Verificação dupla dentro do setState
                    if (prev.id !== p.id) return prev;
                    return {
                        ...prev,
                        image: assets.main,
                        images: assets.gallery
                    };
                });
            }
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct?.id) return;
        if (!confirm('Tem certeza que deseja excluir este produto permanentemente?')) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', selectedProduct.id);

            if (error) throw error;

            alert('Produto excluído com sucesso!');
            setSelectedProduct(null);
            fetchProducts();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!editForm.id || !editForm.name) return alert('ID e Nome são obrigatórios.');

        setSaving(true);
        try {
            // Limpa o HTML das especificações para remover &nbsp; e melhorar a estrutura no banco
            const specs = editForm.specs ?
                editForm.specs.replace(/&nbsp;/g, ' ').replace(/></g, '>\n<').replace(/\n\s*\n/g, '\n').trim() :
                '';

            // Generate slug if not present or as a safeguard
            const slug = editForm.slug || (editForm.name ? slugify(editForm.name) : '');
            const productToSave = { ...editForm, specs, slug };

            const isRename = selectedProduct?.id && selectedProduct.id !== '' && selectedProduct.id !== editForm.id;

            if (isRename) {
                console.log(`Iniciando renomeação do ID: ${selectedProduct.id} para ${editForm.id}`);
                
                // 1. Verifica se o NOVO ID já existe
                const { data: existing } = await supabase
                    .from('products')
                    .select('id')
                    .eq('id', editForm.id)
                    .maybeSingle();

                if (existing) {
                    throw new Error(`O código "${editForm.id}" já está em uso por outro produto.`);
                }

                // 2. Insere o novo produto
                const { error: insertError } = await supabase.from('products').insert(productToSave);
                if (insertError) throw insertError;

                // 3. Remove o antigo
                const { error: deleteError } = await supabase.from('products').delete().eq('id', selectedProduct.id);
                if (deleteError) throw deleteError;
                
                console.log("Renomeação concluída com sucesso");
            } else {
                // Caso normal (novo produto ou mesmo ID): verificamos a existência antes para ser mais explícito
                const { data: existing } = await supabase
                    .from('products')
                    .select('id')
                    .eq('id', editForm.id)
                    .maybeSingle();

                if (existing && (!selectedProduct || selectedProduct.id === '')) {
                     // Caso seja um NOVO produto tentando usar um ID existente
                     throw new Error(`O código "${editForm.id}" já existe. Use outro código ou edite o produto existente.`);
                }

                console.log("Realizando upsert do produto...");
                const { error } = await supabase.from('products').upsert(productToSave);
                if (error) throw error;
            }

            alert('Produto salvo com sucesso!');
            await fetchProducts();
            setSelectedProduct(productToSave as Product);
        } catch (err: any) {
            console.error("Erro detalhado ao salvar produto:", err);
            alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido de banco de dados'));
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'gallery') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        console.log(`Iniciando upload de ${field}:`, files.length, "arquivos");
        const folder = editForm.id?.toLowerCase().replace(/\s+/g, '-') || 'temp';

        setSaving(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Compress image before upload
                const config = field === 'image' ? IMAGE_CONFIGS.PRODUCT_MAIN : IMAGE_CONFIGS.PRODUCT_GALLERY;
                const optimizedFile = await compressImage(file, config);
                const optimizedFileExt = optimizedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${i}.${optimizedFileExt}`;

                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(`${folder}/${fileName}`, optimizedFile, { cacheControl: '31536000', upsert: false });

                if (error) throw error;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);

                    if (field === 'image') {
                        setEditForm(prev => ({ ...prev, image: publicUrl }));
                        setSelectedProduct(prev => prev ? ({ ...prev, image: publicUrl }) : null);
                    } else {
                        const updater = (prev: any) => ({
                            ...prev,
                            images: [...(prev.images || []), publicUrl]
                        });
                        setEditForm(updater);
                        setSelectedProduct(prev => prev ? (updater(prev) as Product) : null);
                    }
                }
            }
        } catch (err: any) {
            console.error("Erro no upload de produtos:", err);
            alert(`Erro no upload: ` + err.message);
        } finally {
            setSaving(false);
            if (e.target) e.target.value = '';
        }
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    const handleSavePage = async () => {
        if (!pageForm.title) return alert('O título é obrigatório.');
        setSaving(true);
        const slug = pageForm.slug || slugify(pageForm.title);
        const content = pageForm.content ?
            pageForm.content.replace(/&nbsp;/g, ' ').replace(/></g, '>\n<').replace(/\n\s*\n/g, '\n').trim() : '';

        const pageData = { ...pageForm, slug, content, updated_at: new Date().toISOString() };

        try {
            if (!supabase) throw new Error('Supabase nao conectado');
            const { error } = await supabase.from('pages').upsert(pageData);
            if (error) throw error;
            alert('Página salva com sucesso!');
            fetchPages();
            setSelectedPage(pageData as Page);
        } catch (err: any) {
            alert('Erro ao salvar página: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePage = async () => {
        if (!selectedPage?.id) return;
        if (!confirm('Excluir esta página permanentemente?')) return;
        setSaving(true);
        try {
            if (!supabase) throw new Error('Supabase nao conectado');
            const { error } = await supabase.from('pages').delete().eq('id', selectedPage.id);
            if (error) throw error;
            alert('Página excluída!');
            setSelectedPage(null);
            fetchPages();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            if (!supabase) throw new Error('Supabase nao conectado');
            
            // Compress image before upload
            const optimizedFile = await compressImage(file, IMAGE_CONFIGS.PAGE_COVER);
            const optimizedFileExt = optimizedFile.name.split('.').pop();
            const fileName = `page-${Date.now()}.${optimizedFileExt}`;

            const { data, error } = await supabase.storage
                .from('public')
                .upload(`pages/${fileName}`, optimizedFile, { cacheControl: '31536000', upsert: false });

            if (error) throw error;

            if (data) {
                const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(data.path);
                setPageForm(prev => ({ ...prev, cover_image: publicUrl }));
            }
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setSaving(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSavePost = async () => {
        if (!postForm.title || !postForm.content) return alert('Título e Conteúdo são obrigatórios.');

        setSaving(true);
        const slug = postForm.slug || slugify(postForm.title);

        // Limpa o HTML do conteúdo para remover &nbsp; e melhorar a estrutura no banco
        const content = postForm.content ?
            postForm.content.replace(/&nbsp;/g, ' ').replace(/></g, '>\n<').replace(/\n\s*\n/g, '\n').trim() :
            '';

        const postData = { ...postForm, slug, content };

        try {
            const { error } = await supabase.from('posts').upsert(postData);
            if (error) throw error;
            alert('Post salvo com sucesso!');
            fetchPosts();
            setSelectedPost(postData as Post);
        } catch (err: any) {
            alert('Erro ao salvar post: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost?.id) return;
        if (!confirm('Excluir este artigo?')) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('posts').delete().eq('id', selectedPost.id);
            if (error) throw error;
            alert('Artigo excluído!');
            setSelectedPost(null);
            fetchPosts();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Iniciando upload de capa do blog:", file.name);
        setSaving(true);

        try {
            // Compress image before upload
            const optimizedFile = await compressImage(file, IMAGE_CONFIGS.BLOG_COVER);
            const optimizedFileExt = optimizedFile.name.split('.').pop();
            const fileName = `blog-${Date.now()}.${optimizedFileExt}`;

            const { data, error } = await supabase.storage
                .from('blog')
                .upload(fileName, optimizedFile, { cacheControl: '31536000', upsert: false });

            if (error) throw error;

            if (data) {
                const { data: { publicUrl } } = supabase.storage.from('blog').getPublicUrl(data.path);
                console.log("Capa do blog subida com sucesso:", publicUrl);
                setPostForm(prev => ({ ...prev, cover_image: publicUrl }));
            }
        } catch (err: any) {
            console.error("Erro no upload do blog:", err);
            alert('Erro no upload: ' + err.message);
        } finally {
            setSaving(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSaveScript = async () => {
        if (!scriptForm.title || !scriptForm.content) return alert('Título e Conteúdo são obrigatórios.');
        setSaving(true);
        try {
            const { error } = await supabase.from('app_scripts').upsert({
                ...scriptForm,
                is_active: scriptForm.is_active ?? true,
                placement: scriptForm.placement || 'head'
            });
            if (error) throw error;
            alert('Script salvo com sucesso!');
            fetchScripts();
            setSelectedScript(null);
        } catch (err: any) {
            alert('Erro ao salvar script: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteScript = async () => {
        if (!selectedScript?.id) return;
        if (!confirm('Excluir este script permanentemente?')) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('app_scripts').delete().eq('id', selectedScript.id);
            if (error) throw error;
            alert('Script excluído!');
            setSelectedScript(null);
            fetchScripts();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!supabase) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                    <div className="bg-red-500/10 p-10 rounded-[3rem] border border-red-100 max-w-xl">
                        <ShieldCheck size={80} className="text-red-500 mx-auto mb-8" />
                        <h2 className="text-3xl font-black text-red-600 mb-4">SUPABASE NÃO CONFIGURADO</h2>
                        <p className="text-gray-500 font-medium italic mb-8">
                            As chaves de acesso ao Supabase (URL e Anon Key) não foram encontradas no arquivo .env.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-krenke-purple text-white font-black rounded-2xl hover:bg-orange-600 transition-all flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={20} /> Tentar Novamente
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {activeView === 'dashboard' && (
                        <DashboardView stats={{
                            totalProducts: products.length,
                            totalLeads: leads.length,
                            totalPosts: posts.length,
                            totalUsers: profiles.length,
                            recentLeads: leads.slice(0, 5),
                            recentPosts: posts.slice(0, 5)
                        }} />
                    )}
                    {activeView === 'usuarios' && (
                        <UsersView users={profiles} onUpdateRole={updateUserRole} onCreateUser={handleCreateUser} onResendInvite={handleResendInvite} onDeleteUser={handleDeleteUser} />
                    )}
                    {activeView === 'scripts' && (
                        <ScriptsView
                            scripts={scripts}
                            selected={selectedScript}
                            onSelect={(s) => { setSelectedScript(s); setScriptForm(s); }}
                            form={scriptForm}
                            setForm={setScriptForm}
                            onSave={handleSaveScript}
                            onDelete={handleDeleteScript}
                            saving={saving}
                            onNew={() => {
                                setSelectedScript({ id: '', title: 'Novo Script', content: '', placement: 'head', is_active: true });
                                setScriptForm({ title: '', content: '', placement: 'head', is_active: true });
                            }}
                        />
                    )}
                    {activeView === 'perfil' && (
                        <ProfileView
                            profile={currentUserProfile}
                            saving={saving}
                            onSave={handleSaveProfile}
                            onProfileChange={updates => setCurrentUserProfile(prev => ({ ...prev, ...updates }))}
                            onImageUpload={handleAvatarUpload}
                        />
                    )}
                    {activeView === 'configuracoes' && (
                        <SettingsView
                            settings={siteSettings}
                            saving={saving}
                            onSave={handleSaveSettings}
                            onSettingChange={(key, value) => {
                                setSiteSettings(prev => {
                                    const exists = prev.find(s => s.key === key);
                                    if (exists) {
                                        return prev.map(s => s.key === key ? { ...s, value } : s);
                                    }
                                    return [...prev, { key, value }];
                                });
                            }}
                        />
                    )}
                    {activeView === 'produtos' && (
                        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
                            <div className="lg:col-span-4 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
                                <div className="p-4 border-b space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold flex items-center gap-2 text-krenke-blue"><Package size={20} className="text-krenke-orange" /> Produtos</h2>
                                        <button onClick={() => handleSelectProduct({ id: '', name: 'Novo Produto', slug: '', category: '', image: '', description: '', specs: '', images: [] })} className="p-2 bg-krenke-orange text-white rounded-lg"><Plus size={18} /></button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? <div className="p-8 text-center text-gray-400">Carregando...</div> : filteredProducts.map(p => (
                                        <button key={p.id} type="button" onClick={() => handleSelectProduct(p)} className={`w-full p-4 border-b text-left flex items-center gap-4 ${selectedProduct?.id === p.id ? 'bg-orange-50 border-l-4 border-l-krenke-orange' : ''}`}>
                                            <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">{p.image && <img src={p.image} className="w-full h-full object-cover" />}</div>
                                            <div className="flex-1 min-w-0"><p className="font-bold truncate">{p.name}</p><p className="text-[10px] text-gray-400">{p.id}</p></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm overflow-y-auto p-8 relative">
                                {selectedProduct ? (
                                    <ProductForm
                                        key={`${selectedProduct.id}-${selectedProduct.slug}-${selectedProduct.name}`} // Re-mount total em qualquer mudança principal
                                        product={selectedProduct}
                                        siteSettings={siteSettings}
                                        saving={saving}
                                        onSave={handleSaveProduct}
                                        onDelete={handleDeleteProduct}
                                        onFormChange={setEditForm}
                                        onImageUpload={handleImageUpload}
                                        scanStorage={scanStorageForImages}
                                        scanning={scanning}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                        <Package size={80} strokeWidth={1} />
                                        <p className="mt-4 font-bold">Selecione um produto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'blog' && (
                        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
                            <div className="lg:col-span-4 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
                                <div className="p-4 border-b space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold flex items-center gap-2 text-krenke-blue"><FileText size={20} className="text-krenke-orange" /> Artigos</h2>
                                        <button onClick={() => {
                                            setSelectedPost({ id: '', title: 'Novo Artigo', slug: '', content: '', excerpt: '', cover_image: '', author: 'Admin', published: false, created_at: new Date().toISOString() });
                                            setPostForm({ title: '', content: '', author: 'Admin', published: false });
                                        }} className="p-2 bg-krenke-orange text-white rounded-lg"><Plus size={18} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {posts.map(post => (
                                        <button key={post.id} onClick={() => { setSelectedPost(post); setPostForm(post); }} className={`w-full p-4 border-b text-left flex items-center gap-4 ${selectedPost?.id === post.id ? 'bg-orange-50 border-l-4 border-l-krenke-orange' : ''}`}>
                                            <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">{post.cover_image && <img src={post.cover_image} className="w-full h-full object-cover" />}</div>
                                            <div className="flex-1 min-w-0"><p className="font-bold truncate">{post.title}</p><p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm overflow-y-auto p-8 relative">
                                {selectedPost ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-6 z-10 border-b -mx-8 px-8">
                                            <h2 className="text-2xl font-black text-krenke-blue">{selectedPost.id ? 'Editar Artigo' : 'Novo Artigo'}</h2>
                                            <div className="flex items-center gap-3">
                                                <button onClick={handleDeletePost} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>
                                                <button onClick={handleSavePost} disabled={saving} className="px-8 py-3 bg-krenke-orange text-white font-black rounded-xl flex items-center gap-2">
                                                    {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />} SALVAR
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Título</label>
                                                <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-bold text-xl" value={postForm.title || ''} onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase">Slug (URL)</label>
                                                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm" value={postForm.slug || ''} placeholder="auto-gerado-se-vazio" onChange={e => setPostForm({ ...postForm, slug: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase">Status</label>
                                                    <select className="w-full p-4 bg-gray-50 border rounded-xl" value={postForm.published ? 'true' : 'false'} onChange={e => setPostForm({ ...postForm, published: e.target.value === 'true' })}>
                                                        <option value="false">Rascunho</option>
                                                        <option value="true">Publicado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Imagem de Capa</label>
                                                <div className="border-2 border-dashed rounded-2xl aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                                                    {postForm.cover_image ? (
                                                        <>
                                                            <img src={postForm.cover_image} className="w-full h-full object-cover" />
                                                            <label htmlFor="capa-blog" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                                <Upload className="text-white" />
                                                                <input id="capa-blog" type="file" className="hidden" onChange={handleBlogImageUpload} />
                                                            </label>
                                                        </>
                                                    ) : (
                                                        <label htmlFor="capa-blog" className="cursor-pointer flex flex-col items-center">
                                                            <Upload className="text-gray-300 mb-2" size={40} />
                                                            <span className="text-xs text-gray-400">Subir Imagem</span>
                                                            <input id="capa-blog" type="file" className="hidden" onChange={handleBlogImageUpload} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Resumo (Excerpt)</label>
                                                <textarea rows={3} className="w-full p-4 bg-gray-50 border rounded-xl" value={postForm.excerpt || ''} onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })} />
                                            </div>

                                            <RichTextEditor label="Conteúdo do Artigo" value={postForm.content || ''} onChange={val => setPostForm({ ...postForm, content: val })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                        <FileText size={80} strokeWidth={1} />
                                        <p className="mt-4 font-bold">Selecione um artigo ou crie um novo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeView === 'paginas' && (
                        <PagesView
                            pages={pages}
                            onSelect={(p) => {
                                setSelectedPage(p);
                                setPageForm({ ...p });
                            }}
                            selected={selectedPage}
                            form={pageForm}
                            setForm={setPageForm}
                            onSave={handleSavePage}
                            onDelete={handleDeletePage}
                            saving={saving}
                            onNew={() => {
                                setSelectedPage({ id: '', title: '', slug: '', content: '', is_published: false } as any);
                                setPageForm({ title: '', slug: '', content: '', is_published: false });
                            }}
                            onImageUpload={handlePageImageUpload}
                        />
                    )}

                    {activeView === 'leads' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-black text-krenke-blue">Orçamentos Recebidos</h1>
                                <button onClick={fetchLeads} className="p-2 text-gray-400 hover:text-krenke-orange transition-colors"><RefreshCw size={20} /></button>
                            </div>

                            <div className="grid gap-6">
                                {leads.map(lead => (
                                    <div key={lead.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <h3 className="font-black text-krenke-blue text-lg flex items-center gap-2">
                                                    <Users size={18} className="text-krenke-orange" /> {lead.name}
                                                </h3>
                                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-krenke-orange"><Mail size={14} /> {lead.email}</a>
                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-krenke-orange"><Phone size={14} /> {lead.phone}</a>
                                                    <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(lead.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Produtos de Interesse</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lead.products?.map((p, i) => (
                                                            <span key={i} className="px-3 py-1 bg-orange-50 text-krenke-orange border border-orange-100 rounded-full text-xs font-bold">{p}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Mensagem</label>
                                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm border italic">"{lead.message || 'Sem mensagem'}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {leads.length === 0 && <div className="text-center py-20 text-gray-400 italic">Nenhum orçamento recebido ainda.</div>}
                            </div>
                        </div>
                    )}

                    {/* --- Vagas (Job Openings CMS) --- */}
                    {activeView === 'vagas' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-black text-krenke-blue">Vagas — Trabalhe Conosco</h1>
                                <button onClick={fetchJobOpenings} className="p-2 text-gray-400 hover:text-krenke-orange transition-colors"><RefreshCw size={20} /></button>
                            </div>

                            {/* Form */}
                            <div className="bg-white rounded-2xl border shadow-sm p-8">
                                <h2 className="font-black text-krenke-blue text-lg mb-6">{editingOpening ? 'Editar Vaga' : 'Nova Vaga'}</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Título *</label>
                                        <input
                                            type="text"
                                            value={jobOpeningForm.title || ''}
                                            onChange={e => setJobOpeningForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="Ex: Vendedor Externo"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krenke-orange outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Departamento</label>
                                        <input
                                            type="text"
                                            value={jobOpeningForm.department || ''}
                                            onChange={e => setJobOpeningForm(f => ({ ...f, department: e.target.value }))}
                                            placeholder="Ex: Comercial"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krenke-orange outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Localização</label>
                                        <input
                                            type="text"
                                            value={jobOpeningForm.location || ''}
                                            onChange={e => setJobOpeningForm(f => ({ ...f, location: e.target.value }))}
                                            placeholder="Ex: Guaramirim, SC (Remoto)"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krenke-orange outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Tipos de Contrato *</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['CLT', 'PJ', 'Estágio', 'Freelancer/Temporário', 'Banco de Talentos'].map(ct => {
                                            const checked = (jobOpeningForm.contract_types || []).includes(ct);
                                            return (
                                                <label key={ct} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${checked ? 'border-krenke-orange bg-orange-50 text-krenke-orange' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => setJobOpeningForm(f => {
                                                            const cur = f.contract_types || [];
                                                            return { ...f, contract_types: checked ? cur.filter(t => t !== ct) : [...cur, ct] };
                                                        })}
                                                        className="sr-only"
                                                    />
                                                    {checked && <Check size={14} />}
                                                    {ct}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Descrição</label>
                                    <textarea
                                        value={jobOpeningForm.description || ''}
                                        onChange={e => setJobOpeningForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Descreva a vaga, responsabilidades e benefícios..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krenke-orange outline-none text-sm font-medium resize-none"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Requisitos</label>
                                    <textarea
                                        value={jobOpeningForm.requirements || ''}
                                        onChange={e => setJobOpeningForm(f => ({ ...f, requirements: e.target.value }))}
                                        placeholder="Liste os requisitos e diferenciais..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krenke-orange outline-none text-sm font-medium resize-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={jobOpeningForm.is_active ?? true}
                                            onChange={e => setJobOpeningForm(f => ({ ...f, is_active: e.target.checked }))}
                                            className="w-5 h-5 accent-krenke-orange"
                                        />
                                        <span className="text-sm font-bold text-gray-600">Vaga ativa (visível no site)</span>
                                    </label>
                                    <div className="flex gap-3">
                                        {editingOpening && (
                                            <button
                                                onClick={() => { setEditingOpening(null); setJobOpeningForm({ contract_types: [], is_active: true }); }}
                                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button
                                            onClick={saveJobOpening}
                                            className="px-8 py-2.5 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 flex items-center gap-2 text-sm"
                                        >
                                            <Save size={16} /> {editingOpening ? 'Salvar Alterações' : 'Criar Vaga'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {jobOpenings.map(o => (
                                    <div key={o.id} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-black text-krenke-blue">{o.title}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${o.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {o.is_active ? 'Ativa' : 'Inativa'}
                                                </span>
                                                {(o.contract_types || []).map(ct => (
                                                    <span key={ct} className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{ct}</span>
                                                ))}
                                                {o.application_count > 0 && (
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-50 text-krenke-orange">{o.application_count} candidatura{o.application_count !== 1 ? 's' : ''}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">{[o.department, o.location].filter(Boolean).join(' · ')}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => toggleJobOpening(o)}
                                                title={o.is_active ? 'Desativar' : 'Ativar'}
                                                className={`p-2 rounded-lg transition-colors ${o.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                {o.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            </button>
                                            <button
                                                onClick={() => { setEditingOpening(o); setJobOpeningForm({ ...o }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className="p-2 rounded-lg text-krenke-blue hover:bg-blue-50 transition-colors"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteJobOpening(o.id)}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {jobOpenings.length === 0 && (
                                    <div className="text-center py-16 text-gray-400 italic">Nenhuma vaga cadastrada. Crie a primeira acima.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- Candidaturas (Job Applications) --- */}
                    {activeView === 'candidaturas' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-black text-krenke-blue">Candidaturas Recebidas</h1>
                                <button onClick={fetchJobApplications} className="p-2 text-gray-400 hover:text-krenke-orange transition-colors"><RefreshCw size={20} /></button>
                            </div>

                            <div className="grid gap-4">
                                {jobApplications.map(app => {
                                    const opening = jobOpenings.find(o => o.id === app.opening_id);
                                    return (
                                        <div key={app.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="font-black text-krenke-blue text-lg flex items-center gap-2">
                                                        <Users size={18} className="text-krenke-orange" /> {app.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                                                        <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-krenke-orange"><Mail size={13} /> {app.email}</a>
                                                        <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-krenke-orange"><Phone size={13} /> {app.phone}</a>
                                                        <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={13} /> {new Date(app.submitted_at).toLocaleString('pt-BR')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 shrink-0">
                                                    <a
                                                        href={`https://wa.me/${app.phone?.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-black rounded-xl hover:bg-[#1ebe5a] transition-colors"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                        Falar com candidato
                                                    </a>
                                                    {app.cv_url && (
                                                        <a
                                                            href={app.cv_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-krenke-blue text-white text-xs font-black rounded-xl hover:bg-[#241f6b] transition-colors"
                                                        >
                                                            <FileText size={14} /> Baixar Currículo PDF
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => deleteJobApplication(app.id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 text-xs font-black rounded-xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Cancelar candidatura
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-xs font-bold">{app.city} — {app.state}</span>
                                                {opening && (
                                                    <span className="px-3 py-1 bg-orange-50 text-krenke-orange border border-orange-100 rounded-full text-xs font-bold">{opening.title}</span>
                                                )}
                                                {!opening && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-bold">Candidatura Espontânea</span>
                                                )}
                                                {app.education && (
                                                    <span className="px-3 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-full text-xs font-bold">{app.education}</span>
                                                )}
                                                {app.salary_expectation && (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-xs font-bold">💰 {app.salary_expectation}</span>
                                                )}
                                            </div>

                                            {/* Resume fields */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {app.experience && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Experiência</label>
                                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm border leading-relaxed">{app.experience}</p>
                                                    </div>
                                                )}
                                                {app.motivation && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Por que a Krenke?</label>
                                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm border leading-relaxed italic">"{app.motivation}"</p>
                                                    </div>
                                                )}
                                                {app.message && (
                                                    <div className="md:col-span-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Mensagem adicional</label>
                                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm border">{app.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {jobApplications.length === 0 && (
                                    <div className="text-center py-20 text-gray-400 italic">Nenhuma candidatura recebida ainda.</div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminPage;
