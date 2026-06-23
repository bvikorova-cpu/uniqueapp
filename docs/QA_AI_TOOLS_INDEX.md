# QA AI Tools & Studios — Master Index

**Cieľ:** Kompletné manuálne pretestovanie 17 AI modulov + cross-modul interakcií.

## Príprava (raz)
- **3 účty:**
  - **A** — Chrome, 100+ kreditov, plný profil
  - **B** — Firefox/incognito, 30 kreditov
  - **C** — Safari/druhý incognito, 5 kreditov (test "insufficient credits")
- **Karty Stripe (test):** `4242 4242 4242 4242` OK, `4000 0000 0000 0002` decline, `4000 0027 6000 3184` 3DS
- **Súbory na upload:** `valid.jpg` <5MB, `huge.jpg` 20MB, `fake.exe`, `corrupt.png`, `audio.mp3` 30s, `video.mp4` 60s, `doc.pdf` 2MB
- **DevTools otvorené:** Console + Network tabs, sledovať `402` (kredity), `429` (rate-limit), `500`
- **Viewport:** desktop 1280px + mobile 360px, light + dark theme
- **Jazyk:** EN default, prepnúť SK/CZ/DE pre i18n check
- **Currency:** EUR enforced (žiadne USD/CZK)

## Moduly (klikni na link pre detailný plán)

| # | Modul | Súbor | Kredity/gen | Priorita |
|---|---|---|---|---|
| 1 | CreativeForge | [QA_CreativeForge.md](./QA_AI_TOOLS_01_CreativeForge.md) | 3–5 | 🔴 P0 |
| 2 | Content Studio | [QA_ContentStudio.md](./QA_AI_TOOLS_02_ContentStudio.md) | 3 | 🔴 P0 |
| 3 | AI Generation | [QA_AIGeneration.md](./QA_AI_TOOLS_03_AIGeneration.md) | 4 | 🔴 P0 |
| 4 | Universal Analyzer | [QA_UniversalAnalyzer.md](./QA_AI_TOOLS_04_UniversalAnalyzer.md) | 3 | 🟡 P1 |
| 5 | Video Ad Generator | [QA_VideoAdGenerator.md](./QA_AI_TOOLS_05_VideoAdGenerator.md) | 5 | 🔴 P0 |
| 6 | AI Tattoo | [QA_AITattoo.md](./QA_AI_TOOLS_06_AITattoo.md) | 4 | 🟢 P2 |
| 7 | AI Personality Clone | [QA_PersonalityClone.md](./QA_AI_TOOLS_07_PersonalityClone.md) | 5 | 🔴 P0 |
| 8 | AI Pet Translator | [QA_PetTranslator.md](./QA_AI_TOOLS_08_PetTranslator.md) | 3 | 🟡 P1 |
| 9 | Handwriting Analyzer | [QA_Handwriting.md](./QA_AI_TOOLS_09_Handwriting.md) | 4 | 🟢 P2 |
| 10 | Future Face | [QA_FutureFace.md](./QA_AI_TOOLS_10_FutureFace.md) | 4 | 🟡 P1 |
| 11 | Photo Restoration | [QA_PhotoRestoration.md](./QA_AI_TOOLS_11_PhotoRestoration.md) | 4 | 🟡 P1 |
| 12 | Stock Content Library | [QA_StockLibrary.md](./QA_AI_TOOLS_12_StockLibrary.md) | 1–3 | 🟢 P2 |
| 13 | Virtual Influencer Agency | [QA_VirtualInfluencer.md](./QA_AI_TOOLS_13_VirtualInfluencer.md) | 5 | 🔴 P0 |
| 14 | Brand Builder | [QA_BrandBuilder.md](./QA_AI_TOOLS_14_BrandBuilder.md) | 5 | 🔴 P0 |
| 15 | Home Designer | [QA_HomeDesigner.md](./QA_AI_TOOLS_15_HomeDesigner.md) | 4 | 🟡 P1 |
| 16 | Beauty Studio | [QA_BeautyStudio.md](./QA_AI_TOOLS_16_BeautyStudio.md) | 3 | 🟢 P2 |
| 17 | Fashion Studio | [QA_FashionStudio.md](./QA_AI_TOOLS_17_FashionStudio.md) | 3 | 🟢 P2 |

## Cross-modul interakcie (po dokončení per-modul)
- [QA_CrossModule.md](./QA_AI_TOOLS_99_CrossModule.md) — export/import medzi modulmi, shared brand, multi-user race conditions

## Globálne kontroly (raz na konci)
- **i18n:** prepni jazyk → všetky tlačidlá/labels preložené, žiadne `t('key.missing')` v Console
- **Currency:** žiadne `$` alebo `Kč` v UI, len `€`
- **Age gate:** odhlás → moduly s 16+/NSFW vyžadujú vek
- **Performance:** Lighthouse mobile >70, TTI <5s, CLS <0.1
- **Accessibility:** Tab navigácia, screen reader labels, kontrast WCAG AA
- **Security:** odhlás → API volania vrátia 401, žiadne creds v localStorage v plaintexte

## Reporting formát
```
Modul: [napr. CreativeForge]
Sekcia: [napr. B/3]
Krok: [napr. krok 5]
URL: https://uniqueapp.fun/...
Účet: A (100 kreditov pred akciou)
Reprodukcia:
  1. ...
  2. ...
  3. ...
Očakávané: ...
Skutočné: ...
Console error: ...
Network: POST /api/... 500
Screenshot: [priložiť]
```

**Postup:** P0 moduly najprv (1, 2, 3, 5, 7, 13, 14) → P1 → P2 → Cross-modul → Globálne.
