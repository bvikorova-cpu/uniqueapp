# Cloudflare R2 integrácia — plán

## Cieľ
Pridať Cloudflare R2 ako primárne úložisko pre nové médiá (videá, obrázky) bez prerušenia existujúcej Supabase Storage infraštruktúry.

## Zásady
- Žiadny breaking change — existujúce Supabase Storage URL a buckety ostanú funkčné.
- R2 bude **opt-in** pre nové uploady cez feature flag / env var.
- Všetky existujúce komponenty (`getCdnUrl`, `resolveStorageUrl`, atď.) ostanú nezmenené.

## Fáza 1 — Cloudflare účet (používateľ)
1. Registrácia na https://dash.cloudflare.com/sign-up.
2. R2 → Create bucket (napr. `uniqueapp-media-prod`).
3. R2 → Manage R2 API Tokens → Create API token s oprávnením `Object Read & Write:Edit` pre daný bucket.
4. Zapísať si:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name
   - Public custom domain (voliteľné, napr. `r2.uniqueapp.fun`)

## Fáza 2 — Edge funkcia `upload-to-r2`
- Nová Supabase Edge Function: `supabase/functions/upload-to-r2/index.ts`.
- Použije AWS SDK for JS v3 (`@aws-sdk/client-s3`) cez `npm:` import.
- Endpoint prijme multipart/form-data, overí JWT, uploadne objekt do R2.
- Vráti public URL alebo signed URL.
- CORS hlavičky z `@supabase/supabase-js@2/cors`.

## Fáza 3 — Secrets
- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_PUBLIC_DOMAIN` (voliteľné)

## Fáza 4 — Client helper
- `src/lib/r2Upload.ts`:
  - `uploadToR2(file, pathPrefix)` — volá edge funkciu, vracia URL.
  - `shouldUseR2()` — kontroluje `import.meta.env.VITE_USE_R2_UPLOADS === "true"`.
- Fallback na `supabase.storage.from(...).upload(...)` ak R2 nie je nakonfigurované alebo zlyhá.

## Fáza 5 — Postupná migrácia komponentov
- Začať s jedným uploadovým flow (napr. Wall media alebo Unlock Videos).
- Použiť `uploadToR2` namiesto Supabase Storage uploadu.
- Uložiť R2 public URL do DB ako `media_url`.
- `getCdnUrl` už funguje pass-through pre externé URL, takže R2 public domain bude priamo použiteľné.

## Fáza 6 — Testovanie
- E2E test uploadu cez Playwright.
- Overenie, že Supabase Storage uploady stále fungujú.
- Overenie RLS a auth pri edge funkcii.

## Riziká
- Bez custom domain budú R2 URL mať tvar `<account>.r2.cloudflarestorage.com`, čo môže byť blokované niektorými firewami.
- R2 nemá natívny image resizing — na to zostáva Cloudflare Worker (`cdn.uniqueapp.fun`) alebo Image Resizing cez custom domain.

## Ďalší krok
Používateľ musí vytvoriť Cloudflare účet a bucket. Potom sa nasadia secrets a fáza 2+.
