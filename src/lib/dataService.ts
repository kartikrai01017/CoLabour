import { supabase, type WorkerWithUser, type Booking, type Payment, type WorkerProfile } from './supabase';

export interface PlatformStats {
  active_workers: number;
  jobs_completed: number;
  average_rating: number;
  on_time_rate: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase.rpc('get_platform_stats');
    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      return {
        active_workers: Number(row?.active_workers ?? 0),
        jobs_completed: Number(row?.jobs_completed ?? 0),
        average_rating: Number(row?.average_rating ?? 5.0),
        on_time_rate: Number(row?.on_time_rate ?? 98.4),
      };
    }
  } catch (err) {
    console.warn('RPC get_platform_stats notice:', err);
  }

  // Direct table counts in Supabase
  const [workersCount, completedBookingsCount] = await Promise.all([
    supabase.from('worker_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).or('status.eq.completed,status.eq.paid'),
  ]);

  return {
    active_workers: workersCount.count ?? 0,
    jobs_completed: completedBookingsCount.count ?? 0,
    average_rating: 5.0,
    on_time_rate: 98.5,
  };
}

export async function fetchWorkersList(category: string = 'all'): Promise<WorkerWithUser[]> {
  let query = supabase
    .from('worker_profiles')
    .select('*, users!inner(name, email, phone)')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.ilike('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching workers list:', error);
    return [];
  }
  return (data || []) as unknown as WorkerWithUser[];
}

export async function fetchWorkerProfile(id: string): Promise<WorkerWithUser | null> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*, users!inner(name, email, phone)')
    .or(`id.eq.${id},user_id.eq.${id}`)
    .eq('is_verified', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching worker profile:', error);
    return null;
  }
  return (data as unknown as WorkerWithUser) || null;
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
  // Backend guard: reject booking attempts if requester has role === 'worker'
  const { data: requester, error: requesterError } = await supabase
    .from('users')
    .select('role')
    .eq('id', params.customer_id)
    .maybeSingle();

  if (requesterError || !requester) {
    throw new Error('Unauthorized or invalid customer account');
  }

  if (requester.role === 'worker') {
    throw new Error('Worker accounts are restricted from booking services. Only customers can book.');
  }

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

  if (error) {
    console.error('Error creating booking:', error);
    throw new Error(error.message || 'Failed to create booking');
  }

  // Pre-generate pending payment record with UPI URI
  try {
    const worker = await fetchWorkerProfile(params.worker_id);
    if (worker) {
      const workerName = encodeURIComponent(worker.users?.name ?? 'Worker');
      const upiUri = `upi://pay?pa=${encodeURIComponent(worker.upi_id)}&pn=${workerName}&am=${Number(params.total_amount).toFixed(2)}&cu=INR&tn=CoLabour_${data.id.slice(0, 8)}`;
      await supabase.from('payments').insert({
        booking_id: data.id,
        worker_id: params.worker_id,
        customer_id: params.customer_id,
        amount: params.total_amount,
        upi_uri: upiUri,
        verification_token: `tok-${Date.now().toString(36)}`,
        status: 'pending',
      });
    }
  } catch (payErr) {
    console.warn('Initial payment insertion notice:', payErr);
  }

  return data as Booking;
}

export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching booking by id:', error);
    return null;
  }
  return (data as Booking) || null;
}

export async function fetchPaymentByBookingId(bookingId: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching payment by booking id:', error);
    return null;
  }
  return (data as Payment) || null;
}

export async function submitPaymentRecord(params: {
  booking_id: string;
  worker_id: string;
  customer_id: string;
  amount: number;
  upi_uri?: string;
  utr_number: string;
}): Promise<Payment> {
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('booking_id', params.booking_id)
    .maybeSingle();

  let paymentData: Payment;

  if (existing) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        utr_number: params.utr_number,
        status: 'payment_submitted',
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message || 'Failed to submit payment UTR');
    paymentData = data as Payment;
  } else {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: params.booking_id,
        worker_id: params.worker_id,
        customer_id: params.customer_id,
        amount: params.amount,
        upi_uri: params.upi_uri || null,
        utr_number: params.utr_number,
        verification_token: `tok-${Date.now().toString(36)}`,
        status: 'payment_submitted',
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message || 'Failed to record payment');
    paymentData = data as Payment;
  }

  // Update booking status to payment_submitted
  await supabase
    .from('bookings')
    .update({ status: 'payment_submitted' })
    .eq('id', params.booking_id);

  return paymentData;
}

