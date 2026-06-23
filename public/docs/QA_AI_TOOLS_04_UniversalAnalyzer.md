# QA — Universal Analyzer (P1)

**URL:** `/universal-analyzer` | **Kredity:** 3 / analýza

## A. Prístup
1. `/universal-analyzer` → uploader, file type icons, recent analyses
2. Gate when logged out
3. Mobile responsive

## B. Typy súborov (každý zvlášť)
1. **PDF** (`doc.pdf` 2MB) → upload → analýza → text summary, key points, sentiment
2. **Image** (`valid.jpg`) → objects detected, colors, captions
3. **Audio** (`audio.mp3` 30s) → transcript, sentiment, speaker detect
4. **Video** (`video.mp4` 60s) → frames analyzed, transcript ak je audio, summary
5. **Text** (paste 500 words) → analysis
6. **URL** (paste https://example.com) → fetch + analyze
7. **CSV** → data summary, columns, stats
8. **DOCX** → text extract + analysis

## C. Validácia
1. `fake.exe` → reject "Unsupported file type"
2. `huge.jpg` 20MB → reject alebo compress + warning
3. Corrupt PDF → "Cannot parse" error
4. Empty file → reject

## D. Výsledok
1. Klik na analysis → detail view
2. Export PDF → stiahne report
3. Export JSON → raw data
4. Copy summary → clipboard

## E. Insights
1. Sentiment chart (pozitívny/negatívny/neutrálny)
2. Keyword cloud
3. Entity recognition (person, org, location)
4. Suggested actions (CTA)

## F. Kredity
1. 3 kredity / analýza, refund on failure
2. Insufficient → buy

## G. Multi-user
1. A nahrá súbor → B nevidí (private by default)
2. A toggle Public → share link → B vidí read-only

## H. History
1. Last 10 analyses v sidebar
2. Search/filter
3. Delete

## I. Security
1. Upload path RLS — A nevidí B súbory
2. Storage signed URL
3. Žiadne XSS v rendered transcript

## J. Performance
1. 10MB PDF → analysis <30s
2. Loading state pri dlhej operácii
3. Progress bar pre upload
