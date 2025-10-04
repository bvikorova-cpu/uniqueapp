-- Update remaining recipes with detailed ingredients and instructions

-- Predjedlá (Starters)
UPDATE recipes SET
  ingredients = ARRAY[
    '300g čerstvých žampiniónov',
    '2 strúčiky cesnaku',
    '3 lyžice olivového oleja',
    '2 lyžice čerstvej petržlenovej vňate',
    '1 lyžička čerstvého tymiánu',
    'soľ a čierne korenie podľa chuti',
    '50ml bieleho vína',
    '1 lyžica masla'
  ],
  instructions = ARRAY[
    'Žampinióny dôkladne umyte a osušte papierovou utierkou.',
    'Nakrájajte ich na plátky hrubé asi 0,5 cm.',
    'Cesnak olúpte a najemno nasekajte.',
    'Petržlenovú vňať umyte, osušte a najemno nasekajte.',
    'Na panvici rozohrejte olivový olej na strednom ohni.',
    'Pridajte cesnak a opekajte 30 sekúnd, kým nevonia.',
    'Pridajte žampinióny a zvýšte oheň na vysoký.',
    'Smažte 5-6 minút za občasného miešania, kým nezhnednú.',
    'Zalejte bielym vínom a nechajte odpariť 2 minúty.',
    'Pridajte maslo, tymián, soľ a korenie.',
    'Miešajte ďalšiu minútu, kým sa maslo neroztopí.',
    'Posypte petržlenovou vňaťou a ihneď podávajte teplé.'
  ]
WHERE title = 'Smažené žampinióny';

UPDATE recipes SET
  ingredients = ARRAY[
    '1 baklažán (asi 300g)',
    '2 lyžice olivového oleja',
    '100g cherry paradajok',
    '50g fetového syra',
    '2 strúčiky cesnaku',
    '1 lyžica čerstvého bazalky',
    '1 lyžička oregana',
    'soľ a čierne korenie',
    'balzamikový ocot na pokvapkanie'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 200°C.',
    'Baklažán umyte a nakrájajte na kolieska hrubé 1 cm.',
    'Kolieska baklažánu posoľte z oboch strán a nechajte 15 minút odležať, aby vypustili horkosť.',
    'Opláchnite baklažán pod studenou vodou a osušte.',
    'Cherry paradajky prekrojte na polovice.',
    'Cesnak olúpte a pretlačte cez lis.',
    'Baklažán rozložte na plech vyložený papierom na pečenie.',
    'Potryte olivovým olejom a cesnakom.',
    'Pečte 15 minút, potom otočte na druhú stranu.',
    'Na každé koliesko položte cherry paradajky a fetový syr.',
    'Posypte oreganom a pečte ďalších 10 minút.',
    'Posypte čerstvou bazalkou, pokvapkajte balzamikovým octom a podávajte.'
  ]
WHERE title = 'Pečený baklažán';

UPDATE recipes SET
  ingredients = ARRAY[
    '200g špenátu',
    '150g ricotty',
    '100g mozzarelly',
    '50g parmezánu',
    '2 vajcia',
    '2 strúčiky cesnaku',
    'muškátový oriešok',
    'soľ a korenie',
    '300g listového cesta',
    '1 lyžica olivového oleja'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 180°C.',
    'Špenát dôkladne umyte a precedte.',
    'Na panvici rozohrejte olej a pridajte nasekané cesnak.',
    'Opekajte 30 sekúnd, potom pridajte špenát.',
    'Duste 3-4 minúty, kým špenát nezvädne.',
    'Nechajte vychladnúť a vyžmýkajte prebytočnú vodu.',
    'V miske zmiešajte ricottu, nastrúhanú mozzarellu a parmezán.',
    'Pridajte vajcia, špenát, štipku muškátového oriešku, soľ a korenie.',
    'Dôkladne premiešajte na hladkú zmes.',
    'Listové cesto rozvaľkajte a nakrájajte na malé štvorce.',
    'Do stredu každého štvorca dajte lyžicu plnky.',
    'Preklopte na trojuholníky a okraje pritlačte vidličkou.',
    'Rozložte na plech a pečte 20-25 minút do zlatista.',
    'Podávajte teplé s paradajkovou omáčkou.'
  ]
