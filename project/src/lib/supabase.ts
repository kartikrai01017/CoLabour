import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});

export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  category: string;
  skills: string[];
  upi_id: string;
  hourly_rate: number;
  rating: number;
  total_ratings: number;
  is_verified: boolean;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface WorkerWithUser extends WorkerProfile {
  users: Pick<User, 'name' | 'email' | 'phone'> | null;
}

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  category: string;
  scheduled_at: string;
  address: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  hours?: number;
  completed_at?: string | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  worker_id: string;
  customer_id: string;
  amount: number;
  upi_uri: string | null;
  utr_number: string | null;
  verification_token: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
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
