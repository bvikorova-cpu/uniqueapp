-- Add pending balance tracking to instructor profiles
ALTER TABLE public.instructor_profiles
ADD COLUMN IF NOT EXISTS pending_balance NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS lifetime_earnings NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_withdrawn NUMERIC(10,2) DEFAULT 0.00;

-- Create instructor withdrawal requests table
CREATE TABLE IF NOT EXISTS public.instructor_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructor_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_details JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create instructor payout history table
CREATE TABLE IF NOT EXISTS public.instructor_payout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructor_profiles(id) ON DELETE CASCADE,
  withdrawal_request_id UUID REFERENCES public.instructor_withdrawal_requests(id),
  amount NUMERIC(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('course_sale', 'withdrawal', 'refund', 'adjustment')),
  description TEXT,
  balance_before NUMERIC(10,2),
  balance_after NUMERIC(10,2),
  related_enrollment_id UUID REFERENCES public.course_enrollments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_instructor ON public.instructor_withdrawal_requests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.instructor_withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_history_instructor ON public.instructor_payout_history(instructor_id);
CREATE INDEX IF NOT EXISTS idx_payout_history_created ON public.instructor_payout_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.instructor_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_payout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawal requests
CREATE POLICY "Instructors can view their own withdrawal requests"
ON public.instructor_withdrawal_requests FOR SELECT
USING (
  instructor_id IN (
    SELECT id FROM public.instructor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instructors can create withdrawal requests"
ON public.instructor_withdrawal_requests FOR INSERT
WITH CHECK (
  instructor_id IN (
    SELECT id FROM public.instructor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all withdrawal requests"
ON public.instructor_withdrawal_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update withdrawal requests"
ON public.instructor_withdrawal_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for payout history
CREATE POLICY "Instructors can view their own payout history"
ON public.instructor_payout_history FOR SELECT
USING (
  instructor_id IN (
    SELECT id FROM public.instructor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert payout history"
ON public.instructor_payout_history FOR INSERT
WITH CHECK (true);

-- Function to update instructor balance on course enrollment
CREATE OR REPLACE FUNCTION public.update_instructor_balance_on_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- Get instructor profile id
  SELECT ip.id, ip.pending_balance INTO v_instructor_id, v_current_balance
  FROM public.instructor_profiles ip
  JOIN public.courses c ON c.creator_id = ip.user_id
  WHERE c.id = NEW.course_id;
  
  IF v_instructor_id IS NOT NULL THEN
    -- Update instructor balance
    UPDATE public.instructor_profiles
    SET 
      pending_balance = pending_balance + NEW.creator_earning,
      lifetime_earnings = lifetime_earnings + NEW.creator_earning,
      updated_at = NOW()
    WHERE id = v_instructor_id;
    
    -- Record in payout history
    INSERT INTO public.instructor_payout_history (
      instructor_id,
      amount,
      transaction_type,
      description,
      balance_before,
      balance_after,
      related_enrollment_id
    ) VALUES (
      v_instructor_id,
      NEW.creator_earning,
      'course_sale',
      'Course enrollment: ' || (SELECT title FROM public.courses WHERE id = NEW.course_id),
      v_current_balance,
      v_current_balance + NEW.creator_earning,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for enrollment earnings
DROP TRIGGER IF EXISTS trigger_update_instructor_balance ON public.course_enrollments;
CREATE TRIGGER trigger_update_instructor_balance
AFTER INSERT ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_instructor_balance_on_enrollment();

-- Function to process withdrawal request
CREATE OR REPLACE FUNCTION public.process_withdrawal_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor_id UUID;
  v_amount NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  -- Get withdrawal request details
  SELECT instructor_id, amount INTO v_instructor_id, v_amount
  FROM public.instructor_withdrawal_requests
  WHERE id = p_request_id;
  
  -- Get current balance
  SELECT pending_balance INTO v_current_balance
  FROM public.instructor_profiles
  WHERE id = v_instructor_id;
  
  -- Update withdrawal request
  UPDATE public.instructor_withdrawal_requests
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- If approved, update balances
  IF p_status = 'completed' THEN
    UPDATE public.instructor_profiles
    SET 
      pending_balance = pending_balance - v_amount,
      total_withdrawn = total_withdrawn + v_amount,
      updated_at = NOW()
    WHERE id = v_instructor_id;
    
    -- Record in payout history
    INSERT INTO public.instructor_payout_history (
      instructor_id,
      withdrawal_request_id,
      amount,
      transaction_type,
      description,
      balance_before,
      balance_after
    ) VALUES (
      v_instructor_id,
      p_request_id,
      -v_amount,
      'withdrawal',
      'Withdrawal processed',
      v_current_balance,
      v_current_balance - v_amount
    );
  END IF;
END;
$$;

-- Trigger to update withdrawal request timestamp
CREATE OR REPLACE FUNCTION public.update_withdrawal_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_withdrawal_timestamp
BEFORE UPDATE ON public.instructor_withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_withdrawal_timestamp();