# 💰 Reklamy - Návod na aktiváciu

Tento adresár obsahuje pripravený kód pre integráciu Ezoic reklám.

## 🚀 Ako aktivovať reklamy (keď budeš hotová)

### 1. Zaregistruj sa v Ezoic
```
1. Choď na https://www.ezoic.com
2. Vytvor účet a pridaj svoju aplikáciu
3. Počkaj na schválenie (1-3 dni)
4. Získaj Publisher ID a Placement IDs z Ezoic dashboardu
```

### 2. Pridaj Ezoic skript do `index.html`
```html
<!-- Pred </head> tag -->
<script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
<script>
  window.ezstandalone = window.ezstandalone || {};
  ezstandalone.cmd = ezstandalone.cmd || [];
</script>
```

### 3. Aktualizuj konfiguráciu
```typescript
// V AdBanner.tsx
const EZOIC_ENABLED = true; // Zmeň na true

// V AdPlacements.tsx
// Nahraď placeholder IDs skutočnými Ezoic placement IDs
FOOTER_BANNER: "tvoje-skutocne-ezoic-id-101"
```

### 4. Pridaj reklamy do komponentov
```tsx
// Príklad: Pridať reklamu do footer
import AdBanner from "@/components/ads/AdBanner";
import { AD_PLACEMENTS } from "@/components/ads/AdPlacements";

<AdBanner 
  placementId={AD_PLACEMENTS.FOOTER_BANNER} 
  format="banner" 
/>
```

## 📍 Kde pridať reklamy (odporúčané pozície)

### Globálne
- **Footer**: Malý banner na konci každej stránky

### Escape Room
- Po dokončení každej miestnosti
- Po dokončení celej hry

### Coffee Buddy
- V zozname kaviarní (každá 3. položka)
- Na detaile kaviarne (sidebar)

### Character Arena
- Po skončení bitky
- V rebríčku (sidebar)

### Ostatné sekcie
- Pozri `AdPlacements.tsx` pre všetky definované pozície

## 💰 Očakávané príjmy

Pri **5,000 aktívnych používateľov/mesiac**:
- **Ezoic (bez Media.net)**: €300-400/mesiac
- **Ezoic + Media.net**: €400-600/mesiac
- **Po 2-3 mesiacoch optimalizácie**: Až o 50% viac

## 📊 Kde sledovať štatistiky

Po aktivácii:
1. Prihlás sa do [Ezoic Dashboard](https://svc.ezoic.com)
2. Vidíš:
   - Denné/týždenné/mesačné príjmy
   - Koľko zobrazení má každá reklama
   - Ktoré pozície sú najziskovejšie
   - CTR (click-through rate)

## 🔧 Riešenie problémov

### Reklamy sa nezobrazujú
1. Skontroluj, či je `EZOIC_ENABLED = true`
2. Skontroluj console v prehliadači
3. Overi, že Ezoic script je načítaný
4. Počkaj 24 hodín po aktivácii (Ezoic potrebuje čas na setup)

### Nízke príjmy
1. Počkaj 30-60 dní (Ezoic optimalizuje pozície)
2. Pridaj viac placement positions
3. Skontroluj, či máš dostatočný traffic

## 📞 Podpora

- **Ezoic Support**: https://support.ezoic.com
- **Tvoja aplikácia**: Všetko je pripravené, len aktivuj keď budeš hotová!
