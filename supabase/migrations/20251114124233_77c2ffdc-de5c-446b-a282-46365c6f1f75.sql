-- Force type regeneration by creating and dropping a temporary table
CREATE TABLE public._temp_force_types_regen (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
DROP TABLE public._temp_force_types_regen;