# Oprava ikony reakcie v upozornení

## Cieľ
Keď používateľ zvolí srdiečko na fotke alebo príspevku, príjemcovi sa v upozornení zobrazí srdiečko, nie palec ani všeobecná ikona.

## Zmeny
- Uložiť konkrétny typ reakcie (`love`, `like`, `laugh`, `wow`, `sad`, `angry`) do metadát upozornenia.
- V oboch zoznamoch upozornení načítať metadáta a zobraziť správne emoji podľa typu reakcie.
- Zachovať existujúce upozornenia bez metadát s bezpečnou všeobecnou ikonou.
- Overiť typy a relevantný tok reakcie.

## Technické detaily
Databázový trigger `notify_reaction()` bude pri vytvorení upozornenia zapisovať `reaction_type` do `notifications.metadata`. Klientské mapovanie použije túto hodnotu namiesto jednej pevnej ikony pre všetky reakcie.
