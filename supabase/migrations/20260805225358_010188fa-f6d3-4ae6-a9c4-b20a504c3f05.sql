GRANT SELECT, INSERT, UPDATE, DELETE ON public.messenger_chat_themes TO authenticated;
GRANT ALL ON public.messenger_chat_themes TO service_role;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.messenger_chat_themes'::regclass AND contype IN ('p','u')
      AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid='public.messenger_chat_themes'::regclass AND attname='user_id')]
  ) THEN
    ALTER TABLE public.messenger_chat_themes ADD CONSTRAINT messenger_chat_themes_user_id_key UNIQUE (user_id);
  END IF;
END $$;