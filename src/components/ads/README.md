# 💰 Ads - Activation Guide

This directory contains pre-prepared code for Ezoic ads integration.

## 🚀 How to activate ads (when you're ready)

### 1. Zaregistruj sa v Ezoic
```
1. Go to https://www.ezoic.com
2. Create an account and add your application
3. Wait for approval (1-3 days)
4. Get Publisher ID and Placement IDs from the Ezoic dashboard
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

### 3. Update configuration
```typescript
// V AdBanner.tsx
const EZOIC_ENABLED = true; // Change to true

// V AdPlacements.tsx
// Replace placeholder IDs with actual Ezoic placement IDs
FOOTER_BANNER: "tvoje-skutocne-ezoic-id-101"
```

### 4. Pridaj reklamy do komponentov
```tsx
// Example: Add ad to footer
import AdBanner from "@/components/ads/AdBanner";
import { AD_PLACEMENTS } from "@/components/ads/AdPlacements";

<AdBanner 
  placementId={AD_PLACEMENTS.FOOTER_BANNER} 
  format="banner" 
/>
```

## 📍 Where to add ads (recommended positions)

### Global
- **Footer**: Small banner at the end of every page

### Escape Room
- After completing each room
- After completing the entire game

### Coffee Buddy
- In the list of cafes (every 3rd item)
- Na detaile kaviarne (sidebar)

### Character Arena
- After the battle ends
- In the leaderboard (sidebar)

### Other sections
- See `AdPlacements.tsx` for all defined positions

## 💰 Expected revenue

With **5,000 active users/month**:
- **Ezoic (bez Media.net)**: €300-400/mesiac
- **Ezoic + Media.net**: €400-600/mesiac
- **After 2-3 months of optimization**: Up to 50% more

## 📊 Where to track statistics

After activation:
1. Log in to [Ezoic Dashboard](https://svc.ezoic.com)
2. You will see:
   - Daily/weekly/monthly revenue
   - How many impressions each ad gets
   - Which positions are most profitable
   - CTR (click-through rate)

## 🔧 Troubleshooting

### Ads are not showing
1. Check if `EZOIC_ENABLED = true`
2. Check the console in the browser
3. Verify that the Ezoic script is loaded
4. Wait 24 hours after activation (Ezoic needs time to set up)

### Low revenue
1. Wait 30-60 days (Ezoic optimizes positions)
2. Pridaj viac placement positions
3. Check if you have sufficient traffic

## 📞 Podpora

- **Ezoic Support**: https://support.ezoic.com
- **Your application**: Everything is ready, just activate it when you're done!
