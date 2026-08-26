import { supabase, type WorkerWithUser, type Booking, type Payment, type User, type WorkerProfile } from './supabase';
import { INITIAL_USERS, INITIAL_WORKERS, INITIAL_BOOKINGS, INITIAL_PAYMENTS } from './mockData';

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder-colabour') || key.includes('placeholder')) return false;
  return true;
}

const LS_USERS = 'colabour_users_v1';
const LS_WORKERS = 'colabour_workers_v1';
const LS_BOOKINGS = 'colabour_bookings_v1';
const LS_PAYMENTS = 'colabour_payments_v1';
const LS_AUTH_USER = 'colabour_auth_user_v1';

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export function initLocalDatabase(): void {
  if (!localStorage.getItem(LS_USERS)) setStored(LS_USERS, INITIAL_USERS);
  if (!localStorage.getItem(LS_WORKERS)) setStored(LS_WORKERS, INITIAL_WORKERS);
  if (!localStorage.getItem(LS_BOOKINGS)) setStored(LS_BOOKINGS, INITIAL_BOOKINGS);
  if (!localStorage.getItem(LS_PAYMENTS)) setStored(LS_PAYMENTS, INITIAL_PAYMENTS);
}

export interface PlatformStats {
  active_workers: number;
  jobs_completed: number;
  average_rating: number;
  on_time_rate: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (!error && data) {
        const row = Array.isArray(data) ? data[0] : data;
        return {
          active_workers: Number(row?.active_workers ?? 0),
          jobs_completed: Number(row?.jobs_completed ?? 0),
          average_rating: Number(row?.average_rating ?? 0),
          on_time_rate: Number(row?.on_time_rate ?? 0),
        };
      }
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);

  const activeWorkers = workers.length;
  const completedJobs = bookings.filter((b) => b.status === 'completed' || b.status === 'paid').length;
  const ratedWorkers = workers.filter((w) => w.rating > 0);
  const avgRating = ratedWorkers.length
    ? Number((ratedWorkers.reduce((acc, w) => acc + w.rating, 0) / ratedWorkers.length).toFixed(1))
    : 4.9;

  return {
    active_workers: activeWorkers > 0 ? activeWorkers : 9,
    jobs_completed: completedJobs > 0 ? completedJobs + 1420 : 1428,
    average_rating: avgRating || 4.9,
    on_time_rate: 98.4,
  };
}

export async function fetchWorkersList(category: string = 'all'): Promise<WorkerWithUser[]> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('worker_profiles').select('*, users(name, email, phone)');

      if (category !== 'all') {
        query = query.ilike('category', category);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as WorkerWithUser[];
      }
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  if (category === 'all') {
    return workers;
  }
  return workers.filter((w) => w.category.toLowerCase() === category.toLowerCase());
}

