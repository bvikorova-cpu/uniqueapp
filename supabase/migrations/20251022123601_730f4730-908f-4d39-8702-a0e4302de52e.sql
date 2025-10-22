-- Remove specific shows from kids_shows table
DELETE FROM kids_shows WHERE id IN (
  'c201eff3-234c-450d-b51f-71da31aaa014', -- The Rescuers
  'c4dbfd59-f9b0-4b60-8a1a-b4bd4924014f', -- Robin Hood
  '311dbf90-f8cf-4f1c-bc01-f2950ba69099', -- The Aristocats
  '5c955086-4888-42c2-bdc1-8f61dcb290f5', -- Meet the Robinsons
  'cbe390d5-95ac-4b11-9c29-01d128cd2cc5', -- Treasure Planet
  '17111a36-1ea7-4517-bc0b-d02eccb0da8c', -- The Hunchback of Notre Dame
  '16091e5e-d313-470e-bf13-4bfb4baf68bb', -- Hercules
  'c3d98e45-4a12-4a6c-8790-2f3583d8a09f', -- Raya and the Last Dragon
  'e928add4-8d02-4922-89ec-0a61deda8389', -- Elemental
  'c27fa996-87f3-4fa9-bbc5-df67d55a3e2e', -- Wish
  '602d7aaf-06dc-425e-9568-36f8759f1e32', -- Strange World
  '50607cfc-3fa6-41eb-b782-fe29dd636bf1', -- The Fox and the Hound
  'daa99a29-2176-445b-a074-ba88219c72df'  -- Oliver & Company
);