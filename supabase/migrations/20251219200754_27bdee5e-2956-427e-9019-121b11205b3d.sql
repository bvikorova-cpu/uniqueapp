-- Add 999 credits to admin user - corrected version
DO $$
DECLARE
  v_user_id UUID := '3c23b29d-c9e2-4495-8772-143464d08486';
BEGIN
  -- AI Credits
  DELETE FROM public.ai_credits WHERE user_id = v_user_id;
  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- AI Studio Credits
  DELETE FROM public.ai_studio_credits WHERE user_id = v_user_id;
  INSERT INTO public.ai_studio_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Analyzer Credits
  DELETE FROM public.analyzer_credits WHERE user_id = v_user_id;
  INSERT INTO public.analyzer_credits (user_id, credits_remaining, total_credits_purchased, tier)
  VALUES (v_user_id, 999, 999, 'expert');

  -- Anonymous Dating Credits
  DELETE FROM public.anonymous_dating_credits WHERE user_id = v_user_id;
  INSERT INTO public.anonymous_dating_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Antique Credits
  DELETE FROM public.antique_credits WHERE user_id = v_user_id;
  INSERT INTO public.antique_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Astrology Credits
  DELETE FROM public.astrology_credits WHERE user_id = v_user_id;
  INSERT INTO public.astrology_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Brain Duel Credits
  DELETE FROM public.brain_duel_credits WHERE user_id = v_user_id;
  INSERT INTO public.brain_duel_credits (user_id, credits)
  VALUES (v_user_id, 999);

  -- Character Credits
  DELETE FROM public.character_credits WHERE user_id = v_user_id;
  INSERT INTO public.character_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Coloring Credits
  DELETE FROM public.coloring_credits WHERE user_id = v_user_id;
  INSERT INTO public.coloring_credits (user_id, credits_remaining)
  VALUES (v_user_id, 999);

  -- Cooking Credits
  DELETE FROM public.cooking_credits WHERE user_id = v_user_id;
  INSERT INTO public.cooking_credits (user_id, credits)
  VALUES (v_user_id, 999);

  -- Creative Forge Credits
  DELETE FROM public.creative_forge_credits WHERE user_id = v_user_id;
  INSERT INTO public.creative_forge_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Emotion Credits
  DELETE FROM public.emotion_credits WHERE user_id = v_user_id;
  INSERT INTO public.emotion_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- F1 User Credits
  DELETE FROM public.f1_user_credits WHERE user_id = v_user_id;
  INSERT INTO public.f1_user_credits (user_id, credits)
  VALUES (v_user_id, 999);

  -- Handwriting Credits
  DELETE FROM public.handwriting_credits WHERE user_id = v_user_id;
  INSERT INTO public.handwriting_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- IQ Credits (column: balance)
  DELETE FROM public.iq_credits WHERE user_id = v_user_id;
  INSERT INTO public.iq_credits (user_id, balance)
  VALUES (v_user_id, 999);

  -- Lie Detector Credits
  DELETE FROM public.lie_detector_credits WHERE user_id = v_user_id;
  INSERT INTO public.lie_detector_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Messenger AI Credits
  DELETE FROM public.messenger_ai_credits WHERE user_id = v_user_id;
  INSERT INTO public.messenger_ai_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Past Life Credits
  DELETE FROM public.past_life_credits WHERE user_id = v_user_id;
  INSERT INTO public.past_life_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Photo Credits
  DELETE FROM public.photo_credits WHERE user_id = v_user_id;
  INSERT INTO public.photo_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Secret Santa Credits
  DELETE FROM public.secret_santa_credits WHERE user_id = v_user_id;
  INSERT INTO public.secret_santa_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Shadow Credits (column: balance)
  DELETE FROM public.shadow_credits WHERE user_id = v_user_id;
  INSERT INTO public.shadow_credits (user_id, balance, total_earned)
  VALUES (v_user_id, 999, 999);

  -- Tutoring Credits
  DELETE FROM public.tutoring_credits WHERE user_id = v_user_id;
  INSERT INTO public.tutoring_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);

  -- Video Ad Credits
  DELETE FROM public.video_ad_credits WHERE user_id = v_user_id;
  INSERT INTO public.video_ad_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (v_user_id, 999, 999);
END $$;