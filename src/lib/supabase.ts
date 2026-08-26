import { createClient } from '@supabase/supabase-js';

// Real Supabase Credentials (Direct Fallback Included)
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://cnrjngxwllubordvxpig.supabase.co';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucmpuZ3h3bGx1Ym9yZHZ4cGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Nzc1NTYsImV4cCI6MjEwMzI1MzU1Nn0.8hB2RruNexej_iPS4wYcvFM7Yx0hX0vFmENQIWyMpsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

export interface WorkerProfile {
  id?: string;
  user_id: string;
  bio?: string | null;
  category: string;
  skills: string[];
  upi_id: string;
  hourly_rate: number;
  rating?: number;
  total_ratings?: number;
  is_verified?: boolean;
  location?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface WorkerWithUser extends WorkerProfile {
  users?: Pick<User, 'name' | 'email' | 'phone'> | null;
}

export interface Booking {
  id?: string;
  customer_id: string;
  worker_id: string;
  category: string;
  scheduled_at: string;
  address: string;
  total_amount: number;
  status?: string;
  notes?: string | null;
  created_at?: string;
}

export interface Payment {
  id?: string;
  booking_id: string;
  worker_id: string;
  customer_id: string;
  amount: number;
  upi_uri?: string | null;
  utr_number?: string | null;
  verification_token?: string | null;
  status?: string;
  paid_at?: string | null;
  created_at?: string;
}

export interface AuthSession {
  user: User | null;
  workerProfile: WorkerProfile | null;
  loading: boolean;
}

export const CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Driver',
  'Gardener',
  'Caregiver',
  'Technician',
] as const;

export type Category = (typeof CATEGORIES)[number];
