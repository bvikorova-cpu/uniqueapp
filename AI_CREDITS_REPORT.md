# 🔴 KRITICKÁ SPRÁVA: AI KREDITY A FUNKCIE

## 📊 Prehľad Kreditových Systémov

Platforma má **14 rôznych kreditových systémov**:

1. **ai_credits** - Hlavné AI kredity (pre Lovable AI funkcie)
2. **analyzer_credits** - Vision Analyzer
3. **antique_credits** - Antiques Analyzer  
4. **astrology_credits** - Astrology readings
5. **brain_duel_credits** - Brain Duel IQ testy
6. **character_credits** - Character Arena
7. **coloring_credits** - Coloring Books
8. **cooking_credits** - Cooking Assistant
9. **f1_user_credits** - F1 Racing
10. **iq_credits** - IQ Competitions
11. **photo_credits** - Photo effects
12. **shadow_credits** - Shadow Social
13. **video_ad_credits** - Video Ad Generator
14. **shadow_credit_transactions** - Shadow transakcie

---

## ✅ OPRAVENÉ PROBLÉMY

### 🎉 **Úspešne opravené edge funkcie:**

#### 1. **ai-image-generation** (Virtual Influencer Agency)
✅ **OPRAVENÉ** - Pridané:
- ✅ Autentifikácia používateľa
- ✅ Kontrola ai_credits (minimum 5 kreditov)
- ✅ Odčítanie 5 kreditov po použití
- ✅ Logovanie do ai_usage_history
- ✅ Vrátenie zostávajúcich kreditov v response

**CENA: 5 AI kreditov za generovanie obrázku**

#### 2. **apply-ai-effect** (AI Effects)
✅ **OPRAVENÉ** - Pridané:
- ✅ Autentifikácia používateľa
- ✅ Kontrola ai_credits (minimum 3 kredity)
- ✅ Odčítanie 3 kreditov po použití
- ✅ Logovanie do ai_usage_history
- ✅ Vrátenie zostávajúcich kreditov v response

**CENA: 3 AI kredity za aplikovanie AI efektu**

---

## ❌ ĎALŠIE PODOZRIVÉ FUNKCIE (vyžadujú audit)

### 🔍 **Pravdepodobne potrebujú ai_credits:**

1. **generate-content-image** - generuje obrázky pre content
2. **find-best-self** - AI analýza paralelných vesmírov
3. **merge-timelines** - AI mergovanie timelinov
4. **create-universe** - AI generovanie paralelných vesmírov
5. **enhance-shadow-story** - AI vylepšenie shadow príbehov
6. **generate-age-progression** - AI starnutie fotiek
7. **generate-artist-image** - AI generovanie umelcov
8. **create-shadow-battle** - AI tvorba shadow battles

---

## ✅ SPRÁVNE IMPLEMENTOVANÉ - Funkcie s AI kreditmi

### Tieto edge funkcie **správne** odčítavajú ai_credits:

1. ✅ **beauty-tutorial** - 2 kredity
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

2. ✅ **beauty-transformation** - 5 kreditov
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

3. ✅ **virtual-tryon** - 10 kreditov
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

4. ✅ **generate-collectible** - 10 kreditov
   - Kontroluje kredity
   - Odčítava pomocou RPC `decrement_ai_credits`
   - Loguje do ai_usage_history

5. ✅ **beauty-recommendations** - kredity implementované
6. ✅ **ai-image-generation** - 5 kreditov (OPRAVENÉ)
7. ✅ **apply-ai-effect** - 3 kredity (OPRAVENÉ)

---

## 🔍 ANALÝZA 87 EDGE FUNKCIÍ používajúcich Lovable AI

### Kategórie funkcií podľa použitia kreditov:

#### A) **POUŽÍVAJÚ ŠPECIÁLNE kredity** (nie ai_credits):
- astrology-reading → astrology_credits ✅
- astrology-chat → astrology_credits ✅
- chat-with-chef → cooking_credits ✅
- create-character → character_credits ✅
- diagnose-plant → plant diagnostika (možno free)
- analyze-restaurant-menu → možno ai_credits alebo free
- ai-music-curator → možno ai_credits
- battle-characters → character_credits
- a ďalšie...

