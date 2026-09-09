# AI Health & Medical Assistant — implementačný plán

Nový samostatný modul na `/ai-health` (Navbar + search registrácia), postavený výhradne na existujúcej peňaženke `ai_credits`. Žiadny nový kreditový systém, žiadne nové purchase modaly, žiadne Stripe flow.

## 1. Kredity (existujúca infrastruktúra)

- Frontend: `useAICredits()` (`credits_remaining`) na zobrazenie zostatku a pre-check.
- Server: `_shared/spendCredits.ts → spendAiCredits(admin, userId, amount, reason, source)` — zapíše ledger row.
- Ceny: chat 1, lab dokument 2, ECG/medical image 3 kredity.
- Nedostatok kreditov: server vráti `402 { error: "insufficient_credits" }`, frontend použije existujúci tok — toast + navigácia na `/ai-credits` (rovnaký vzor ako Comedy coins / ostatné moduly).
- Odpočet len po úspešnej AI odpovedi (spend po návrate modelu, pred uložením záznamu).

## 2. Databáza (1 migrácia)

```sql
create table public.health_ai_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('symptom_chat','lab_document','medical_image')),
  title text,
  input_meta jsonb not null default '{}'::jsonb,   -- file name, mime, storage path
  result jsonb not null default '{}'::jsonb,       -- summary, findings[], severity, plain_language, next_steps[]
  severity text check (severity in ('low','medium','high')),
  credits_spent integer not null default 0,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.health_ai_scans to authenticated;
grant all on public.health_ai_scans to service_role;
alter table public.health_ai_scans enable row level security;
-- policies: own rows only (select/insert/delete using auth.uid() = user_id)
create index on public.health_ai_scans (user_id, created_at desc);
```

Storage: privátny bucket `health-uploads`, RLS podľa prefixu `auth.uid()/…`; súbory sa nahrávajú z klienta, edge funkcia ich číta service-role klientom (signed/priamy download).

## 3. Edge Function `health-ai-analyze`

- `verify_jwt = false`, JWT validácia v kóde (`_shared/auth.ts`), CORS z `npm:@supabase/supabase-js@2/cors`.
- Zod validácia body: `{ action: 'symptom_chat' | 'lab_document' | 'medical_image', messages?, storage_path?, mime? }`.
- Rate limit cez `_shared/withRateLimit.ts`.
- AI: `_shared/unifiedAI.ts` (Vertex AI primárne, podľa platného pravidla), multimodálny vstup — obrázky ako inline base64, PDF ako document part; pri PDF nad limit sa vráti jasná chyba namiesto tichého skrátenia.
- Systémový prompt: edukačný asistent, žiadna diagnóza, štruktúrovaný JSON výstup:
  `{ summary, key_findings[], severity, plain_language[], next_steps[], doctor_questions[] }`.
- Poradie: auth → validácia → pre-check zostatku → AI call → `spendAiCredits` → insert do `health_ai_scans` → response.
- Chyby: 401/400/402/429/5xx podľa platného error kontraktu; UI zobrazí správu, žiadne auto-retry na 4xx.

## 4. Frontend

Nová stránka `src/pages/AIHealthAssistant.tsx` + komponenty v `src/components/ai-health/`:

- `HealthDisclaimerBanner.tsx` — povinný alert hore:
  „Informačný nástroj: AI výstupy slúžia výhradne na edukačné a preventívne účely a nenahrádzajú odbornú lekársku diagnostiku."
- Taby (shadcn `Tabs`), responsívne, mobil-first (360 px):
  1. **Symptom Checker** — chat UI, 1 kredit / odpoveď.
  2. **Document & Lab Scanner** — upload PNG/JPG/PDF, 2 kredity.
  3. **Medical Image & ECG Scanner** — upload PNG/JPG, 3 kredity.
- `HealthUploadZone.tsx` — drag & drop, validácia typu a veľkosti, preview, upload do `health-uploads`.
- `HealthResultCard.tsx` — Summary & Key Findings (bullety), Severity badge (Low/Medium/High), preklad odborných termínov do jednoduchého jazyka, actionable next steps + otázky pre lekára.
- Export: „Export to PDF" cez existujúci jsPDF vzor v projekte; „Save to History" je automatický (insert v edge funkcii) + záložka História so zoznamom a detailom.
- Cena v kreditoch pri každom tlačidle; pri nedostatku zostatku disabled stav + odkaz na dobitie.
- Neprihlásený užívateľ: sign-in gate (rovnaký vzor ako Daily Challenge).
- `FloatingHowItWorks` s anglickým „How it works" vysvetlením (povinné pravidlo pokrytia).
- SEO: `Helmet` title/description, jedno H1.

## 5. Registrácia modulu

- Route `/ai-health` v `src/App.tsx` (lazy import).
- Zápis do search/module registry (manuálna registrácia, ako ostatné moduly) + odkaz z Navbar / wellness sekcie.

## 6. Overenie

- `tsgo --noEmit`.
- Live test edge funkcie autentifikovane: chat, PDF, obrázok — kontrola odpočtu v `ai_credits` a nového riadku v `ai_credits_ledger` a `health_ai_scans`.
- Test nedostatku kreditov (402 → upgrade tok).
- Playwright smoke na 360×628: taby, disclaimer, upload, výsledok, export.

## Poznámky

- Žiadne fake/demo výstupy — všetko z reálneho AI volania a DB.
- Modul je country-neutral, žiadne flagy/adresy.
- Existujúce healthcare subscription flow sa nemení.