WHERE title = 'Špenátové pirohy';

-- Polievky (Soups)
UPDATE recipes SET
  ingredients = ARRAY[
    '500g kalerábu',
    '2 mrkvy',
    '1 zeler',
    '1 cibuľa',
    '1,5 litra zeleninového vývaru',
    '200ml smotany na varenie',
    '2 lyžice masla',
    '2 lyžice hladkej múky',
    'soľ, korenie, muškátový oriešok',
    'čerstvá petržlenová vňať',
    'krutóny na podávanie'
  ],
  instructions = ARRAY[
    'Kaleráb olúpte a nakrájajte na menšie kocky.',
    'Mrkvu a zeler očistite a nakrájajte na kocky.',
    'Cibuľu olúpte a najemno nasekajte.',
    'V hrnci rozohrejte maslo a opečte cibuľu do sklovita (3-4 minúty).',
    'Pridajte kaleráb, mrkvu a zeler.',
    'Opekajte 5 minút za miešania.',
    'Zalejte zeleninový vývar a priveďte do varu.',
    'Znížte teplotu a varte pod pokrievkou 25 minút, kým zelenina nezmäkne.',
    'Polievku rozmixujte ponorným mixérom na hladký krém.',
    'V miske zmiešajte smotanu s múkou.',
    'Vlejte do polievky a za stáleho miešania prevarte 3 minúty.',
    'Ochuťte soľou, korením a muškátovým orieškom.',
    'Podávajte s krutónmi a čerstvou petržlenovou vňaťou.'
  ]
WHERE title = 'Krém z kalerábu';

UPDATE recipes SET
  ingredients = ARRAY[
    '300g šošovice (hnedej alebo červenej)',
    '1 veľká cibuľa',
    '2 mrkvy',
    '2 strúčiky cesnaku',
    '1 lyžica rajčinového pretlaku',
    '1 lyžička mletej rasce',
    '1 lyžička mletého koriandra',
    '1,5 litra zeleninového vývaru',
    '2 lyžice olivového oleja',
    'soľ a čierne korenie',
    'citrónová šťava',
    'čerstvá koriandora'
  ],
  instructions = ARRAY[
    'Šošovicu prepláchnite pod studenou vodou.',
    'Ak používate hnedú šošovicu, namočte ju na 2 hodiny (červená nepotrebuje).',
    'Cibuľu a cesnak olúpte a najemno nasekajte.',
    'Mrkvu očistite a nakrájajte na kocky.',
    'V hrnci rozohrejte olivový olej a opečte cibuľu 4 minúty.',
    'Pridajte cesnak a opekajte ďalšiu minútu.',
    'Pridajte rascu a koriandrové semená, opekajte 30 sekúnd.',
    'Pridajte rajčinový pretlak a opekajte 1 minútu.',
    'Pridajte šošovicu a mrkvu, zalejte vývarom.',
    'Priveďte do varu, znížte teplotu a varte 30-40 minút.',
    'Ak chcete hladkú polievku, rozmixujte polovicu.',
    'Ochuťte soľou, korením a citrónovou šťavou.',
    'Podávajte s čerstvou koriandorou.'
  ]
WHERE title = 'Šošovicová polievka';

-- Hlavné jedlá (Main Dishes)
UPDATE recipes SET
  ingredients = ARRAY[
    '4 kuracie prsia (asi 600g)',
    '200g cherry paradajok',
    '150g mozzarelly',
    '3 lyžice bazalkového pesta',
    '2 strúčiky cesnaku',
    '2 lyžice olivového oleja',
    'soľ a čierne korenie',
    'čerstvá bazalka',
    'balzamikový ocot'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 190°C.',
    'Kuracie prsia umyte, osušte a naklepte na rovnomernú hrúbku.',
    'Soľte a okoreňte z oboch strán.',
    'Na pánvi rozohrejte olivový olej na vysokom ohni.',
    'Opečte prsia po 2 minúty z každej strany do zlatista.',
    'Preložte do zapekacej misy.',
    'Každé prsia potryte lyžicou bazalkového pesta.',
    'Cherry paradajky prekrojte na polovice a rozložte okolo.',
    'Cesnak olúpte, nakrájajte na plátky a pridajte k paradajkám.',
    'Mozzarellu nakrájajte na plátky a položte na prsia.',
    'Pečte 20-25 minút, kým kuracie mäso nie je prepečené.',
    'Pokvapkajte balzamikovým octom a ozdobte čerstvou bazalkou.',
    'Podávajte s ryžou alebo cestovinami.'
  ]
