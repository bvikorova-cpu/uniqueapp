# Chatové okno s pevným pozadím

## Cieľ
Obmedziť chatové okno na maximálnu výšku podľa ukážky a zachovať ostré fotografické pozadie bez ohľadu na dĺžku konverzácie.

## Zmeny
- Nastaviť chatový rám na pevnú responzívnu výšku približne jednej mobilnej obrazovky, s horným limitom na väčších obrazovkách.
- Presunúť fotografické pozadie do samostatnej absolútnej vrstvy, ktorá má stále rozmery rámu a nikdy sa nenaťahuje podľa správ.
- Správy ponechať v samostatnej rolovacej vrstve nad pozadím; obrázky, darčeky a ostatný obsah správ zostanú zachované.
- Overiť mobilné zobrazenie 360 × 628 a rolovanie dlhej konverzácie.

## Technické detaily
- Úprava iba Messenger chatu v `src/pages/Messenger.tsx`.
- Pozadie bude mať `background-size: cover`, stabilné centrovanie a nebude súčasťou rolovacieho obsahu.
- Spodné ovládanie a pole správy zostanú mimo rolovacieho rámu.
