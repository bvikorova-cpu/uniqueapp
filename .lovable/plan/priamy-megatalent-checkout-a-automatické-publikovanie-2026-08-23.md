# Priamy MegaTalent checkout a automatické publikovanie

## Cieľ
Po kliknutí na **Publish** používateľ bez aktívneho plánu vyberie €10 alebo €15 predplatné, zaplatí v Stripe a po návrate sa otvorí priamo MegaTalent s už zverejneným príspevkom. Samostatná obrazovka „Activating your subscription“ sa prestane používať.

## Zmeny
- Pred otvorením Stripe bezpečne uchovať rozpracovaný príspevok pre aktuálneho používateľa (médium, kategóriu, názov a popis).
- Stripe checkout otvoriť v tom istom okne, aby bol návrat jednoznačný a používateľ nevytváral duplicitné platby vo viacerých kartách.
- Zmeniť Stripe success URL na priamy návrat do `/megatalent` s identifikátorom Checkout Session.
- Na MegaTalent stránke overiť konkrétnu platbu, aktivovať predplatné a automaticky vložiť čakajúci príspevok presne raz.
- Po úspechu vyčistiť uložený koncept aj parametre URL, obnoviť feed a zobraziť potvrdenie „Published“.
- Pri zrušenej alebo neúspešnej platbe koncept ponechať, aby používateľ nič nemusel vypĺňať znova.

## Technické detaily
- Zachovať existujúce Stripe ceny, referral kód a serverové overenie vlastníctva platby.
- Použiť identifikátor používateľa a jednorazový príznak proti duplicitnému publikovaniu.
- Overiť oba plány (€10 Premium aj €15 TOP Premium) a návratový tok na mobile.
