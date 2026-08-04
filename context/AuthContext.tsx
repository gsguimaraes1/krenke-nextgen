import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'super' | 'restricted' | 'reseller' | 'hr' | 'mkt';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    profile: any | null;
    isSuperAdmin: boolean;
    loading: boolean;
    // true entre o clique no link de redefinição de senha (evento PASSWORD_RECOVERY do Supabase)
    // e a troca efetiva da senha — usado pra forçar o usuário na tela de "nova senha".
    passwordRecovery: boolean;
    clearPasswordRecovery: () => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [passwordRecovery, setPasswordRecovery] = useState(false);
    const clearPasswordRecovery = () => setPasswordRecovery(false);

    const fetchProfile = async (userId: string) => {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                setRole(data.role as UserRole);
                return data;
            }
            return null;
        } catch (err) {
            console.error('Error fetching user profile:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const handleAuthStateChange = async (session: Session | null) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            let profileData = await fetchProfile(currentUser.id);
            let retries = 3;

            while (retries > 0 && !profileData) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                profileData = await fetchProfile(currentUser.id);
                retries--;
            }

            if (!profileData) {
                // Sem perfil = sem papel. Autorização real vive no RLS/servidor;
                // nunca atribuir papel no cliente.
                setRole(null);
            }
        } else {
            setRole(null);
            setProfile(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthStateChange(session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Link de "esqueci minha senha": Supabase troca o token da URL por uma sessão
            // válida e dispara esse evento — sem isso o usuário só "loga" e nunca é levado
            // pra trocar a senha.
            if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
            handleAuthStateChange(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
        setRole(null);
        setProfile(null);
        setPasswordRecovery(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            profile,
            isSuperAdmin: role === 'super',
            loading,
            passwordRecovery,
            clearPasswordRecovery,
            signOut,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
