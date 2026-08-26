import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type User, type WorkerProfile } from '@/lib/supabase';
import {
  isSupabaseConfigured,
  getLocalAuthUser,
  setLocalAuthUser,
  demoLogin as demoLoginHelper,
  localSignUp as localSignUpHelper,
} from '@/lib/dataService';
import { INITIAL_USERS } from '@/lib/mockData';

export interface SignUpParams {
  role: 'customer' | 'worker';
  name: string;
  email: string;
  password?: string;
  phone: string;
  category?: string;
  skills?: string[] | string;
  upi_id?: string;
  hourly_rate?: number;
  location?: string;
  bio?: string;
}

export interface AuthContextValue {
  user: User | null;
  workerProfile: WorkerProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password?: string, role?: 'customer' | 'worker' | 'admin') => Promise<User>;
  signIn: (email: string, password?: string, role?: 'customer' | 'worker' | 'admin') => Promise<User>;
  signup: (params: SignUpParams) => Promise<User>;
  signUp: (params: SignUpParams) => Promise<User>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsDemo: (role: 'customer' | 'worker' | 'admin') => User;
  signUpLocal: (params: SignUpParams) => User;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (userData) {
          setUser(userData as User);
          setLocalAuthUser(userData as User);
          if (userData.role === 'worker') {
            const { data: wp } = await supabase
              .from('worker_profiles')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();
            setWorkerProfile(wp as WorkerProfile | null);
          } else {
            setWorkerProfile(null);
          }
          return;
        }
      } catch {
        // Fallback to local
      }
    }

    const localAuth = getLocalAuthUser();
    setUser(localAuth.user);
    setWorkerProfile(localAuth.workerProfile);
  }

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured()) {
      const local = getLocalAuthUser();
      if (mounted) {
        setUser(local.user);
        setWorkerProfile(local.workerProfile);
        setLoading(false);
      }
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          loadProfile(currentSession.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          const local = getLocalAuthUser();
          setUser(local.user);
          setWorkerProfile(local.workerProfile);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        const local = getLocalAuthUser();
        setUser(local.user);
        setWorkerProfile(local.workerProfile);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        (async () => {
          await loadProfile(newSession.user.id);
          if (mounted) setLoading(false);
        })();
      } else {
        const local = getLocalAuthUser();
        setUser(local.user);
        setWorkerProfile(local.workerProfile);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password?: string,
    fallbackRole?: 'customer' | 'worker' | 'admin'
  ): Promise<User> => {
    // 1. Try demo login if matching demo accounts or explicit demo role
    if (fallbackRole) {
      const demoResult = demoLoginHelper(fallbackRole);
      setUser(demoResult.user);
      setWorkerProfile(demoResult.workerProfile);
      return demoResult.user;
    }

    // 2. Try Supabase Auth if configured
    if (isSupabaseConfigured() && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!authError && authData.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (userData) {
            setUser(userData as User);
            setLocalAuthUser(userData as User);
            if (userData.role === 'worker') {
              const { data: wp } = await supabase
                .from('worker_profiles')
                .select('*')
                .eq('user_id', authData.user.id)
                .maybeSingle();
              setWorkerProfile(wp as WorkerProfile | null);
            }
            return userData as User;
          }
        }
      } catch {
        // Fallback to local user lookup
      }
    }

    // 3. Search local user database
    try {
      const rawUsers = localStorage.getItem('colabour_users');
      const users: User[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;
      const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (found) {
        setLocalAuthUser(found);
        setUser(found);

        const rawWorkers = localStorage.getItem('colabour_workers');
        const workers = rawWorkers ? JSON.parse(rawWorkers) : [];
        const wp = workers.find((w: { user_id: string }) => w.user_id === found.id) || null;
        setWorkerProfile(wp);
        return found;
      }
    } catch {
      // ignore
    }

    // 4. If demo user fallback by email pattern
    if (email.includes('worker') || email.includes('rajesh')) {
      const res = demoLoginHelper('worker');
      setUser(res.user);
      setWorkerProfile(res.workerProfile);
      return res.user;
    } else if (email.includes('admin')) {
      const res = demoLoginHelper('admin');
      setUser(res.user);
      setWorkerProfile(res.workerProfile);
      return res.user;
    } else if (email) {
      const res = demoLoginHelper('customer');
      setUser(res.user);
      setWorkerProfile(res.workerProfile);
      return res.user;
    }

    throw new Error('Invalid email or password');
  };

  const signUp = async (params: SignUpParams): Promise<User> => {
    const formattedSkills = Array.isArray(params.skills)
      ? params.skills
      : typeof params.skills === 'string'
      ? params.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (isSupabaseConfigured() && params.password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: params.email.trim(),
          password: params.password,
          options: { data: { name: params.name, role: params.role } },
        });

        if (authError) throw authError;

        if (authData.user) {
          if (params.role === 'worker') {
            const { error: rpcError } = await supabase.rpc('create_worker_profile', {
              p_name: params.name,
              p_email: params.email.trim(),
              p_phone: params.phone,
              p_bio: params.bio || '',
              p_category: params.category || 'Electrician',
              p_skills: formattedSkills,
              p_upi_id: params.upi_id || 'worker@upi',
              p_hourly_rate: params.hourly_rate || 400,
              p_location: params.location || '',
            });
            if (rpcError) throw rpcError;
          } else {
            const { error: rpcError } = await supabase.rpc('create_customer_profile', {
              p_name: params.name,
              p_email: params.email.trim(),
              p_phone: params.phone,
            });
            if (rpcError) throw rpcError;
          }

          const { data: createdUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (createdUser) {
            setUser(createdUser as User);
            setLocalAuthUser(createdUser as User);
            return createdUser as User;
          }
        }
      } catch {
        // Fall back to local registration
      }
    }

    const localResult = localSignUpHelper({
      ...params,
      skills: formattedSkills,
    });
    setUser(localResult.user);
    setWorkerProfile(localResult.workerProfile);
    return localResult.user;
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setLocalAuthUser(null);
    setUser(null);
    setWorkerProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      const local = getLocalAuthUser();
      setUser(local.user);
      setWorkerProfile(local.workerProfile);
    }
  };

  const loginAsDemo = (role: 'customer' | 'worker' | 'admin'): User => {
    const result = demoLoginHelper(role);
    setUser(result.user);
    setWorkerProfile(result.workerProfile);
    return result.user;
  };

  const signUpLocal = (params: SignUpParams): User => {
    const formattedSkills = Array.isArray(params.skills)
      ? params.skills
      : typeof params.skills === 'string'
      ? params.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const result = localSignUpHelper({
      ...params,
      skills: formattedSkills,
    });
    setUser(result.user);
    setWorkerProfile(result.workerProfile);
    return result.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        session,
        loading,
        login: signIn,
        signIn,
        signup: signUp,
        signUp,
        logout: signOut,
        signOut,
        refreshProfile,
        loginAsDemo,
        signUpLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

