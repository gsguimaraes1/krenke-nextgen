import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'super' | 'restricted';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    isSuperAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    const SUPER_ADMIN_EMAIL = 'gabriel.gbr.fire@gmail.com';

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const handleAuthStateChange = async (session: Session | null) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Try to fetch profile multiple times if needed (to handle trigger creation delay)
                    let profileData = null;
                    let retries = 3;

                    while (retries > 0 && !profileData) {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', currentUser.id)
                            .single();

                        if (data) {
                            profileData = data;
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 500));
                            retries--;
                        }
                    }

                    if (profileData) {
                        setRole(profileData.role as UserRole);
                    } else {
                        // Safe fallback for standard users if profile hasn't been created yet
                        setRole(currentUser.email === SUPER_ADMIN_EMAIL ? 'super' : 'restricted');
                    }
                } catch (err) {
                    console.error('Error fetching user role:', err);
                    setRole('restricted');
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        };

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
        <AuthContext.Provider value={{ user, session, role, isSuperAdmin: role === 'super', loading, signOut }}>
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
