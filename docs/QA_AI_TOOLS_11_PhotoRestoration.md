# QA — Photo Restoration (P1)

**URL:** `/photo-restoration` | **Kredity:** 4 / fotka

## A. Prístup
1. `/photo-restoration` → hero, before/after examples, upload
2. Gate
3. Mobile

## B. Upload
1. Single image upload
2. Drag-drop multiple (batch)
3. Camera capture mobile
4. Limit 10 batch, >10 → error
5. >20MB per file → reject

## C. Restoration options
1. **Damage levels:** Light / Medium / Heavy → ovplyvní processing intensity
2. **Colorization toggle:** B&W → color
3. **Face enhance:** ON/OFF → AI sharpens faces
4. **Upscale:** 2x / 4x → resolution
5. **Remove scratches:** toggle
6. **Remove stains:** toggle
7. Combined options → kredity ×N

## D. Spracovanie
1. Klik Restore → progress per fotka
2. Batch progress bar
3. Cancel mid-process → kredity refund pre nezačaté
4. Preview before/after compare slider
5. Download single
6. Download batch ZIP

## E. Edge cases
1. Modern (undamaged) photo → "Already good quality" info
2. Heavily damaged unrecognizable → low confidence warning
3. Non-photo (drawing) → reject alebo notice
4. PDF upload → reject (image only)

## F. Kredity
1. 4 / fotka base, +2 colorization, +2 4x upscale
2. Batch 10 = 40+ → kontrola
3. Refund on fail

## G. My Restorations
1. History gallery
2. Re-download
3. Delete
4. Re-process s inými settings

## H. Multi-user
1. A private → B nevidí
2. Share before/after

## I. Privacy
1. RLS na storage
2. Auto-delete option po N dňoch
3. GDPR delete

## J. Performance
1. 5MB image → restoration <30s
2. Batch 10 → background queue, notification

## K. i18n
