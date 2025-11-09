-- Add related_id column to notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS related_id UUID;