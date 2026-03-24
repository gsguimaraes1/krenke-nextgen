import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'super' | 'restricted';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    profile: any | null;
    isSuperAdmin: boolean;
    loading: boolean;
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

    const SUPER_ADMIN_EMAIL = 'gabriel.gbr.fire@gmail.com';

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
                setRole(currentUser.email === SUPER_ADMIN_EMAIL ? 'super' : 'restricted');
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthStateChange(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            profile,
            isSuperAdmin: role === 'super',
            loading,
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
