-- Add foreign key reference from bazaar_items to profiles
ALTER TABLE public.bazaar_items
DROP CONSTRAINT IF EXISTS bazaar_items_user_id_fkey;

ALTER TABLE public.bazaar_items
ADD CONSTRAINT bazaar_items_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;