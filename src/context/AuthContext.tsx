import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type User, type WorkerProfile } from '@/lib/supabase';

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
  login: (email: string, password?: string) => Promise<User>;
  signIn: (email: string, password?: string) => Promise<User>;
  signup: (params: SignUpParams) => Promise<User>;
  signUp: (params: SignUpParams) => Promise<User>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user profile:', userError);
      }

      if (userData) {
        setUser(userData as User);
        if (userData.role === 'worker') {
          const { data: wp, error: wpError } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (wpError) {
            console.error('Error fetching worker profile:', wpError);
          }
          setWorkerProfile((wp as WorkerProfile) || null);
        } else {
          setWorkerProfile(null);
        }
      } else {
        setUser(null);
        setWorkerProfile(null);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setUser(null);
      setWorkerProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          loadProfile(currentSession.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setUser(null);
          setWorkerProfile(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Session retrieval error:', err);
        if (!mounted) return;
        setUser(null);
        setWorkerProfile(null);
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
        setUser(null);
        setWorkerProfile(null);
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
    password?: string
  ): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!password) {
      throw new Error('Please provide your account password.');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      throw new Error(authError.message || 'Invalid email or password');
    }

    if (!authData.user) {
      throw new Error('User authentication failed.');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      throw new Error('User account record not found in database.');
    }

    setUser(userData as User);

    if (userData.role === 'worker') {
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      setWorkerProfile((wp as WorkerProfile) || null);
    } else {
      setWorkerProfile(null);
    }

    return userData as User;
  };

  const signUp = async (params: SignUpParams): Promise<User> => {
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const formattedSkills = Array.isArray(params.skills)
      ? params.skills
      : typeof params.skills === 'string'
      ? params.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          name: params.name,
          role: params.role,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message || 'Failed to register account.');
    }

    if (!authData.user) {
      throw new Error('Registration failed to create user account.');
    }

    if (params.role === 'worker') {
      const { error: rpcError } = await supabase.rpc('create_worker_profile', {
        p_name: params.name,
        p_email: cleanEmail,
        p_phone: params.phone,
        p_bio: params.bio || '',
        p_category: params.category || 'Electrician',
        p_skills: formattedSkills,
        p_upi_id: params.upi_id || 'worker@upi',
        p_hourly_rate: Number(params.hourly_rate) || 400,
        p_location: params.location || 'Bangalore, India',
      });
      if (rpcError) {
        console.error('create_worker_profile RPC error:', rpcError);
        throw new Error(rpcError.message || 'Failed to create worker profile.');
      }
    } else {
      const { error: rpcError } = await supabase.rpc('create_customer_profile', {
        p_name: params.name,
        p_email: cleanEmail,
        p_phone: params.phone,
      });
      if (rpcError) {
        console.error('create_customer_profile RPC error:', rpcError);
        throw new Error(rpcError.message || 'Failed to create customer profile.');
      }
    }

    // Retrieve the newly created user record from users table
    const { data: createdUser, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (fetchErr || !createdUser) {
      // Fallback: query by email
      const { data: fallbackUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (fallbackUser) {
        setUser(fallbackUser as User);
        if (fallbackUser.role === 'worker') {
          const { data: wp } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', fallbackUser.id)
            .maybeSingle();
          setWorkerProfile((wp as WorkerProfile) || null);
        }
        return fallbackUser as User;
      }
    } else {
      setUser(createdUser as User);
      if (createdUser.role === 'worker') {
        const { data: wp } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', createdUser.id)
          .maybeSingle();
        setWorkerProfile((wp as WorkerProfile) || null);
      }
      return createdUser as User;
    }

    const defaultUser: User = {
      id: authData.user.id,
      name: params.name,
      email: cleanEmail,
      phone: params.phone,
      role: params.role,
      created_at: new Date().toISOString(),
    };
    setUser(defaultUser);
    return defaultUser;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUser(null);
    setWorkerProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      setUser(null);
      setWorkerProfile(null);
    }
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
