/*
# CoLabour Marketplace Schema

## Overview
Creates the complete database schema for CoLabour, a cooperative gig-worker marketplace.
Includes user profiles, worker profiles, bookings, and payments.

## Tables
1. users — User profiles linked to Supabase Auth. Stores name, email, phone, role.
2. worker_profiles — Extended profiles for workers: bio, category, skills[], upi_id, hourly_rate, rating, location.
3. bookings — Service bookings between customers and workers with status tracking.
4. payments — Payment records with UPI URI, UTR number, verification token, and status.

## Security (RLS)
- users: all authenticated can SELECT (marketplace needs worker names); owner can INSERT/UPDATE/DELETE own row.
- worker_profiles: all authenticated can SELECT (directory); owner can INSERT/UPDATE/DELETE own profile.
- bookings: customer + worker + admin can SELECT/UPDATE; customer can INSERT/DELETE.
- payments: customer + worker + admin can SELECT/UPDATE; customer can INSERT.

## Functions (SECURITY DEFINER)
- create_worker_profile: atomic insert into users + worker_profiles, returns composite object.
- create_customer_profile: atomic insert into users for customer role.
- verify_payment_by_token: verifies a payment by its one-time token, sets status to 'paid'.
- confirm_payment_received: worker 1-tap confirmation of payment receipt.

## Notes
1. Uses Supabase built-in auth (auth.users). No custom password tables.
2. Idempotent — uses IF NOT EXISTS and DROP POLICY IF EXISTS.
*/
-- ============================================================
-- CoLabour Marketplace - Complete Supabase Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'worker', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_all" ON public.users;
CREATE POLICY "users_select_all"
ON public.users
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);


-- ============================================================
-- 2. WORKER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  bio text,
  category text NOT NULL,

  skills text[] DEFAULT '{}',

  upi_id text NOT NULL,

  hourly_rate numeric DEFAULT 0,

  rating numeric(3,1) DEFAULT 5.0,

  total_ratings integer DEFAULT 0,

  is_verified boolean DEFAULT true,

  location text,

  avatar_url text,

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id)
);

ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "worker_profiles_select_all"
ON public.worker_profiles;

CREATE POLICY "worker_profiles_select_all"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "worker_profiles_insert_own"
ON public.worker_profiles;

CREATE POLICY "worker_profiles_insert_own"
ON public.worker_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "worker_profiles_update_own_admin"
ON public.worker_profiles;

CREATE POLICY "worker_profiles_update_own_admin"
ON public.worker_profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "worker_profiles_delete_own"
ON public.worker_profiles;

CREATE POLICY "worker_profiles_delete_own"
ON public.worker_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ============================================================
-- 3. BOOKINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id uuid NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  worker_id uuid NOT NULL
    REFERENCES public.worker_profiles(id)
    ON DELETE CASCADE,

  category text NOT NULL,

  scheduled_at timestamptz NOT NULL,

  address text NOT NULL,

  total_amount numeric NOT NULL DEFAULT 0,

  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'payment_submitted',
        'paid'
      )
    ),

  notes text,

  created_at timestamptz DEFAULT now(),

  completed_at timestamptz
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_parties"
ON public.bookings;

CREATE POLICY "bookings_select_parties"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "bookings_insert_customer"
ON public.bookings;

CREATE POLICY "bookings_insert_customer"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "bookings_update_parties"
ON public.bookings;

CREATE POLICY "bookings_update_parties"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "bookings_delete_customer"
ON public.bookings;

CREATE POLICY "bookings_delete_customer"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);


-- ============================================================
-- 4. PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id uuid NOT NULL
    REFERENCES public.bookings(id)
    ON DELETE CASCADE,

  worker_id uuid NOT NULL
    REFERENCES public.worker_profiles(id)
    ON DELETE CASCADE,

  customer_id uuid NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  amount numeric NOT NULL DEFAULT 0,

  upi_uri text,

  utr_number text,

  verification_token text,

  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'payment_submitted',
        'paid',
        'failed',
        'refunded'
      )
    ),

  paid_at timestamptz,

  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_parties"
ON public.payments;