export async function confirmPaymentAsReceived(paymentId: string): Promise<boolean> {
  const { data: payment, error: pError } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .select('booking_id')
    .single();

  if (pError) {
    console.error('Error confirming payment:', pError);
    throw new Error(pError.message || 'Failed to confirm payment');
  }

  if (payment?.booking_id) {
    await supabase
      .from('bookings')
      .update({
        status: 'paid',
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment.booking_id);
  }

  return true;
}

export async function rejectPaymentDispute(paymentId: string): Promise<boolean> {
  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status: 'pending',
      utr_number: null,
    })
    .eq('id', paymentId)
    .select('booking_id')
    .single();

  if (error) {
    console.error('Error rejecting payment dispute:', error);
    throw new Error(error.message || 'Failed to reject payment');
  }

  if (payment?.booking_id) {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id);
  }

  return true;
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  const updatePayload: Record<string, unknown> = { status };
  if (status === 'completed' || status === 'paid') {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw new Error(error.message || 'Failed to update booking status');
  }
}

export async function fetchCustomerDashboardData(customerId: string): Promise<{
  bookings: (Booking & { worker?: { id: string; category: string; hourly_rate: number; users?: { name: string; email?: string; phone?: string } | null } | null })[];
  payments: Payment[];
}> {
  const { data: bookingsData, error: bError } = await supabase
    .from('bookings')
    .select(`
      *,
      worker:worker_profiles(
        id,
        category,
        hourly_rate,
        users(name, email, phone)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (bError) {
    console.error('Error fetching customer bookings:', bError);
  }

  const { data: paymentsData, error: pError } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (pError) {
    console.error('Error fetching customer payments:', pError);
  }

  return {
    bookings: (bookingsData || []) as unknown as (Booking & { worker?: { id: string; category: string; hourly_rate: number; users?: { name: string; email?: string; phone?: string } | null } | null })[],
    payments: (paymentsData || []) as Payment[],
  };
}

export const fetchCustomerData = fetchCustomerDashboardData;

export async function fetchWorkerDashboardData(workerUserId: string): Promise<{
  profile: WorkerProfile | null;
  bookings: (Booking & { customer?: { name: string; phone: string; email?: string } | null })[];
  payments: Payment[];
}> {
  const { data: workerProfile, error: wpError } = await supabase
    .from('worker_profiles')
    .select('*')
    .or(`user_id.eq.${workerUserId},id.eq.${workerUserId}`)
    .maybeSingle();

  if (wpError || !workerProfile) {
    return { profile: null, bookings: [], payments: [] };
  }

  const { data: bookingsData, error: bError } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:users(name, phone, email)
    `)
    .eq('worker_id', workerProfile.id)
    .order('created_at', { ascending: false });

  if (bError) {
    console.error('Error fetching worker bookings:', bError);
  }

  const { data: paymentsData, error: pError } = await supabase
    .from('payments')
    .select('*')
    .eq('worker_id', workerProfile.id)
    .order('created_at', { ascending: false });

  if (pError) {
    console.error('Error fetching worker payments:', pError);
  }

  return {
    profile: workerProfile as WorkerProfile,
    bookings: (bookingsData || []) as (Booking & { customer?: { name: string; phone: string; email?: string } | null })[],
    payments: (paymentsData || []) as Payment[],
  };
}

export async function fetchAdminData(): Promise<{
  workers: WorkerWithUser[];
  bookings: Booking[];
  payments: Payment[];
}> {
  const [workersRes, bookingsRes, paymentsRes] = await Promise.all([
    supabase.from('worker_profiles').select('*, users(name, email, phone)').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
  ]);

  return {
    workers: (workersRes.data || []) as unknown as WorkerWithUser[],
    bookings: (bookingsRes.data || []) as Booking[],
    payments: (paymentsRes.data || []) as Payment[],
  };
}

export async function toggleWorkerVerification(workerId: string, currentStatus: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('worker_profiles')
    .update({ is_verified: !currentStatus })
    .eq('id', workerId);

  if (error) {
    console.error('Error toggling worker verification:', error);
    throw new Error(error.message || 'Failed to update verification');
  }

  return !currentStatus;
}

export async function resolvePaymentDispute(paymentId: string): Promise<boolean> {
  return confirmPaymentAsReceived(paymentId);
}
