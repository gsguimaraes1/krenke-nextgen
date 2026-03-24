import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, AppScript } from '../types';
import AdminLayout from '../components/AdminLayout';
import RichTextEditor from '../components/RichTextEditor';
import ProductSpecsManager from '../components/ProductSpecsManager';
import { useAuth } from '../context/AuthContext';
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
    CheckCircle2
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

interface Profile {
    id: string;
    email: string;
    role: 'super' | 'restricted';
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
}

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
const UsersView = ({ users, onUpdateRole }: { users: Profile[], onUpdateRole: (id: string, role: 'super' | 'restricted') => void }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-krenke-blue">Gestão de Usuários</h1>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Usuário</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Nível de Acesso</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Data de Cadastro</th>
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg ${u.role === 'super' ? 'bg-krenke-orange' : 'bg-krenke-blue'}`}>
                                            {u.email[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{u.full_name || 'Usuário Krenke'}</span>
                                        {u.role === 'restricted' && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Aguardando Autorização</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-600">{u.email}</td>
                            <td className="px-6 py-4">
                                <select
                                    value={u.role}
                                    onChange={(e) => onUpdateRole(u.id, e.target.value as any)}
                                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-krenke-orange/20 cursor-pointer ${u.role === 'super' ? 'bg-orange-100 text-krenke-orange' : 'bg-blue-100 text-krenke-blue'}`}
                                >
                                    <option value="super">Super Admin</option>
                                    <option value="restricted">Acesso Restrito</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

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
        </div>
    </div>
);

