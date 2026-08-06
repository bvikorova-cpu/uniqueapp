do $$
begin
  begin execute 'alter publication supabase_realtime add table public.emotion_roulette_spins'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.emotion_mood_generations'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.emotion_exchange_matches'; exception when duplicate_object then null; end;
end $$;