-- Legal acceptances (signed receipts)
CREATE TABLE public.legal_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL DEFAULT 'UNITY V2.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  receipt_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own acceptances"
ON public.legal_acceptances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own acceptances"
ON public.legal_acceptances FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_legal_acceptances_user ON public.legal_acceptances(user_id, document_type);

-- Legal AI chat history
CREATE TABLE public.legal_ai_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'qa',
  credits_used INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own legal chats"
ON public.legal_ai_chats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legal chats"
ON public.legal_ai_chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_legal_ai_chats_user ON public.legal_ai_chats(user_id, document_type, created_at DESC);