WHERE title = 'Kuracie prsia caprese';

UPDATE recipes SET
  ingredients = ARRAY[
    '4 lososové filé (asi 150g každé)',
    '2 lyžice medu',
    '3 lyžice sójovej omáčky',
    '2 strúčiky cesnaku',
    '1 lyžica čerstvého zázvoru',
    '1 lyžica sezamového oleja',
    '1 lyžička citrónovej šťavy',
    'sezamové semienka',
    'jarná cibuľka',
    'čierne korenie'
  ],
  instructions = ARRAY[
    'V miske zmiešajte med, sójovú omáčku a citrónovou šťavu.',
    'Cesnak a zázvor olúpte a najemno nastrúhajte.',
    'Pridajte do marinády spolu so sezamovým olejom.',
    'Lososové filé umyte, osušte a vložte do marinády.',
    'Nechajte marinovať v chladničke aspoň 30 minút (ideálne 2 hodiny).',
    'Rúru predhrejte na 200°C.',
    'Losos vyložte na plech vyložený papierom.',
    'Zvyšnú marinádou pokvapkajte ryby.',
    'Pečte 12-15 minút, v polovici pečenia prelejte marinádou.',
    'Losos by mal byť ružový v strede a ľahko sa rozpadať.',
    'Posypte sezamovými semienkami.',
    'Ozdobte nasekanou jarnou cibuľkou a podávajte.',
    'Skvelé s ryžou alebo zeleninou na pare.'
  ]
WHERE title = 'Losos v medovo-sójovej glazúre';

-- Cestoviny (Pasta)
UPDATE recipes SET
  ingredients = ARRAY[
    '400g špagiet',
    '4 vajcia',
    '150g pancetty alebo slaniny',
    '100g parmezánu',
    '2 strúčiky cesnaku',
    'čierne korenie',
    'soľ',
    '2 lyžice olivového oleja',
    'čerstvá petržlenová vňať'
  ],
  instructions = ARRAY[
    'Veľký hrniec vody privedťe do varu a pridajte 2 lyžice soli.',
    'Varte špagety podľa návodu na obale (zvyčajne 8-10 minút) al dente.',
    'Pancettu nakrájajte na malé kocky.',
    'Na panvici rozohrejte olivový olej a opečte pancettu 5-7 minút do chrumkava.',
    'Pridajte pretlačený cesnak a opekajte 30 sekúnd.',
    'V miske rozšľahajte vajcia s nastrúhaným parmezánom.',
    'Pridajte veľkorysú dávku čierneho korenia.',
    'Keď sú cestoviny hotové, odložte šálku varnej vody.',
    'Scedťe špagety a vráťte do hrnca mimo ohňa.',
    'Rýchlo prilejte vajíčkovú zmes a miešajte, kým sa vajcia nespoja s cestovinami.',
    'Pridajte pancettu s tukom z panvice a dobre premiešajte.',
    'Ak je zmes príliš hustá, pridajte trochu varnej vody.',
    'Podávajte ihneď s parmezánom a petržlenovou vňaťou.'
  ]
WHERE title = 'Špagety carbonara';