#### B) **POUŽÍVAJÚ ai_credits** (správne implementované):
- beauty-tutorial ✅ (2 kredity)
- beauty-transformation ✅ (5 kreditov)
- virtual-tryon ✅ (10 kreditov)
- generate-collectible ✅ (10 kreditov)
- beauty-recommendations ✅
- **ai-image-generation ✅ (5 kreditov) - OPRAVENÉ**
- **apply-ai-effect ✅ (3 kredity) - OPRAVENÉ**

#### C) **VYŽADUJÚ AUDIT** (potrebujú preveriť):
- generate-content-image ❓
- find-best-self ❓
- merge-timelines ❓
- create-universe ❓
- enhance-shadow-story ❓
- generate-age-progression ❓
- generate-artist-image ❓
- bulk-generate-panoramas ❓
- create-shadow-battle ❓
- a pravdepodobne ďalších 30-40 funkcií

---

## 📈 Štatistiky z ai_usage_history

**AKTUÁLNY STAV:**
- ✅ ai_usage_history tabuľka je prázdna (0 záznamov)
- ✅ Toto naznačuje buď novú databázu alebo zatiaľ žiadne AI použitie
- ✅ Po oprave funkcií sa začnú logovať všetky AI použitia

---

## 📋 KOMPONENTY používajúce useAICredits (23 súborov)

**Beauty (4):**
- HairStyleGenerator ✅
- MakeupTutorials ✅
- ProductRecommender ✅
- VirtualMakeup ✅

**Collectibles (2):**
- GenerateCollectible ✅
- MysteryBoxes ✅

**Dream Journal (3):**
- DreamEntryForm ✅
- JournalEntryForm ✅
- TrendsAnalysis ✅

**Fashion (4):**
- CapsuleWardrobe ✅
- FashionGenerator ✅
- OutfitRecommender ✅
- VirtualTryOn ✅

**Music (2):**
- RemixStudio ✅
- SongGenerator ✅

**Nutrition (4):**
- FoodScanner ✅
- MealPlannerGenerator ✅
- RestaurantAnalyzer ✅
- WorkoutMatcher ✅

**Plants (2):**
- PlantDiagnosis ✅
- PlantIdentifier ✅

**Pets (2):**
- MyPets ✅
- PetShop ✅

---

## 💰 FINANČNÝ DOPAD

**PO OPRAVE:**
- ✅ ai-image-generation teraz účtuje 5 kreditov
- ✅ apply-ai-effect teraz účtuje 3 kredity
- ✅ Kontrolované a trackovateľné použitie
- ✅ Správna monetizácia AI funkcií
- ✅ Ochrana pred neobmedzeným používaním

**ODHADOVANÉ ÚSPORY:**
- Každá generácia obrázku = 5 kreditov
- Každý AI efekt = 3 kredity
- Pri 1000 použitiach/deň = úspora tisícov kreditov denne

---

## ⚡ ĎALŠIE KROKY

### Dokončené ✅
1. ✅ Opravený `ai-image-generation` edge funkcia (5 kreditov)
2. ✅ Opravený `apply-ai-effect` edge funkcia (3 kredity)
3. ✅ Vytvorená komplexná dokumentácia

### Odporúčané 🔄
4. 🔄 Vykonať audit zvyšných ~85 edge funkcií
5. 🔄 Analyzovať ktoré funkcie majú byť spoplatnené
6. 🔄 Doplniť chýbajúce kontroly ai_credits
7. 🔄 Vytvoriť jednotný pattern pre všetky AI funkcie
8. 🔄 Implementovať RPC funkciu pre decrement_ai_credits

