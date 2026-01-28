import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    BarChart3,
    Package,
    MessageSquare,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.png';
import { Users } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const { user, role, signOut } = useAuth();

    const menuItems = [
        { icon: BarChart3, label: 'Dashboard', path: '/pgadmin' },
        { icon: Package, label: 'Produtos', path: '/pgadmin/produtos' },
        { icon: MessageSquare, label: 'Blog', path: '/pgadmin/blog' },
        { icon: BarChart3, label: 'Orçamentos', path: '/pgadmin/leads' },
    ];

    // Adiciona menu de usuários apenas para Super Admin
    if (role === 'super') {
        menuItems.push({ icon: Users, label: 'Usuários', path: '/pgadmin/usuarios' });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-[#1E1B4B] text-white flex flex-col fixed h-full z-50 shadow-2xl"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <motion.img
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            src={logoBranco}
                            alt="Krenke Brinquedos"
                            className="h-8 object-contain"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-krenke-orange rounded-lg flex items-center justify-center font-black shadow-lg shadow-orange-500/20">K</div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                ${isActive ? 'bg-krenke-orange text-white shadow-lg shadow-orange-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}
              `}
                        >
                            <item.icon size={22} className="shrink-0" />
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {isSidebarOpen && (
                                <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-4">
                    {isSidebarOpen && user && (
                        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 overflow-hidden space-y-2">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Usuário</p>
                                <p className="text-xs text-white font-medium truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${role === 'super' ? 'bg-krenke-orange text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {role === 'super' ? 'Super Admin' : 'Acesso Restrito'}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
                    >
                        <LogOut size={22} />
                        {isSidebarOpen && <span className="font-medium">Sair do Painel</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
