-- Add scheduled payout tracking
ALTER TABLE public.instructor_withdrawal_requests
ADD COLUMN IF NOT EXISTS scheduled_payout_date DATE,
ADD COLUMN IF NOT EXISTS payout_batch_id TEXT;

-- Create payout batches table for tracking scheduled payouts
CREATE TABLE IF NOT EXISTS public.payout_batches (
  id TEXT PRIMARY KEY,
  batch_date DATE NOT NULL,
  total_amount NUMERIC(10,2) DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payout_batches_date ON public.payout_batches(batch_date);
CREATE INDEX IF NOT EXISTS idx_withdrawal_scheduled_date ON public.instructor_withdrawal_requests(scheduled_payout_date);

-- Enable RLS
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admins to view batches
CREATE POLICY "Admins can view payout batches"
ON public.payout_batches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to schedule withdrawal for next payout date
CREATE OR REPLACE FUNCTION public.schedule_withdrawal_for_next_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_payout_date DATE;
  v_current_day INTEGER;
BEGIN
  -- Only schedule if status is pending
  IF NEW.status = 'pending' AND NEW.scheduled_payout_date IS NULL THEN
    v_current_day := EXTRACT(DAY FROM CURRENT_DATE);
    
    -- Determine next payout date (1st or 15th)
    IF v_current_day < 15 THEN
      -- Next payout is 15th of current month
      v_next_payout_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days';
    ELSE
      -- Next payout is 1st of next month
      v_next_payout_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    END IF;
    
    NEW.scheduled_payout_date := v_next_payout_date;
    NEW.payout_batch_id := 'BATCH-' || TO_CHAR(v_next_payout_date, 'YYYY-MM-DD');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-schedule withdrawals
DROP TRIGGER IF EXISTS trigger_schedule_withdrawal ON public.instructor_withdrawal_requests;
CREATE TRIGGER trigger_schedule_withdrawal
BEFORE INSERT ON public.instructor_withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.schedule_withdrawal_for_next_payout();

-- Function to create payout batch
CREATE OR REPLACE FUNCTION public.create_payout_batch(p_batch_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_id TEXT;
  v_total_amount NUMERIC;
  v_total_requests INTEGER;
BEGIN
  v_batch_id := 'BATCH-' || TO_CHAR(p_batch_date, 'YYYY-MM-DD');
  
  -- Calculate batch totals
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO v_total_amount, v_total_requests
  FROM public.instructor_withdrawal_requests
  WHERE scheduled_payout_date = p_batch_date
    AND status = 'pending';
  
  -- Create or update batch
  INSERT INTO public.payout_batches (
    id, 
    batch_date, 
    total_amount, 
    total_requests,
    status
  ) VALUES (
    v_batch_id,
    p_batch_date,
    v_total_amount,
    v_total_requests,
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    total_amount = EXCLUDED.total_amount,
    total_requests = EXCLUDED.total_requests,
    status = 'pending';
  
  RETURN v_batch_id;
END;
$$;

-- Function to process scheduled payouts
CREATE OR REPLACE FUNCTION public.process_scheduled_payouts(p_batch_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_processed_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_request RECORD;
  v_result JSONB;
BEGIN
  -- Update batch status to processing
  UPDATE public.payout_batches
  SET 
    status = 'processing',
    started_at = NOW()
  WHERE id = p_batch_id;
  
  -- Process each pending withdrawal in the batch
  FOR v_request IN
    SELECT *
    FROM public.instructor_withdrawal_requests
    WHERE payout_batch_id = p_batch_id
      AND status = 'pending'
  LOOP
    BEGIN
      -- Process the withdrawal
      PERFORM public.process_withdrawal_request(
        v_request.id,
        '00000000-0000-0000-0000-000000000000'::UUID, -- System user
        'completed',
        'Automatically processed by scheduled payout system'
      );
      
      v_processed_count := v_processed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Mark request as processing failed but don't stop the batch
      UPDATE public.instructor_withdrawal_requests
      SET 
        status = 'rejected',
        admin_notes = 'Auto-processing failed: ' || SQLERRM,
        processed_at = NOW()
      WHERE id = v_request.id;
      
      v_failed_count := v_failed_count + 1;
    END;
  END LOOP;
  
  -- Update batch status
  UPDATE public.payout_batches
  SET 
    status = 'completed',
    processed_count = v_processed_count,
    completed_at = NOW()
  WHERE id = p_batch_id;
  
  v_result := jsonb_build_object(
    'batch_id', p_batch_id,
    'processed', v_processed_count,
    'failed', v_failed_count,
    'total', v_processed_count + v_failed_count
  );
  
  RETURN v_result;
END;
$$;