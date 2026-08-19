# Fix empty lessons after course publishing

## Changes
- Repair the newest affected course so its real uploaded lesson is first and the two empty template lessons are removed.
- Replace the three prefilled builder lessons with one neutral lesson draft.
- Block publishing when any lesson has no video, lesson text, document, or valid quiz.
- Remove the misleading locked-preview message from the enrolled lesson player and show an accurate empty-material state instead.
- Verify the saved lesson, video, text, and quiz counts in Supabase and run the focused course checks.

## Technical details
- Keep existing enrollment and the real lesson ID intact.
- Update course totals after removing only confirmed empty template rows.
- Preserve edit-mode in-place lesson updates so student progress is not reset.
