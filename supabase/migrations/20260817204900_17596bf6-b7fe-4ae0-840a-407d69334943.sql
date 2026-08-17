UPDATE public.skill_offerings
   SET featured_at = now(),
       featured_until = now() + interval '14 days',
       premium_at = now(),
       premium_until = now() + interval '30 days'
 WHERE title = 'Demo Web Design Session';