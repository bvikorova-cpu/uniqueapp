# Support Lounge: pevné mobilné miestnosti, anonymita a známi

## Cieľ
- Na mobile zobraziť všetkých päť Support Rooms naraz bez horizontálneho posúvania.
- Oddeliť Support Lounge od profilov tak, aby klient nikdy nedostal skutočné používateľské ID, meno ani avatar člena.
- Pridať anonymný zoznam známych so žiadosťou a prijatím a ukázať prijatým známym spoločné navštívené miestnosti.

## Úpravy rozhrania
- Päť miestností zobraziť na mobile v kompaktnej dvojstĺpcovej mriežke; posledná položka využije celú šírku.
- Zachovať chat pod mriežkou a vnútorné posúvanie iba pre správy, nie pre zoznam miestností.
- Pridať záložku **Known People** so sekciami: prijaté žiadosti, odoslané žiadosti a prijatí známi.
- Pri anonymnej prezývke v miestnosti a súkromnom chate pridať akciu **Add to known people**.
- Pri prijatom známom zobraziť iba lounge prezývku a názvy miestností, ktoré obaja navštívili; nikdy profil, skutočné meno ani avatar.

## Ochrana anonymity
- Zaviesť náhodné interné `lounge_id`, ktoré nie je totožné s používateľským UUID.
- Mapovanie účtu na `lounge_id` ponechať dostupné iba serverovej funkcii; klient ho nebude môcť čítať.
- Nové room správy, súkromné správy, dochádzka a kontakty budú pracovať iba s `lounge_id`.
- Zrušiť klientsky prístup k starým tabuľkám, ktoré dnes odhaľujú `user_id`, a presunúť existujúcu históriu na anonymné identifikátory.
- Notifikácie zo Support Lounge ukladať bez `actor_id`; text bude obsahovať iba lounge prezývku.
- Odosielanie správ presunúť cez zabezpečenú Edge Function, ktorá overí denný vstup, identitu príjemcu, povolenú miestnosť a dĺžku obsahu.
- Blokovať e-mail, telefón, URL a sociálne kontakty v lounge správach, aby sa člen neidentifikoval omylom.

## Známi a spoločné miestnosti
- Vytvoriť samostatné lounge kontakty so stavmi `pending` a `accepted`; žiadosť musí druhá osoba prijať.
- Povoliť žiadosť iba medzi existujúcimi anonymnými členmi Lounge; zakázať žiadosť sebe a duplicity.
- Zaznamenať iba miestnosť a anonymné `lounge_id` pri návšteve miestnosti.
- Spoločné miestnosti vypočítať na serveri až po prijatí žiadosti; ostatným používateľom sa dochádzka nezobrazí.
- Pridať anonymné notifikácie pre novú žiadosť a jej prijatie s otvorením záložky Known People.

## Technické kroky
1. Databázová migrácia vytvorí anonymné identity, nové správy, súkromné správy, attendance a lounge contacts s explicitnými oprávneniami a RLS.
2. Migrácia prevedie existujúce správy a DM na anonymné `lounge_id`, potom odoberie klientsky prístup k starým identitu odhaľujúcim tabuľkám.
3. Edge Function `support-lounge` dostane validované akcie pre načítanie/odoslanie správ, návštevu miestnosti, DM a správu žiadostí.
4. `SupportLounge.tsx` prejde na anonymné odpovede servera a dostane mobilnú mriežku a zoznam známych.
5. Aktualizujú sa odkazy notifikácií na správnu záložku.

## Overenie
- Test pri šírke 360 px: všetkých päť miestností je viditeľných bez horizontálneho posúvania.
- Test dvoch účtov: žiadosť → prijatie → spoločné miestnosti → súkromná správa.
- Skontrolovať odpovede API, realtime udalosti a DOM: nesmú obsahovať skutočné používateľské UUID, mená ani avatary druhého člena.
- Overiť RLS: cudzí používateľ neprečíta DM, kontakty, dochádzku ani mapovanie identity.
- Overiť odpočet 1 kreditu za DM a existujúce poplatky vstupu/AI bez regresie.
