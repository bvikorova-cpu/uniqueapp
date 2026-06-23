# QA — AI Generation (P0)

**URL:** `/ai-generation` | **Kredity:** 4 / generácia

## A. Prístup
1. `/ai-generation` → prompt area, model selector, gallery
2. Odhlás → gate
3. Mobile → vertical layout

## B. Prompt engineering
1. Krátky prompt "cat" → Generate → výsledok
2. Dlhý prompt 500 slov → OK alebo orezané
3. Negative prompt → vyplň → výsledok zohľadní
4. Special chars / emojis → handled
5. NSFW prompt (test) → blokované, message
6. Prompt v SK/CZ → AI rozumie

## C. Model variants
1. Model dropdown → vyber Flux/SDXL/iný → každý generuje iné výsledky
2. Aspect ratio: 1:1, 16:9, 9:16, 4:3 → preview rozmer správny
3. Quality: low/medium/high → cena kreditov sa mení (2/4/8?)
4. Batch count: 1 / 4 → 4 obrázky generované, kredity ×4

## D. Výsledok
1. Generated image → preview full size na klik
2. Download → PNG/JPG download
3. Upscale button → 2x rozlíšenie, extra kredity
4. Variations (4 podobné) → nová generácia
5. Save to Gallery → v `/my-creations`
6. Share → public link

## E. Edge cases
1. Prázdny prompt → disabled
2. Rapid click Generate → rate limit / queue
3. Server timeout >60s → error, kredity refund

## F. Kredity & billing
1. Insufficient → buy dialog EUR
2. Refund pri failed gen → overiť v `/credits` history

## G. Multi-user
1. A generuje → B súčasne → izolované výsledky
2. A public share → B otvorí URL → vidí

## H. Gallery
1. Generated 10x → gallery 10 items
2. Filter by model/date → funguje
3. Delete → confirmuje
4. Bulk delete → multi-select

## I. RLS
1. URL gallery z A account → B nevidí
2. Storage signed URL expires
