# QA — Future Face (P1)

**URL:** `/future-face` | **Kredity:** 4 / generácia

## A. Prístup
1. `/future-face` → hero, upload, examples
2. Gate
3. Mobile camera capture

## B. Upload fotky
1. Upload JPG/PNG s tvárou → face detection ✓
2. Upload bez tváre → "No face detected" error
3. Upload viacero tvárí → vyber jednu
4. Camera capture mobile → OK
5. Quality: low res → warning
6. >10MB → resize

## C. Vekové slidery
1. Age slider 5–80 → preview update živo (alebo na click Generate)
2. Generate at 5, 18, 30, 50, 70, 80 → 6 verzií
3. Side-by-side compare (originál vs future)
4. Slideshow timeline (5→80 morphing)

## D. Modifikátory
1. Gender swap toggle → ženská/mužská verzia
2. Ethnicity dropdown (zmena alebo blend) — citlivá feature, test moderation
3. Hairstyle presets
4. Beard/no beard
5. Aging factors (lifestyle: healthy/smoker/sun exposure) → ovplyvní výsledok

## E. Výsledok
1. Download JPG
2. Save to gallery
3. Share — public link, social share buttons
4. Compare slider (drag medzi pred/po)

## F. Edge cases
1. Animal face → reject
2. Cartoon → reject alebo low confidence
3. Slnečné okuliare/maska → warning

## G. Kredity
1. 4 / gen, batch (6 vekov) = 24?  → test pricing
2. Insufficient → buy

## H. Privacy & security
1. Upload deletion po 24h auto-delete?
2. RLS na fotky
3. Žiadne face data v public ML training (privacy notice)
4. GDPR delete request → fotky zmazané

## I. Multi-user
1. A upload → B nevidí
2. Share link verejný → B vidí výsledok

## J. i18n
