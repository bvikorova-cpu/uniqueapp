# CDN vrstva pre médiá (Cloudflare + Supabase Storage)

`VITE_CDN_BASE_URL` je nastavená na `https://cdn.uniqueapp.fun`.
Helper `src/lib/cdnUrl.ts` je zatiaľ nikde nepoužitý, takže zapnutie premennej
NEMENÍ chovanie appky — je to len príprava. Až keď bude Worker + DNS live,
prepneme jednotlivé komponenty na `getCdnUrl(...)` (jeden po druhom, s overením).

## 1. Cloudflare Worker (proxy s image resizing)

1. Cloudflare Dashboard → Workers & Pages → Create Worker.
2. Vlož obsah `cloudflare/image-proxy-worker.js`.
3. Settings → Variables → pridaj:
   `SUPABASE_STORAGE_BASE = https://jufrdzeonywluwutvyxz.supabase.co/storage/v1/object/public`
4. Triggers → Custom domain / Route: `cdn.uniqueapp.fun/*`
5. Speed → Optimization → zapni **Image Resizing** (Pro plán a vyššie).

Test po nasadení:
`https://cdn.uniqueapp.fun/<bucket>/<cesta>.jpg?w=640` má vrátiť obrázok
s hlavičkou `X-CDN: uniqueapp-cf`.

## 2. Videá (egress)

Worker cachuje aj videá (30 dní, `immutable`), takže opakované prehratia
už nejdú na Supabase → šetrí egress. Pri veľkom raste presuň videá do
**Cloudflare R2** (bez egress poplatkov) a v Workeri zmeň `SUPABASE_STORAGE_BASE`
na R2 public/custom domain — kód appky sa nemení.

## 3. Rollback

Odstráň riadok `VITE_CDN_BASE_URL` z `.env` → všetko sa vráti na priame
Supabase URL (helper je no-op).

## 4. Odporúčané limity bucketov (nastav v Supabase Dashboard → Storage → bucket → Settings)

Limity bucketov sa nedajú menit z migrácií (Supabase to blokuje), preto ich
nastav v dashboarde. Odporúčané hodnoty:

### Video buckety — limit 50 MB, MIME: `video/mp4, video/webm, video/quicktime`
- `videos`, `course-videos`, `property-videos`, `comedy-videos`,
  `video-resumes`, `kitchen-battles`

### Foto buckety — limit 10 MB, MIME: `image/jpeg, image/png, image/webp`
- `property-images`, `marketplace-images`, `bazaar_images`, `avatars`,
  `covers`, `pet-photos`, `antiques`, `coloring-images`, `kids-drawings`,
  `beauty-photos`, `guess-age-photos`, `old-photos`, `future-face-photos`

### Zmiešané (foto + video) — limit 50 MB, MIME: `image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm`
- `wall-media`, `media`, `eco-media`, `healthy-media`, `chat-media`,
  `best-friend-media`, `creator-media`, `messenger-attachments`,
  `recipe-media`, `user-uploads`

Poznámka: limit platí len pre NOVÉ uploady, existujúce súbory zostávajú.