UPDATE recipes SET
  ingredients = ARRAY[
    '400g penne',
    '400g cherry paradajok',
    '200g mozzarelly',
    '3 strúčiky cesnaku',
    '4 lyžice olivového oleja',
    '1 zväzok čerstvej bazalky',
    '50g parmezánu',
    'soľ a čierne korenie',
    'chilli vločky (voliteľné)',
    'balzamikový ocot'
  ],
  instructions = ARRAY[
    'Vodu na cestoviny privedťe do varu, osoľte a varte penne 10-12 minút.',
    'Cherry paradajky umyte a prekrojte na polovice.',
    'Cesnak olúpte a nakrájajte na tenké plátky.',
    'Na veľkej panvici rozohrejte olivový olej na strednom ohni.',
    'Pridajte cesnak a opekajte 1 minútu, kým nezačne voňať.',
    'Pridajte paradajky a zvýšte oheň na vysoký.',
    'Pečte 8-10 minút za občasného miešania, kým paradajky nezačnú prasknúť.',
    'Paradajky rozdrťte vidličkou na hrubú omáčku.',
    'Soľte, okoreňte a pridajte chilli vločky podľa chuti.',
    'Scedťe hotové penne a pridajte do paradajkovej omáčky.',
    'Mozzarellu natrháte na kúsky a pridajte spolu s bazalkou.',
    'Miešajte, kým sa mozzarella nezačne topiť.',
    'Podávajte s parmezánom a pokvapkajte balzamikovým octom.'
  ]
WHERE title = 'Penne s cherry paradajkami';

-- Dezerty (Desserts)
UPDATE recipes SET
  ingredients = ARRAY[
    '250g mascarpone',
    '3 vajcia',
    '100g práškového cukru',
    '200ml silnej kávy (vychladenej)',
    '3 lyžice amaretta alebo rumu',
    '200g piškót',
    'kakao na opeprenie',
    '50ml mlieka',
    'čokoláda na ozdobu'
  ],
  instructions = ARRAY[
    'Uvarte silnú kávu a nechajte vychladnúť.',
    'Zmiešajte kávu s amarettom alebo rumom.',
    'Vajcia rozdeľte na bielka a žĺtky.',
    'Žĺtky vyšľahajte s polovicou cukru do penista.',
    'Pridajte mascarpone a šľahajte do hladkej krémovej konzistencie.',
    'Bielka vyšľahajte so zvyšným cukrom na tuhý sneh.',
    'Opatrne vmiešajte sneh do mascarpone zmesi.',
    'Piškóty namočte v káve s alkoholom (každú asi 2 sekundy).',
    'Polovicu piškót rozložte do formy (20x30 cm).',
    'Navrch naneste polovicu mascarpone krému.',
    'Vytvorte druhú vrstvu z piškót a krému.',
    'Zakryte a nechajte v chladničke aspoň 4 hodiny (ideálne cez noc).',
    'Pred podávaním poprášte kakaom a ozdobte strúhanou čokoládou.'
  ]
WHERE title = 'Tiramisu';

UPDATE recipes SET
  ingredients = ARRAY[
    '200g horkej čokolády (70%)',
    '100g masla',
    '3 vajcia',
    '80g kryštálového cukru',
    '30g hladkej múky',
    'štipka soli',
    '1 lyžička vanilkového extraktu',
    'práškový cukor na opeprenie',
    'zmrzlina na podávanie'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 200°C.',
    'Štyri formičky na suflé (alebo muffiny) vymastite maslom a vysypte kakaom.',
    'Čokoládu a maslo rozlámte a roztopte vo vodnom kúpeli.',
    'Miešajte, kým sa čokoláda úplne neroztopí a zmes nebude hladká.',
    'Vajcia rozšľahajte s cukrom 3-4 minúty do penista.',
    'Pridajte vanilkový extrakt a soľ.',
    'Zľahka vmiešajte čokoládovú zmes do vajec.',
    'Pridajte preosiatú múku a jemne zamiešajte.',
    'Zmes nalejte do pripravených formičiek (naplňte do 3/4).',
    'Pečte 12-14 minút - okraje musia byť upečené, stred tekutý.',
    'Nechajte chvíľu postáť, potom prevráťte na taniere.',
    'Poprášte práškovým cukrom.',
    'Podávajte ihneď s guľkou vanilkovej zmrzliny.'
  ]
WHERE title = 'Čokoládová lávová torta';

