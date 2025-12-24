-- Rate limiting table for server-side protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- user_id or IP address
    action_type TEXT NOT NULL, -- 'checkout', 'ai_generation', 'api_call', etc.
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT rate_limits_unique UNIQUE (identifier, action_type, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
USING (identifier = auth.uid()::text OR identifier = current_setting('request.headers', true)::json->>'x-forwarded-for');

-- Policy: Allow inserts for rate limit tracking
CREATE POLICY "Allow rate limit inserts"
ON public.rate_limits
FOR INSERT
WITH CHECK (true);

-- Policy: Allow updates for rate limit tracking
CREATE POLICY "Allow rate limit updates"
ON public.rate_limits
FOR UPDATE
USING (true);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, action_type, window_start);
CREATE INDEX idx_rate_limits_cleanup ON public.rate_limits (window_start);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_requests INTEGER,
    p_window_minutes INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_count INTEGER;
    v_remaining INTEGER;
    v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start (truncate to window interval)
    v_window_start := date_trunc('minute', now()) - 
        ((EXTRACT(MINUTE FROM now())::INTEGER % p_window_minutes) || ' minutes')::INTERVAL;
    
    v_reset_at := v_window_start + (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get current count in window
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limits
    WHERE identifier = p_identifier 
        AND action_type = p_action
        AND window_start >= v_window_start;
    
    -- Check if limit exceeded
    IF v_count >= p_max_requests THEN
        RETURN json_build_object(
            'allowed', false,
            'remaining', 0,
            'reset_at', v_reset_at,
            'current_count', v_count
        );
    END IF;
    
    -- Increment counter
    INSERT INTO public.rate_limits (identifier, action_type, window_start, request_count)
    VALUES (p_identifier, p_action, v_window_start, 1)
    ON CONFLICT (identifier, action_type, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    
    v_remaining := p_max_requests - v_count - 1;
    
    RETURN json_build_object(
        'allowed', true,
        'remaining', v_remaining,
        'reset_at', v_reset_at,
        'current_count', v_count + 1
    );
END;
$$;

-- Function to clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;