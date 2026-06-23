# QA — Handwriting Analyzer (P2)

**Komponenty:** `src/components/handwriting/*` | **Kredity:** 4 / analýza

## A. Prístup
1. Otvor handwriting hub → karty: Signature, Mood Tracker, Twin Finder, Time Capsule, Voice Diary, Public Gallery, PDF Report
2. Gate
3. Mobile

## B. SignatureAnalyzerCard
1. Upload sken podpisu (JPG/PNG)
2. Camera capture (mobile) → preview
3. Klik Analyze → loader → personality traits (10+), hex colors
4. Confidence score
5. PDF report download (PdfReportButton)
6. Share

## C. MoodTrackerCard
1. Upload denný handwriting sample
2. AI detect mood (happy/stressed/calm/anxious)
3. Chart history (7-day, 30-day)
4. Trend insights

## D. TwinFinderCard
1. Upload handwriting → match s public gallery → top 5 podobných
2. Klik match → ich profil
3. Privacy: opt-in pre matching

## E. TimeCapsuleCard
1. Napíš správu (text alebo upload handwritten image)
2. Set unlock date (future)
3. Email/notification trigger na unlock date
4. Past unlock → otvorené, AI analyzuje zmenu osobnosti vs. teraz

## F. VoiceDiaryCard
1. Record audio entry → transcript + analysis
2. History timeline
3. Sentiment over time chart

## G. PublicGalleryCard
1. Browse public handwriting samples
2. Filter by personality trait, age, region
3. Klik sample → detail, rating
4. Submit own → public after consent

## H. PdfReportButton
1. Generate report PDF (multi-page)
2. Branding, charts, recommendations
3. Download

## I. Kredity
1. 4 / analýza, refund on fail
2. PDF report extra credits?

## J. Edge cases
1. Blurry image → "Quality too low" warning
2. Non-handwriting (printed text) → reject
3. Foreign script (Cyrillic/Arabic) → handled or graceful "not supported"

## K. Multi-user
1. Twin Finder → A vidí B match ak obaja opt-in
2. Public gallery → moderation

## L. i18n
1. Analysis output v jazyku
2. PDF report localized
