# QA — AI Pet Translator (P1)

**URL:** `/pet-translator` + `/pet-translator-pricing` | **Kredity:** 3 / preklad

## A. Prístup
1. `/pet-translator` → hero, "Record" + "Upload" CTA, history
2. Gate
3. `/pet-translator-pricing` → cenník EUR, plans

## B. Vstup audio
1. Klik Record → mic permission prompt → deny → error message
2. Allow → nahrávanie, max 30s, waveform visible
3. Stop → preview play
4. Re-record → reset
5. Upload `audio.mp3` 30s → OK
6. Upload `video.mp4` (extract audio) → OK
7. Upload >60s → error alebo trim

## C. Pet selector
1. Druh: Dog / Cat / Bird / Rabbit / Other → 5+ options
2. Breed (ak dog/cat) → dropdown 50+ breeds
3. Age: puppy/adult/senior
4. Mood pre-context (optional)

## D. Preklad
1. Klik Translate → loader, network call
2. Výsledok: text v ľudskej reči ("Som hladný!"), confidence %, emotion (happy/sad/anxious)
3. Audio playback s "ľudským" hlasom (TTS preklad)
4. Multiple interpretations (3 alternatívy)

## E. Edge cases
1. Ticho/noise only → "Nie je počuť pet" message
2. Human voice → "Toto nie je pet" detection
3. Fake .exe upload → reject
4. Network fail → kredity refund

## F. Kredity
1. 3 / preklad
2. Insufficient → buy → Stripe EUR
3. Subscription plan (pricing page) → unlimited translations

## G. History
1. Last 20 prekladov v sidebar
2. Klik na záznam → replay
3. Delete
4. Share → public link

## H. Multi-user
1. A nahrá → B nevidí
2. Share public → B otvorí

## I. RLS
1. Audio storage signed URL
2. RLS na records table

## J. i18n
1. Výstup v jazyku užívateľa (SK/EN/DE/CZ)
2. TTS voice matches jazyk

## K. Mobile
1. Mic recording funguje na iOS Safari + Android Chrome
2. Touch UI primary