-- More desserts
UPDATE recipes SET
  ingredients = ARRAY[
    '500g tvarohu',
    '200ml smotany na šľahanie',
    '120g práškového cukru',
    '3 lyžice citrónové šťavy',
    'citrónová kôra z 1 citróna',
    '200g maslových sušienok',
    '100g masla',
    '2 lyžičky želatíny',
    'čerstvé ovocie na ozdobu'
  ],
  instructions = ARRAY[
    'Želatínu namočte v 3 lyžiciach studenej vody na 10 minút.',
    'Sušienky rozdrobte na jemné omrvinky (možno v mixéri).',
    'Maslo roztopte a zmiešajte so sušienkami.',
    'Zmes vytlačte do formy na tortu s odnímateľným dnom.',
    'Dajte do chladničky stuhtnúť aspoň 30 minút.',
    'Tvaroh dôkladne pretlačte cez sitko alebo mixujte do hladka.',
    'Pridajte práškový cukor, citrónovú šťavu a nastrúhanú kôru.',
    'Želatínu zohrejte nad parou, kým sa úplne nerozpustí.',
    'Pridajte 2 lyžice tvarohovej zmesi do želatíny a zamiešajte.',
    'Túto zmes vlejte späť do tvarohu a dôkladne premiešajte.',
    'Smotanu vyšľahajte na tuhý sneh.',
    'Jemne vmiešajte smotanu do tvarohovej zmesi.',
    'Nalejte na sušienkový základ a chlaďte minimálne 4 hodiny.',
    'Pred podávaním ozdobte čerstvým ovocím.'
  ]
WHERE title = 'Cheesecake s citrónom';

UPDATE recipes SET
  ingredients = ARRAY[
    '6 jabĺk (ideálne Granny Smith)',
    '200g hladkej múky',
    '150g kryštálového cukru',
    '100g masla',
    '2 vajcia',
    '1 prášok do pečiva',
    '2 lyžičky škorice',
    '100ml mlieka',
    'práškový cukor',
    'soľ'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 180°C.',
    'Formu na koláč (priemer 26 cm) vymastite a vysypte múkou.',
    'Jablká olúpte, odstráňte jadrovník a nakrájajte na tenké plátky.',
    'V miske zmiešajte jablká s 2 lyžicami cukru a škoricou.',
    'V druhej miske vyšľahajte maslo s cukrom do penista (5 minút).',
    'Pridávajte vajcia jedno po druhom a šľahajte.',
    'V tretej miske zmiešajte múku, prášok do pečiva a štipku soli.',
    'Striedavo pridávajte suchú zmes a mlieko do maslovo-vajíčkovej zmesi.',
    'Miešajte, kým nevznikne hladké cesto.',
    'Polovicu cesta nalejte do formy.',
    'Rozložte polovicu jabĺk, zakryte zvyšným cestom.',
    'Navrch ozdobne rozložte zvyšné jablkové plátky.',
    'Pečte 50-60 minút, kým nie je zlatistý a prepečený.',
    'Nechajte vychladnúť a poprášte práškovým cukrom.'
  ]
WHERE title = 'Jablkový koláč';

-- Šaláty (Salads)
UPDATE recipes SET
  ingredients = ARRAY[
    '250g cherry paradajok',
    '200g mozzarelly',
    '1 zväzok čerstvej bazalky',
    '4 lyžice olivového oleja extra panenského',
    '2 lyžice balzamikového octu',
    'soľ a čierne korenie',
    'piniové oriešky (voliteľné)',
    'čerstvý parmezán'
  ],
  instructions = ARRAY[
    'Cherry paradajky umyte a prekrojte na polovice.',
    'Mozzarellu scedťe a nakrájajte na kocky alebo malé guľôčky.',
    'Bazalku umyte, osušte a odtrhnite lístky.',
    'Na miske zmiešajte paradajky, mozzarellu a bazalku.',
    'V malej miske zmiešajte olivový olej a balzamikový ocot.',
    'Ochuťte soľou a čiernym korením.',
    'Prelej šalát dressingom tesne pred podávaním.',
    'Ak používate piniové oriešky, opražte ich na panvici 2-3 minúty.',
    'Posypte nimi šalát.',
    'Navrch nastrúhajte trochu parmezánu.',
    'Miešajte jemne, aby sa ingrediencie nerozbili.',
    'Podávajte okamžite ako predkrm alebo prílohu.'
  ]
WHERE title = 'Caprese šalát';