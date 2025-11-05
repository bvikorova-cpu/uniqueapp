-- Create time capsules table
CREATE TABLE IF NOT EXISTS public.time_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  capsule_type TEXT NOT NULL CHECK (capsule_type IN ('text', 'video', 'letter', 'mixed')),
  delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  is_delivered BOOLEAN DEFAULT FALSE,
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_id TEXT,
  duration_years INTEGER NOT NULL,
  price_paid DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time capsule files table for video/image attachments
CREATE TABLE IF NOT EXISTS public.time_capsule_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_id UUID NOT NULL REFERENCES public.time_capsules(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('video', 'image', 'document', 'audio')),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time capsule subscriptions table for premium users
CREATE TABLE IF NOT EXISTS public.time_capsule_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  capsules_created INTEGER DEFAULT 0,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsule_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsule_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_capsules
CREATE POLICY "Users can view their own capsules"
  ON public.time_capsules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own capsules"
  ON public.time_capsules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capsules"
  ON public.time_capsules FOR UPDATE
  USING (auth.uid() = user_id AND is_delivered = FALSE);

CREATE POLICY "Users can delete their own undelivered capsules"
  ON public.time_capsules FOR DELETE
  USING (auth.uid() = user_id AND is_delivered = FALSE);

-- RLS Policies for time_capsule_files
CREATE POLICY "Users can view files of their capsules"
  ON public.time_capsule_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.time_capsules
      WHERE time_capsules.id = time_capsule_files.capsule_id
      AND time_capsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files for their capsules"
  ON public.time_capsule_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.time_capsules
      WHERE time_capsules.id = time_capsule_files.capsule_id
      AND time_capsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their capsules"
  ON public.time_capsule_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.time_capsules
      WHERE time_capsules.id = time_capsule_files.capsule_id
      AND time_capsules.user_id = auth.uid()
    )
  );

-- RLS Policies for time_capsule_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.time_capsule_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.time_capsule_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.time_capsule_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_time_capsule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_time_capsules_updated_at
  BEFORE UPDATE ON public.time_capsules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_time_capsule_updated_at();

CREATE TRIGGER update_time_capsule_subscriptions_updated_at
  BEFORE UPDATE ON public.time_capsule_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_time_capsule_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_capsules_user_id ON public.time_capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_time_capsules_delivery_date ON public.time_capsules(delivery_date);
CREATE INDEX IF NOT EXISTS idx_time_capsules_is_delivered ON public.time_capsules(is_delivered);
CREATE INDEX IF NOT EXISTS idx_time_capsule_files_capsule_id ON public.time_capsule_files(capsule_id);
CREATE INDEX IF NOT EXISTS idx_time_capsule_subscriptions_user_id ON public.time_capsule_subscriptions(user_id);