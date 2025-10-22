-- Remove duplicate shows (keep only one version of each)
DELETE FROM kids_shows WHERE id IN (
  '7d4873ba-964c-47f2-b0b0-ae3faa0f1960',  -- Aladdin (adventure - keeping Disney)
  'fec932c7-4ffd-426f-9641-224b366d629a',  -- Alice in Wonderland (fantasy - keeping Disney)
  'd06d3187-8730-40e3-8342-e9915753c8db',  -- Bambi (fantasy - keeping Disney)
  'd953d239-562f-4c30-82ff-0fd9eff20819',  -- Beauty and the Beast (fantasy - keeping Disney)
  '31242df6-7cf5-4c8f-97ee-7ac4d9fe5261',  -- Cinderella (fantasy - keeping Disney)
  '717e125c-ca61-4e10-9d73-70a06ef41277',  -- Dumbo (fantasy - keeping Disney)
  'd0287595-4f9d-49c3-a652-ab3c1bdd6c36'   -- Pinocchio (fantasy - will add to Disney if not exists)
);