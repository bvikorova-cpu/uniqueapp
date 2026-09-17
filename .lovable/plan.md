# Oprava cover fotiek používateľov

## Cieľ
Cover fotka sa zobrazí na profile aj na kartách používateľov vo Friends namiesto farebného pozadia.

## Zmeny
- Opraviť načítanie uloženého cover odkazu tak, aby používalo dostupnú verejnú adresu; aktuálna uložená adresa vracia `403 Forbidden`.
- Rozšíriť bezpečné profilové databázové funkcie používané pre priateľov, vyhľadávanie a odporúčania o pole `cover_url`.
- Preniesť `cover_url` cez spoločné profilové typy a cache.
- Vo Friends zobraziť reálny cover v kartách All Friends, Friend Requests, Sent Requests, Find People a People You May Know; gradient ponechať iba ako náhradu, ak používateľ cover nemá.
- Zachovať existujúce súkromie profilov a neposkytovať žiadne citlivé polia.

## Overenie
- Overiť Beátinu uloženú cover fotku priamo cez profil a kartu odoslanej žiadosti.
- Skontrolovať mobilné rozloženie 360 px a TypeScript kontrolu.