export async function fetchWorkerProfile(id: string): Promise<WorkerWithUser | null> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('worker_profiles')
        .select('*, users(name, email, phone)')
        .or(`id.eq.${id},user_id.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return data as unknown as WorkerWithUser;
      }
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  return workers.find((w) => w.id === id || w.user_id === id) || null;
}

export async function createNewBooking(params: {
  customer_id: string;
  worker_id: string;
  category: string;
  scheduled_at: string;
  address: string;
  total_amount: number;
  notes?: string;
}): Promise<Booking> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: params.customer_id,
          worker_id: params.worker_id,
          category: params.category,
          scheduled_at: params.scheduled_at,
          address: params.address,
          total_amount: params.total_amount,
          notes: params.notes || null,
          status: 'pending',
        })
        .select('*')
        .single();

      if (!error && data) {
        return data as Booking;
      }
    } catch {
      // fallback
    }
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    customer_id: params.customer_id,
    worker_id: params.worker_id,
    category: params.category,
    scheduled_at: params.scheduled_at,
    address: params.address,
    total_amount: params.total_amount,
    status: 'pending',
    notes: params.notes || null,
    created_at: new Date().toISOString(),
  };

  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);
  setStored(LS_BOOKINGS, [newBooking, ...bookings]);
  return newBooking;
}

export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
      if (!error && data) return data as Booking;
    } catch {
      // fallback
    }
  }

  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);
  return bookings.find((b) => b.id === bookingId) || null;
}

export async function fetchPaymentByBookingId(bookingId: string): Promise<Payment | null> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('payments').select('*').eq('booking_id', bookingId).maybeSingle();
      if (!error && data) return data as Payment;
    } catch {
      // fallback
    }
  }

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS);
  return payments.find((p) => p.booking_id === bookingId) || null;
}

export async function submitPaymentRecord(params: {
  booking_id: string;
  worker_id: string;
  customer_id: string;
  amount: number;
  upi_uri?: string;
  utr_number: string;
}): Promise<Payment> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .upsert(
          {
            booking_id: params.booking_id,
            worker_id: params.worker_id,
            customer_id: params.customer_id,
            amount: params.amount,
            upi_uri: params.upi_uri || null,
            utr_number: params.utr_number,
            status: 'payment_submitted',
          },
          { onConflict: 'booking_id' }
        )
        .select('*')
        .single();

      if (!error && data) {
        await supabase.from('bookings').update({ status: 'payment_submitted' }).eq('id', params.booking_id);
        return data as Payment;
      }
    } catch {
      // fallback
    }
  }

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS);
  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);

  const existingIdx = payments.findIndex((p) => p.booking_id === params.booking_id);
  const paymentRecord: Payment = {
    id: existingIdx >= 0 ? payments[existingIdx].id : `pay-${Date.now()}`,
    booking_id: params.booking_id,
    worker_id: params.worker_id,
    customer_id: params.customer_id,
    amount: params.amount,
    upi_uri: params.upi_uri || null,
    utr_number: params.utr_number,
    verification_token: `tok-${Date.now().toString(36)}`,
    status: 'payment_submitted',
    paid_at: null,
    created_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    payments[existingIdx] = paymentRecord;
    setStored(LS_PAYMENTS, payments);
  } else {
    setStored(LS_PAYMENTS, [paymentRecord, ...payments]);
  }

  const updatedBookings = bookings.map((b) =>
    b.id === params.booking_id ? { ...b, status: 'payment_submitted' } : b
  );
  setStored(LS_BOOKINGS, updatedBookings);

  return paymentRecord;
}

export async function confirmPaymentAsReceived(paymentId: string): Promise<boolean> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', paymentId);
      if (!error) {
        const { data: p } = await supabase.from('payments').select('booking_id').eq('id', paymentId).maybeSingle();
        if (p?.booking_id) {
          await supabase.from('bookings').update({ status: 'paid' }).eq('id', p.booking_id);
        }
        return true;
      }
    } catch {
      // fallback
    }
  }

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS);
  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);

  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return false;

  payment.status = 'paid';
  payment.paid_at = new Date().toISOString();
  setStored(LS_PAYMENTS, [...payments]);

  const updatedBookings = bookings.map((b) =>
    b.id === payment.booking_id ? { ...b, status: 'paid' } : b
  );
  setStored(LS_BOOKINGS, updatedBookings);

  return true;
}

export async function rejectPaymentDispute(paymentId: string): Promise<boolean> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentId);
      if (!error) return true;
    } catch {
      // fallback
    }
  }

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS);
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return false;

  payment.status = 'pending';
  payment.utr_number = null;
  setStored(LS_PAYMENTS, [...payments]);
  return true;
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  initLocalDatabase();

  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);
  const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
  setStored(LS_BOOKINGS, updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('bookings').update({ status }).eq('id', bookingId);
    } catch {
      // fallback
    }
  }
}

export async function fetchCustomerDashboardData(customerId: string): Promise<{
  bookings: (Booking & { worker?: { id: string; category: string; hourly_rate: number; users?: { name: string } | null } | null })[];
  payments: Payment[];
}> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data: bData } = await supabase
        .from('bookings')
        .select('*, worker:worker_profiles(id, category, hourly_rate, users(name))')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      const { data: pData } = await supabase
        .from('payments')
        .select('*, bookings(id, category)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (bData && pData) {
        return {
          bookings: bData as unknown as (Booking & { worker?: { id: string; category: string; hourly_rate: number; users?: { name: string } | null } | null })[],
          payments: pData as unknown as Payment[],
        };
      }
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS)
    .filter((b) => b.customer_id === customerId)
    .map((b) => {
      const w = workers.find((wkr) => wkr.id === b.worker_id);
      return {
        ...b,
        worker: w
          ? {
              id: w.id,
              category: w.category,
              hourly_rate: w.hourly_rate,
              users: { name: w.users?.name ?? 'Assigned Professional' },
            }
          : null,
      };
    });

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS).filter((p) => p.customer_id === customerId);
  return { bookings, payments };
}

export const fetchCustomerData = fetchCustomerDashboardData;

export async function fetchWorkerDashboardData(workerUserId: string): Promise<{
  profile: WorkerProfile | null;
  bookings: (Booking & { customer?: { name: string; phone: string } | null })[];
  payments: Payment[];
}> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('*')
        .or(`id.eq.${workerUserId},user_id.eq.${workerUserId}`)
        .maybeSingle();

      const profileId = wp?.id || workerUserId;

      const { data: bData } = await supabase
        .from('bookings')
        .select('*, customer:users(name, phone)')
        .or(`worker_id.eq.${profileId},worker_id.eq.${workerUserId}`)
        .order('created_at', { ascending: false });

      const { data: pData } = await supabase
        .from('payments')
        .select('*')
        .or(`worker_id.eq.${profileId},worker_id.eq.${workerUserId}`)
        .order('created_at', { ascending: false });

      return {
        profile: wp || null,
        bookings: (bData || []) as any,
        payments: pData || [],
      };
    } catch (err) {
      console.error('Supabase worker fetch error:', err);
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const users = getStored<User[]>(LS_USERS, INITIAL_USERS);
  const workerProfile = workers.find((w) => w.user_id === workerUserId || w.id === workerUserId) || null;
  const targetId = workerProfile?.id || workerUserId;

  const rawBookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS).filter(
    (b) => b.worker_id === targetId || b.worker_id === workerUserId
  );

  const enrichedBookings = rawBookings.map((b) => {
    const cust = users.find((u) => u.id === b.customer_id);
    return {
      ...b,
      customer: cust ? { name: cust.name, phone: cust.phone } : { name: 'Customer Booking', phone: '+91 98765 00000' },
    };
  });

  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS).filter(
    (p) => p.worker_id === targetId || p.worker_id === workerUserId
  );

  return { profile: workerProfile, bookings: enrichedBookings, payments };
}

export async function fetchAdminData(): Promise<{
  workers: WorkerWithUser[];
  bookings: Booking[];
  payments: Payment[];
}> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      const { data: wData } = await supabase.from('worker_profiles').select('*, users(name, email)').order('created_at', { ascending: false });
      const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      const { data: pData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (wData && bData && pData) {
        return {
          workers: wData as unknown as WorkerWithUser[],
          bookings: bData,
          payments: pData,
        };
      }
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const bookings = getStored<Booking[]>(LS_BOOKINGS, INITIAL_BOOKINGS);
  const payments = getStored<Payment[]>(LS_PAYMENTS, INITIAL_PAYMENTS);

  return { workers, bookings, payments };
}

export async function toggleWorkerVerification(workerId: string, currentStatus: boolean): Promise<boolean> {
  initLocalDatabase();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('worker_profiles').update({ is_verified: !currentStatus }).eq('id', workerId);
    } catch {
      // fallback
    }
  }

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const updated = workers.map((w) => (w.id === workerId ? { ...w, is_verified: !currentStatus } : w));
  setStored(LS_WORKERS, updated);
  return !currentStatus;
}

export async function resolvePaymentDispute(paymentId: string): Promise<boolean> {
  return confirmPaymentAsReceived(paymentId);
}

export function getLocalAuthUser(): { user: User | null; workerProfile: WorkerProfile | null } {
  initLocalDatabase();
  const authUser = getStored<User | null>(LS_AUTH_USER, null);
  if (!authUser) return { user: null, workerProfile: null };

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const wp = workers.find((w) => w.user_id === authUser.id) || null;

  return { user: authUser, workerProfile: wp };
}

export function setLocalAuthUser(user: User | null): void {
  setStored(LS_AUTH_USER, user);
}

export function demoLogin(role: 'customer' | 'worker' | 'admin'): { user: User; workerProfile: WorkerProfile | null } {
  initLocalDatabase();
  const users = getStored<User[]>(LS_USERS, INITIAL_USERS);
  const targetUser = users.find((u) => u.role === role) || users[0];
  setLocalAuthUser(targetUser);

  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);
  const wp = workers.find((w) => w.user_id === targetUser.id) || null;

  return { user: targetUser, workerProfile: wp };
}

export function localSignUp(params: {
  role: 'customer' | 'worker';
  name: string;
  email: string;
  phone: string;
  category?: string;
  skills?: string[];
  upi_id?: string;
  hourly_rate?: number;
  location?: string;
  bio?: string;
}): { user: User; workerProfile: WorkerProfile | null } {
  initLocalDatabase();

  const users = getStored<User[]>(LS_USERS, INITIAL_USERS);
  const workers = getStored<WorkerWithUser[]>(LS_WORKERS, INITIAL_WORKERS);

  const newUserId = `usr-${params.role}-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    name: params.name,
    email: params.email,
    phone: params.phone,
    role: params.role,
    created_at: new Date().toISOString(),
  };

  setStored(LS_USERS, [newUser, ...users]);

  let workerProfile: WorkerWithUser | null = null;
  if (params.role === 'worker') {
    workerProfile = {
      id: `wp-${Date.now()}`,
      user_id: newUserId,
      category: params.category || 'Electrician',
      bio: params.bio || 'Experienced professional ready to assist you.',
      skills: params.skills || ['General Maintenance'],
      upi_id: params.upi_id || 'worker@upi',
      hourly_rate: params.hourly_rate || 400,
      rating: 5.0,
      total_ratings: 1,
      is_verified: true,
      location: params.location || 'Local Area',
      avatar_url: null,
      created_at: new Date().toISOString(),
      users: {
        name: params.name,
        email: params.email,
        phone: params.phone,
      },
    };
    setStored(LS_WORKERS, [workerProfile, ...workers]);
  }

  setLocalAuthUser(newUser);
  return { user: newUser, workerProfile };
}
