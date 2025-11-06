-- Add column to track expiration notifications
ALTER TABLE public.job_listing_payments
ADD COLUMN IF NOT EXISTS expiration_notification_sent_at TIMESTAMP WITH TIME ZONE;