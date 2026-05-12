alter table public.pet_profiles
  add column if not exists is_active boolean not null default false;

create unique index if not exists pet_profiles_one_active_per_user
  on public.pet_profiles (user_id) where is_active;