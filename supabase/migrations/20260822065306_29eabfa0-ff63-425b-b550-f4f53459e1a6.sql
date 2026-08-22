UPDATE public.promo_listings
SET status = 'active',
    stripe_subscription_id = COALESCE(stripe_subscription_id, 'sub_1U6zfHGaXSfGtYFtzqIRx3DP'),
    active_until = COALESCE(active_until, now() + interval '30 days')
WHERE id = 'cb90729c-6ae5-4c4f-9178-48635ce37c71';