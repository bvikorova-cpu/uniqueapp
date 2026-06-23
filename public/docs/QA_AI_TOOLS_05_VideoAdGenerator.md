# QA — Video Ad Generator (P0)

**URL:** `/video-ad-generator` | **Kredity:** 5–15 (podľa dĺžky/quality)

## A. Prístup
1. `/video-ad-generator` → templates, "Create new"
2. Gate
3. Mobile → simplified editor

## B. Tvorba projektu
1. Klik "New ad" → wizard step 1: vyber template (10+ templates)
2. Step 2: vyplň product/service text, target audience
3. Step 3: upload product images (1-5) alebo vyber stock
4. Step 4: vyber music track (knižnica)
5. Step 5: vyber voiceover voice (M/F, jazyk)
6. Klik Generate Storyboard → AI navrhne scény (4-8)
7. Edit scénu → text, image, duration → save

## C. Timeline editor
1. Drag scénu pre re-order
2. Pridaj novú scénu → "+ Scene"
3. Zmaž scénu → trash icon
4. Set duration per scene (1-10s)
5. Transitions dropdown (fade, slide, zoom) → preview
6. Background music volume slider → preview audio
7. Voiceover text per scene → preview TTS

## D. Export formáty
1. 9:16 (TikTok/Reels) → render → preview portrait
2. 16:9 (YouTube) → render → landscape
3. 1:1 (IG square) → render → square
4. 4:5 (IG portrait) → render
5. Quality: 720p / 1080p / 4K → kredity rozdiel, render time rozdiel
6. Download MP4 → file size primeraný

## E. Render queue
1. Klik Render → progress bar, estimated time
2. Veľa renderov naraz → queue, FIFO
3. Render fail → error, kredity refund
4. Render success → notification, download link
5. Render >5 min → background, notification keď hotové

## F. Kredity
1. 720p = 5, 1080p = 10, 4K = 15 → kontrola pred renderom
2. Insufficient → buy
3. Refund on render failure → overiť v history

## G. Multi-user
1. A renderuje → B súčasne → obaja v queue, izolované
2. A public share → B prehrá video
3. A delete project → B share link 404

## H. My Projects
1. Save draft → v "My Projects"
2. Edit existing → continue from where left
3. Duplicate project → copy with " (Copy)" suffix
4. Delete → confirm

## I. Persistencia
1. Refresh počas editácie → autosave alebo prompt na save
2. Logout/login → projects perzistujú

## J. i18n & TTS
1. Voiceover SK/CZ/DE/EN → správna výslovnosť
2. UI preložené