// --- Main Page Component ---
const AdminPage: React.FC = () => {
    const location = useLocation();
    const [activeView, setActiveView] = useState('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const { user, profile, refreshProfile } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<Partial<Profile>>({});
    const [scripts, setScripts] = useState<AppScript[]>([]);
    const [siteSettings, setSiteSettings] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedScript, setSelectedScript] = useState<AppScript | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [postForm, setPostForm] = useState<Partial<Post>>({});
    const [scriptForm, setScriptForm] = useState<Partial<AppScript>>({});
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
            fetchCurrentUserProfile()
        ]);
        setLoading(false);
    };

    const fetchProfiles = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        }
    };

    const updateUserRole = async (id: string, role: 'super' | 'restricted') => {
        if (!supabase) return;
        if (!confirm(`Deseja alterar o nível de acesso deste usuário para ${role === 'super' ? 'Super Admin' : 'Acesso Restrito'}?`)) return;

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
                    avatar_url: currentUserProfile.avatar_url
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
        if (!e.target.files || e.target.files.length === 0 || !supabase || !user) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        setSaving(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('public')
                .upload(filePath, file);

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
        const path = location.pathname;
        if (path.endsWith('/produtos')) setActiveView('produtos');
        else if (path.endsWith('/blog')) setActiveView('blog');
        else if (path.endsWith('/leads')) setActiveView('leads');
        else if (path.endsWith('/usuarios')) setActiveView('usuarios');
        else if (path.endsWith('/scripts')) setActiveView('scripts');
        else if (path.endsWith('/configuracoes')) setActiveView('configuracoes');
        else if (path.endsWith('/perfil')) setActiveView('perfil');
        else setActiveView('dashboard');
    }, [location]);

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

    const handleSelectProduct = async (p: Product) => {
        setSelectedProduct(p);
        setEditForm({ ...p });

        // Só busca no storage automaticamente se o produto não tiver NENHUMA imagem definida no banco
        // e se não for um produto que acabamos de "limpar" manualmente
        if (!p.image && (!p.images || p.images.length === 0) && p.id) {
            const assets = await scanStorageForImages(p.id);
            if (assets) {
                setEditForm(prev => ({
                    ...prev,
                    image: assets.main,
                    images: assets.gallery
                }));
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

            // Se o ID original existia e é diferente do novo ID, usamos UPDATE filtrando pelo ID antigo
            if (selectedProduct?.id && selectedProduct.id !== '' && selectedProduct.id !== editForm.id) {
                const { error } = await supabase
                    .from('products')
                    .update(productToSave)
                    .eq('id', selectedProduct.id);
                if (error) throw error;
            } else {
                // Caso contrário (novo produto ou mesmo ID), usamos UPSERT padrão
                const { error } = await supabase.from('products').upsert(productToSave);
                if (error) throw error;
            }

            alert('Produto salvo com sucesso!');
            await fetchProducts();
            setSelectedProduct(productToSave as Product);
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
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
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${i}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(`${folder}/${fileName}`, file, { cacheControl: '3600', upsert: false });

                if (error) throw error;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);

                    if (field === 'image') {
                        setEditForm(prev => ({ ...prev, image: publicUrl }));
                    } else {
                        setEditForm(prev => ({
                            ...prev,
                            images: [...(prev.images || []), publicUrl]
                        }));
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

        const fileExt = file.name.split('.').pop();
        const fileName = `blog-${Date.now()}.${fileExt}`;

        try {
            const { data, error } = await supabase.storage
                .from('blog')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

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
                        <UsersView users={profiles} onUpdateRole={updateUserRole} />
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
                                    <form key={selectedProduct.id} className="space-y-8" onSubmit={e => { e.preventDefault(); handleSaveProduct(); }}>
                                        <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-6 z-10 border-b -mx-8 px-8">
                                            <div>
                                                <h2 className="text-2xl font-black text-krenke-blue">{selectedProduct.id ? 'Editar Produto' : 'Novo Produto'}</h2>
                                                {scanning && <span className="text-xs text-krenke-orange animate-pulse">Escaneando Storage...</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={handleDeleteProduct} disabled={saving || !selectedProduct.id} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Excluir Produto">
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
                                                <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-mono" value={editForm.id || ''} onChange={e => setEditForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Nome</label>
                                                <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl font-bold" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Slug (URL)</label>
                                                <input type="text" placeholder="auto-gerado" className="w-full p-4 bg-gray-50 border rounded-xl font-mono text-sm" value={editForm.slug || ''} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Categoria</label>
                                                <select className="w-full p-4 bg-gray-50 border rounded-xl" value={editForm.category || ''} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                                                    <option value="">Selecione...</option>
                                                    <option value="Playgrounds Completos">Playgrounds Completos</option>
                                                    <option value="Little Play">Little Play</option>
                                                    <option value="Brinquedos Avulsos">Brinquedos Avulsos</option>
                                                    <option value="Linha Pet">Linha Pet</option>
                                                    <option value="Mobiliário Urbano e Jardim">Mobiliário Urbano e Jardim</option>
                                                    <option value="LINHA TEMÁTICA">Linha Temática</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase">Capa</label>
                                                <div className="border-2 border-dashed rounded-2xl aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                                                    {editForm.image ? (
                                                        <>
                                                            <img src={editForm.image} className="w-full h-full object-contain" />
                                                            <label htmlFor="capa-produto" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                                <Upload className="text-white" />
                                                                <input id="capa-produto" type="file" className="hidden" onChange={e => handleImageUpload(e, 'image')} />
                                                            </label>
                                                        </>
                                                    ) : (
                                                        <label htmlFor="capa-produto" className="cursor-pointer flex flex-col items-center">
                                                            <Upload className="text-gray-300 mb-2" size={40} />
                                                            <span className="text-xs text-gray-400">Subir Capa</span>
                                                            <input id="capa-produto" type="file" className="hidden" onChange={e => handleImageUpload(e, 'image')} />
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
                                                    <input type="file" className="hidden" multiple onChange={e => handleImageUpload(e, 'gallery')} />
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-xl border">
                                                {editForm.images?.map((img, i) => (
                                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setEditForm({ ...editForm, images: editForm.images?.filter(u => u !== img) })} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase">Descrição Curta</label>
                                            <textarea rows={3} className="w-full p-4 bg-gray-50 border rounded-xl" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                        </div>

                                        <ProductSpecsManager
                                            value={editForm.specs || ''}
                                            productDescription={editForm.description || ''}
                                            onChange={val => setEditForm({ ...editForm, specs: val })}
                                        />
                                    </form>
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
                </motion.div>
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminPage;