### Odporúčané Best Practices
```typescript
// Standard pattern pre AI edge funkcie s kreditmi:

// 1. Autentifikácia
const { data: { user } } = await supabaseClient.auth.getUser(token);
if (!user) throw new Error('Not authenticated');

// 2. Kontrola kreditov
const { data: credits } = await supabaseClient
  .from('ai_credits')
  .select('credits_remaining')
  .eq('user_id', user.id)
  .single();

const COST = 5; // nastaviť podľa zložitosti
if (!credits || credits.credits_remaining < COST) {
  return new Response(
    JSON.stringify({ error: `Insufficient AI credits. Need ${COST} credits.` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
  );
}

// 3. Vykonanie AI operácie
// ... AI volanie ...

// 4. Odčítanie kreditov
await supabaseClient
  .from('ai_credits')
  .update({ 
    credits_remaining: credits.credits_remaining - COST,
    last_used_at: new Date().toISOString()
  })
  .eq('user_id', user.id);

// 5. Logovanie
await supabaseClient
  .from('ai_usage_history')
  .insert({
    user_id: user.id,
    usage_type: 'function_name',
    credits_used: COST,
    description: 'Popis operácie'
  });

// 6. Response s zostávajúcimi kreditmi
return new Response(
  JSON.stringify({ 
    result,
    creditsRemaining: credits.credits_remaining - COST
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

---

## 📚 CENNÍK AI OPERÁCIÍ

### Aktuálne nastavené ceny:
- **AI Image Generation**: 5 kreditov ✅
- **AI Effect**: 3 kredity ✅
- **Beauty Tutorial**: 2 kredity ✅
- **Beauty Transformation**: 5 kreditov ✅
- **Virtual Try-On**: 10 kreditov ✅
- **Collectible Generation**: 10 kreditov ✅

### Odporúčané ceny pre ďalšie funkcie:
- **Simple AI Text**: 1-2 kredity
- **AI Image Edit**: 3-5 kreditov
- **Complex AI Generation**: 5-10 kreditov
- **Premium AI Features**: 10-15 kreditov


## 📊 Prehľad Kreditových Systémov

Platforma má **14 rôznych kreditových systémov**:

1. **ai_credits** - Hlavné AI kredity (pre Lovable AI funkcie)
2. **analyzer_credits** - Vision Analyzer
3. **antique_credits** - Antiques Analyzer  
4. **astrology_credits** - Astrology readings
5. **brain_duel_credits** - Brain Duel IQ testy
6. **character_credits** - Character Arena
7. **coloring_credits** - Coloring Books
8. **cooking_credits** - Cooking Assistant
9. **f1_user_credits** - F1 Racing
10. **iq_credits** - IQ Competitions
11. **photo_credits** - Photo effects
12. **shadow_credits** - Shadow Social
13. **video_ad_credits** - Video Ad Generator
14. **shadow_credit_transactions** - Shadow transakcie

---

## ❌ KRITICKÉ PROBLÉMY - Funkcie BEZ odčítavania AI kreditov

### 🚨 **Najzávažnejšie problémy:**

#### 1. **ai-image-generation** (Virtual Influencer Agency)
- ❌ **NEKONTROLUJE** ai_credits
- ❌ **NEODČÍTAVA** kredity
- ❌ **NELOGUJE** použitie
- ⚠️ **Používa**: Virtual Influencer content generation
- **NÁKLADY**: Používatelia môžu generovať obrázky ZADARMO bez limitu!

#### 2. **apply-ai-effect** (AI Effects)
- ❌ **NEKONTROLUJE** ai_credits  
- ❌ **NEODČÍTAVA** kredity
- ❌ **NELOGUJE** použitie
- ⚠️ **Používa**: 176 rôznych AI efektov na fotky
- **NÁKLADY**: Používatelia môžu aplikovať efekty ZADARMO bez limitu!

---

## ✅ SPRÁVNE IMPLEMENTOVANÉ - Funkcie s AI kreditmi

### Tieto edge funkcie **správne** odčítavajú ai_credits:

1. ✅ **beauty-tutorial** - 2 kredity
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

2. ✅ **beauty-transformation** - 5 kreditov
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

3. ✅ **virtual-tryon** - 10 kreditov
   - Kontroluje kredity
   - Odčítava pomocou UPDATE
   - Loguje do ai_usage_history

4. ✅ **generate-collectible** - 10 kreditov
   - Kontroluje kredity
   - Odčítava pomocou RPC `decrement_ai_credits`
   - Loguje do ai_usage_history

---

## 🔍 ANALÝZA 87 EDGE FUNKCIÍ používajúcich Lovable AI

### Kategórie funkcií podľa použitia kreditov:

#### A) **POUŽÍVAJÚ ŠPECIÁLNE kredity** (nie ai_credits):
- astrology-reading → astrology_credits
- astrology-chat → astrology_credits
- chat-with-chef → cooking_credits
- create-character → character_credits
- diagnose-plant → používa Lovable AI ale nepotrebuje kredity (free feature)
- a ďalšie...

#### B) **POUŽÍVAJÚ ai_credits** (správne implementované):
- beauty-tutorial ✅
- beauty-transformation ✅
- virtual-tryon ✅
- generate-collectible ✅
- beauty-recommendations ✅

#### C) **CHÝBA IMPLEMENTÁCIA ai_credits** (PROBLÉMY):
- ai-image-generation ❌
- apply-ai-effect ❌
- generate-content-image ❌
- find-best-self ❌
- merge-timelines ❌
- create-universe ❌
- a pravdepodobne ďalšie...

---

## 📈 Štatistiky z ai_usage_history

*(budú doplnené po SQL dotaze)*

---

## 🛠️ ODPORÚČANÉ RIEŠENIE

### Priorita 1: OKAMŽITE OPRAVIŤ
1. **ai-image-generation** - pridať kontrolu ai_credits (napr. 5 kreditov)
2. **apply-ai-effect** - pridať kontrolu ai_credits (napr. 3 kredity)

### Priorita 2: AUDIT VŠETKÝCH FUNKCIÍ
- Prejsť všetkých 87 edge funkcií
- Identifikovať ktoré MALI BYŤ spoplatnené ai_credits
- Doplniť chýbajúce kontroly

### Priorita 3: VYTVORENIE RPC FUNKCIE
```sql
CREATE OR REPLACE FUNCTION decrement_ai_credits(
  user_id UUID,
  amount INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE ai_credits 
  SET credits_remaining = credits_remaining - amount,
      last_used_at = NOW()
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📋 KOMPONENTY používajúce useAICredits (23 súborov)

**Beauty (4):**
- HairStyleGenerator
- MakeupTutorials  
- ProductRecommender
- VirtualMakeup

**Collectibles (2):**
- GenerateCollectible
- MysteryBoxes

**Dream Journal (3):**
- DreamEntryForm
- JournalEntryForm
- TrendsAnalysis

**Fashion (4):**
- CapsuleWardrobe
- FashionGenerator
- OutfitRecommender
- VirtualTryOn

**Music (2):**
- RemixStudio
- SongGenerator

**Nutrition (4):**
- FoodScanner
- MealPlannerGenerator
- RestaurantAnalyzer
- WorkoutMatcher

**Plants (2):**
- PlantDiagnosis
- PlantIdentifier

**Pets (2):**
- MyPets
- PetShop

---

## 💰 FINANČNÝ DOPAD

**BEZ OPRAVY:**
- Používatelia môžu generovať AI content ZADARMO
- Workspace stráca peniaze za Lovable AI volania
- Žiadna kontrola nad spotrebou

**PO OPRAVE:**
- Používatelia musia kupovať ai_credits
- Kontrolované a trackovateľné použitie
- Správna monetizácia AI funkcií

---

## ⚡ ĎALŠIE KROKY

1. ✅ Opraviť `ai-image-generation` edge funkciu
2. ✅ Opraviť `apply-ai-effect` edge funkciu  
3. 🔄 Vykonať audit zvyšných 85 edge funkcií
4. 📊 Analyzovať ai_usage_history pre identifikáciu ďalších problémov
5. 🔧 Vytvoriť jednotný pattern pre všetky AI funkcie