CREATE POLICY "payments_select_parties"
ON public.payments
FOR SELECT
TO authenticated
USING (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "payments_insert_customer"
ON public.payments;

CREATE POLICY "payments_insert_customer"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "payments_update_parties"
ON public.payments;

CREATE POLICY "payments_update_parties"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = customer_id

  OR EXISTS (
    SELECT 1
    FROM public.worker_profiles
    WHERE id = worker_id
    AND user_id = auth.uid()
  )

  OR EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_worker_profiles_category
ON public.worker_profiles(category);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_verified
ON public.worker_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_bookings_customer
ON public.bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_worker
ON public.bookings(worker_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_payments_booking
ON public.payments(booking_id);

CREATE INDEX IF NOT EXISTS idx_payments_customer
ON public.payments(customer_id);

CREATE INDEX IF NOT EXISTS idx_payments_worker
ON public.payments(worker_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_payments_token
ON public.payments(verification_token);


-- ============================================================
-- 6. CREATE WORKER PROFILE
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_worker_profile(
  p_name text,
  p_email text,
  p_phone text,
  p_bio text,
  p_category text,
  p_skills text[],
  p_upi_id text,
  p_hourly_rate numeric,
  p_location text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_worker_id uuid;
BEGIN

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.users (
    id,
    name,
    email,
    phone,
    role
  )
  VALUES (
    v_user_id,
    p_name,
    p_email,
    p_phone,
    'worker'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = 'worker';

  INSERT INTO public.worker_profiles (
    user_id,
    bio,
    category,
    skills,
    upi_id,
    hourly_rate,
    location
  )
  VALUES (
    v_user_id,
    p_bio,
    p_category,
    p_skills,
    p_upi_id,
    p_hourly_rate,
    p_location
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    bio = EXCLUDED.bio,
    category = EXCLUDED.category,
    skills = EXCLUDED.skills,
    upi_id = EXCLUDED.upi_id,
    hourly_rate = EXCLUDED.hourly_rate,
    location = EXCLUDED.location
  RETURNING id INTO v_worker_id;

  RETURN json_build_object(
    'user_id', v_user_id,
    'worker_id', v_worker_id,
    'name', p_name,
    'email', p_email,
    'phone', p_phone,
    'role', 'worker',
    'upi_id', p_upi_id,
    'skills', p_skills,
    'category', p_category
  );

END;
$$;


-- ============================================================
-- 7. CREATE CUSTOMER PROFILE
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_customer_profile(
  p_name text,
  p_email text,
  p_phone text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.users (
    id,
    name,
    email,
    phone,
    role
  )
  VALUES (
    v_user_id,
    p_name,
    p_email,
    p_phone,
    'customer'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  RETURN json_build_object(
    'user_id', v_user_id,
    'name', p_name,
    'email', p_email,
    'phone', p_phone,
    'role', 'customer'
  );

END;
$$;


-- ============================================================
-- 8. VERIFY PAYMENT BY TOKEN
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_payment_by_token(
  p_token text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment record;
BEGIN

  SELECT *
  INTO v_payment
  FROM public.payments
  WHERE verification_token = p_token
  AND status != 'paid'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or already used token'
    );
  END IF;

  UPDATE public.payments
  SET
    status = 'paid',
    paid_at = now()
  WHERE id = v_payment.id;

  UPDATE public.bookings
  SET
    status = 'paid'
  WHERE id = v_payment.booking_id;

  RETURN json_build_object(
    'success', true,
    'payment_id', v_payment.id,
    'booking_id', v_payment.booking_id,
    'amount', v_payment.amount
  );

END;
$$;


-- ============================================================
-- 9. CONFIRM PAYMENT RECEIVED
-- ============================================================

CREATE OR REPLACE FUNCTION public.confirm_payment_received(
  p_payment_id uuid,
  p_worker_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment record;
BEGIN

  SELECT pm.*
  INTO v_payment
  FROM public.payments pm
  INNER JOIN public.worker_profiles wp
    ON wp.id = pm.worker_id
  WHERE pm.id = p_payment_id
  AND wp.user_id = p_worker_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Payment not found or not authorized'
    );
  END IF;

  UPDATE public.payments
  SET
    status = 'paid',
    paid_at = now()
  WHERE id = p_payment_id;

  UPDATE public.bookings
  SET
    status = 'paid'
  WHERE id = v_payment.booking_id;

  RETURN json_build_object(
    'success', true,
    'payment_id', p_payment_id
  );

END;
$$;


-- ============================================================
-- 10. PLATFORM STATISTICS
-- ============================================================

DROP FUNCTION IF EXISTS public.get_platform_stats();

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  active_workers bigint,
  jobs_completed bigint,
  average_rating numeric,
  on_time_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT

    -- Active verified workers
    (
      SELECT COUNT(*)
      FROM public.worker_profiles
      WHERE is_verified = true
    )::bigint,

    -- Completed jobs
    (
      SELECT COUNT(*)
      FROM public.bookings
      WHERE status = 'completed'
    )::bigint,

    -- Average worker rating
    COALESCE(
      (
        SELECT ROUND(AVG(rating), 1)
        FROM public.worker_profiles
        WHERE rating IS NOT NULL
        AND total_ratings > 0
      ),
      0
    )::numeric,

    -- On-time rate
    COALESCE(
      (
        SELECT
          ROUND(
            (
              COUNT(*) FILTER (
                WHERE completed_at <= scheduled_at
              )::numeric
              /
              NULLIF(
                COUNT(*) FILTER (
                  WHERE status = 'completed'
                ),
                0
              )
            ) * 100,
            1
          )
        FROM public.bookings
        WHERE status = 'completed'
        AND completed_at IS NOT NULL
      ),
      0
    )::numeric;
$$;


-- ============================================================
-- 11. PERMISSIONS
-- ============================================================

GRANT EXECUTE
ON FUNCTION public.create_worker_profile(
  text,
  text,
  text,
  text,
  text,
  text[],
  text,
  numeric,
  text
)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.create_customer_profile(
  text,
  text,
  text
)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.verify_payment_by_token(text)
TO anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.confirm_payment_received(uuid, uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.get_platform_stats()
TO authenticated;


-- ============================================================
-- 12. RELOAD SUPABASE API SCHEMA
-- ============================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- DONE
-- ============================================================