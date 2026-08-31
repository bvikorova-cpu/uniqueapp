---
name: Cloudflare R2 storage routing
description: All uploads route to R2 via a supabase.storage interceptor; reads resolve through r2Registry
type: feature
---

# Cloudflare R2 storage

- `VITE_USE_R2_UPLOADS=true` → `src/integrations/supabase/client.ts` proxies
  `supabase.storage.from(bucket)`: `upload()` goes to the `upload-to-r2` edge function
  (key mirrors `<bucket>/<path>`), `getPublicUrl()` / `createSignedUrl()` return the R2
  public URL for R2 objects. Any R2 failure falls back to Supabase Storage — never breaks a flow.
- `src/lib/r2Registry.ts` — localStorage map `bucket/path -> R2 public URL` + `isR2Url()`.
  Must not import the supabase client (circular).
- Reads: `src/lib/storageSigned.ts` (`resolveStorageUrl`, `getReadableUrl`) and
  `ChallengeMedia` check the registry / R2 URLs before signing Supabase URLs.
- Public base: `https://pub-b2b58860b24c4a54ac6a042d0e32e5fb.r2.dev`, bucket `uniqueapp-media-prod`.
- Edge function accepts `image/*`, `video/*`, `audio/*`, PDF/doc/csv/zip, max 500 MB.
- Legacy files stay in Supabase Storage and keep working.
