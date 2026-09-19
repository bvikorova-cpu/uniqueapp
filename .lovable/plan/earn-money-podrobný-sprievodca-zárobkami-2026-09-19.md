# Earn Money — podrobný sprievodca zárobkami

## Cieľ
Vytvoriť samostatnú stránku **Earn Money**, ktorá používateľovi zrozumiteľne a presvedčivo ukáže všetky možnosti zárobku na Unique. Existujúce funkcie, stránky a menu skupiny zostanú nedotknuté; pridajú sa iba nové odkazy a nová stránka.

## Čo pribudne
- Nová samostatná stránka `/earn-money` s výrazným úvodom a prehľadom možností.
- Každá položka v skupine **Earn Money** otvorí priamo svoju kapitolu na tejto stránke.
- Každá kapitola bude obsahovať:
  - pútavý, ale pravdivý úvod bez sľubovania garantovaného zárobku,
  - veľmi podrobný postup „ako začať“ a „ako vzniká zárobok“,
  - komu je možnosť určená a čo pomáha uspieť,
  - dôležité podmienky, poplatky alebo výplatný model, ak ich platforma už definuje,
  - relevantný existujúci obrázok/plagát, kde je dostupný,
  - jasné tlačidlo, ktoré otvorí pôvodnú sekciu Unique.

## Sekcie
- Influ King
- Skills Marketplace
- Megatalent
- Unlock Videos
- Tutorial & Course Platform
- Referrals
- Gifts
- Eco Challenge a Healthy Challenge
- Celá skupina Marketplaces & Commerce:
  - Property Marketplace
  - Skills Marketplace
  - Bazaar
  - Coupon Marketplace
  - Stock Content Library
  - Online Auctions
  - Antique Appraisal
- Live Concerts
- Comedy Club — Stand-up

## Integrácia do menu
- Existujúcu skupinu **Earn Money** rozšíriť o Challenges, všetky Marketplace položky, Live Concerts a Comedy Club.
- Cesty existujúcich položiek v tejto skupine zmeniť iba tak, aby smerovali na príslušnú kapitolu `/earn-money#...`.
- Pôvodné položky v ostatných skupinách menu a ich priame odkazy sa nebudú meniť.
- V každej kapitole zostane samostatné tlačidlo na okamžitý vstup do pôvodnej sekcie.

## Technické detaily
- Nový izolovaný komponent stránky s vlastným jedinečným názvoslovím tried; bez globálnych CSS zmien.
- Nová lazy-loaded cesta v existujúcom smerovaní aplikácie.
- Použiť iba existujúce dizajnové prvky, semantické farby a dostupné lokálne obrázky; žiadne falošné dáta ani ilustračné zárobky.
- Hash odkazy budú po načítaní správne rolovať na vybranú kapitolu aj na mobile.
- Zachovať angličtinu ako predvolený jazyk platformy a existujúci „How it works“ vzor.

## Overenie
- Kontrola typov a relevantný test aplikácie.
- Živá kontrola menu, priameho otvorenia každej kapitoly, tlačidiel do pôvodných sekcií a mobilného zobrazenia 360 px.
