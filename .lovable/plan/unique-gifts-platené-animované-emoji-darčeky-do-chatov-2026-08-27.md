# Unique Gifts — platené animované emoji/darčeky do chatov

Vlastná kolekcia darčekových "emoji" (originálne, nie TikTok/Disney assety), kupovaná a odosielaná za kredity priamo v chatoch platformy.

## Katalóg

Kategórie (taby v shope):
- **Classic** — ruža, srdce, tortička, kávička, tlieskanie, pusa (1–5 kreditov)
- **Fairytale** — vlastné rozprávkové motívy: princezná v obláčiku, dráčik, jednorožec, čarovná lampa, zámok v mrakoch, čarovná kniha, víla, žabí princ (5–25). Žiadne Disney/licencované postavy — originálne dizajny, vlastné mená.
- **Music & Party** — mikrofón, DJ set, gramofón, konfety, ohňostroj (5–20)
- **Luxury** — diamant, zlatá koruna, šampanské, športové auto, raketa (25–100)
- **Seasonal** — rotujúca sezónna sada (Halloween, Vianoce, Valentín)

Každý darček: názov, kategória, cena v kreditoch, rarity (common/rare/epic/legendary), PNG s transparentným pozadím + CSS animácia (float, pulse, spin, burst).

## Ako to bude fungovať

1. V chate (DM aj group) sa v composeri pridá tlačidlo 🎁 → otvorí **Gift Shop** panel: kategórie, mriežka, cena, aktuálny zostatok kreditov, tlačidlo "Nabiť kredity" → `/ai-credits`.
2. Klik na darček → potvrdzovací dialóg s cenou → odoslanie.
3. Darček sa v konverzácii zobrazí ako veľká animovaná bublina s menom darčeka a odosielateľa (nie ako obyčajný text).
4. Príjemca dostane notifikáciu do zvončeka ("X ti poslal darček Ruža").
5. Príjemca získa **50 % hodnoty** darčeka ako earnings (rovnaká logika ako Unlock Videos, výplata cez existujúci creator payout od €20).

## Technická časť

Nové tabuľky (public, s GRANT + RLS):
- `gift_catalog` — id, slug, name, category, price_credits, rarity, image_url, animation, is_active, sort_order. Public read (anon+authenticated), zápis len admin.
- `gift_transactions` — id, sender_id, recipient_id, gift_id, conversation_id, message_id, credits_spent, creator_share_credits, created_at. Read len sender/recipient, insert cez RPC.

RPC `send_chat_gift(p_gift_id, p_recipient_id, p_conversation_id)` — SECURITY DEFINER, atomicky: overí zostatok `ai_credits`, odpíše kredity, zapíše riadok do `ai_credits_ledger` (`reason='chat_gift'`, `source='gift_shop'`), založí `gift_transactions`, vloží správu do `conversation_messages` s `gift_id`, pripíše 50 % príjemcovi ako earnings. Nedostatok kreditov → chyba, ktorú UI premení na výzvu nabiť kredity.

Rozšírenie `conversation_messages` o `gift_id` (nullable FK), aby sa darček renderoval ako gift bublina.

Frontend:
- `src/components/gifts/GiftShopSheet.tsx` — panel s kategóriami a mriežkou
- `src/components/gifts/GiftBubble.tsx` — animovaná bublina v chate
- `src/hooks/useGiftCatalog.ts`, `useSendGift.ts`
- Integrácia do messengeru (DM + group chat), neskôr sa dá pripojiť aj na Megatalent/live sekcie bez zmeny logiky.

Assety: vygenerujem sadu vlastných 3D-style PNG s transparentným pozadím a nahrám cez Lovable Assets (CDN), aby nezaťažovali repo.

Prvá dávka: ~24 darčekov (4 kategórie × 6). Ďalšie sa pridávajú len INSERTom do `gift_catalog`, bez zmeny kódu.

## Mimo rozsahu
- Žiadne kopírovanie TikTok/Disney assetov ani mien.
- Žiadna zmena existujúcich chat funkcií okrem pridania tlačidla 🎁 a gift bubliny.
