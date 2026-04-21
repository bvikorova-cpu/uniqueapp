CREATE TABLE IF NOT EXISTS public.app_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error','warning','info')),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  route TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_error_logs_created_at ON public.app_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_error_logs_user_id ON public.app_error_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_app_error_logs_severity ON public.app_error_logs (severity);

ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (auth or anon) can insert their own error log entries
CREATE POLICY "Anyone can insert error logs"
ON public.app_error_logs FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Users can view their own error logs
CREATE POLICY "Users can view own error logs"
ON public.app_error_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all error logs
CREATE POLICY "Admins can view all error logs"
ON public.app_error_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete error logs (cleanup)
CREATE POLICY "Admins can delete error logs"
ON public.app_error_logs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));