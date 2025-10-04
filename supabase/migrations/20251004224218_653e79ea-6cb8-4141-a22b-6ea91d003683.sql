-- Update existing recipes with more detailed ingredients and instructions
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g hovädzieho mäsa (sviečková)',
    '2 mrkvy',
    '1 zeler',
    '1 petržlen',
    '2 cibuľky',
    '250ml smotany na varenie',
    '50g masla',
    '2 PL múky',
    '1 lyžička cukru',
    'soľ, korenie',
    'bobkový list',
    'nové korenie'
  ],
  instructions = ARRAY[
    'Mäso nakrájajte na väčšie kúsky a marinujte 2 hodiny v zelenine s koreninami',
    'Na panvici rozpustite maslo a opečte mäso zo všetkých strán dozlatista',
    'Pridajte nakrájanú zeleninu (mrkva, zeler, petržlen, cibuľu) a krátko opražte',
    'Zalejte vodou tak, aby mäso bolo pokryté, pridajte bobkový list a nové korenie',
    'Varte na miernom ohni 1.5-2 hodiny, kým mäso nezmäkne',
    'Mäso vyberte a odložte nabok, zeleninu prelejte cez sitko',
    'Z masla a múky pripravte svetlú zápražku, pridajte cukor a nechajte zkaramelizovať',
    'Postupne pridávajte precedenú zeleninu, miešajte do hladka',
    'Dolejte smotanu, dochutite soľou a korením',
    'Mäso nakrájajte na plátky, zalejte omáčkou a podávajte s knedlíkmi'
  ]
WHERE title = 'Sviečková na smotane';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '400g špagiet',
    '200g pancetty alebo guanciale',
    '4 žĺtky + 1 celé vajce',
    '100g parmezánu (strúhaného)',
    '50g pecorino romano',
    'čierne korenie čerstvo mleté',
    'soľ na varenie'
  ],
  instructions = ARRAY[
    'Varíte veľký hrniec osolenej vody na cestoviny',
    'Pancettu nakrájajte na malé kocky a na panvici opečte dozlatista (bez oleja)',
    'V miske vyšľahajte žĺtky s celým vajcom',
    'Pridajte strúhaný parmezán a pecorino, dobre premiešajte',
    'Pridajte štedro čerstvo mleté čierne korenie',
    'Špagety varte podľa návodu al dente (zvyčajne 8-10 minút)',
    'Odložte 200ml vody z cestovin',
    'Scedené cestoviny ihneď pridajte do panvice s pancettou',
    'Panvicu stiahnite z ohňa a pridajte vajíčkovú zmes',
    'Rýchlo miešajte, pridávajte postupne vodu z cestovin pre krémovú konzistenciu',
    'Servírujte okamžite s extra parmezánom a čiernym korením'
  ]
WHERE title = 'Carbonara';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '1kg čerstvých paradajok (najlepšie San Marzano)',
    '1 väčšia cibuľa',
    '3 strúčiky cesnaku',
    '200ml smotany na varenie',
    '50g masla',
    '1 PL olivového oleja',
    'čerstvá bazalka (15-20 lístkov)',
    '1 lyžička cukru',
    'soľ, čierne korenie',
    '500ml zeleninového vývaru'
  ],
  instructions = ARRAY[
    'Paradajky prekvapte vriacou vodou, ošúpte a nakrájajte na kúsky',
    'Na hrubšom dne rozohrejte olivový olej s maslom',
    'Cibuľu nakrájajte nadrobno a opražte 5 minút dozlatista',
    'Pridajte prelisovaný cesnak a opražte ďalšiu minútu',
    'Pridajte paradajky a cukor, premiešajte',
    'Varíte 15 minút na mírnom ohni, občas premiešajte',
    'Zalejte zeleninový vývar a varíte ďalších 10 minút',
    'Pridajte väčšinu bazalky (niekoľko lístkov si nechajte na ozdobu)',
    'Polievku rozmixujte ponorným mixérom do hladka',
    'Vráťte na oheň, pridajte smotanu a zohrejte (už nevarte)',
    'Dochutite soľou a korením',
    'Servírujte s čerstvou bazalkou a možno s krutonkami'
  ]
WHERE title = 'Paradajková polievka';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '300g čerstvej mozzarelly di bufala',
    '4 veľké zrelé paradajky (ideálne rôznych farieb)',
    'čerstvá bazalka (1 zväzok)',
    '4 PL extra panenského olivového oleja',
    '2 PL balzamikového octu (kvalitného)',
    'morská soľ',
    'čerstvo mleté čierne korenie'
  ],
  instructions = ARRAY[
    'Mozzarellu nechajte okvapiť a nakrájajte na plátky hrubé cca 1cm',
    'Paradajky nakrájajte na rovnako hrubé plátky',
    'Na servírovacom tanieri striedavo poukladajte plátky paradajok a mozzarelly',
    'Medzi plátky vkladajte čerstvé lístky bazalky',
    'Celý šalát pokvapkajte olivovým olejom',
    'Pridajte pár kvapiek balzamikového octu',
    'Posypte morskou soľou a čerstvo mletým čiernym korením',
    'Nechajte 10 minút odležať v izbovej teplote pred servírovaním',
    'Podávajte s čerstvým bageta chlebom'
  ]
WHERE title = 'Caprese šalát' OR title = 'Caprese';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g čerstvých špagiet alebo 400g suchých',
    '6-8 strúčikov cesnaku',
    '120ml extra panenského olivového oleja',
    '1-2 čerstvé chilli papričky (podľa chuti)',
    'čerstvý petržlen (1 zväzok)',
    'soľ na varenie',
    '50g strúhaného parmezánu (voliteľné)',
    'čierne korenie'
  ],
  instructions = ARRAY[
    'Varíte veľký hrniec osolenej vody',
    'Cesnak olúpte a nakrájajte na tenké plátky',
    'Chilli papričky nakrájajte nadrobno (odstráňte semienka ak chcete menej pikantné)',
    'Petržlen nakrájajte nadrobno',
    'Na veľkej panvici rozohrejte olivový olej na strednom ohni',
    'Pridajte cesnak a opražte 2-3 minúty dozlatista (pozor aby nezhorel)',
    'Pridajte chilli a opražte ďalšiu minútu',
    'Medzitým varte špagety al dente podľa návodu (8-10 minút)',
    'Odložte 150ml vody z cestovin',
    'Scedené špagety pridajte priamo do panvice s cesnakom',
    'Premiešajte, pridajte vodu z cestovin a petržlen',
    'Dochutite soľou a korením',
    'Servírujte s parmezánom (voliteľne)'
  ]
WHERE title = 'Aglio e Olio';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '600g kuracích pŕs',
    '2 väčšie hlávky rímskeho šalátu',
    '100g parmezánu',
    '150g krutoniek',
    '3 strúčiky cesnaku',
    '2 ančovičky v oleji',
    '2 žĺtky',
    '150ml olivového oleja',
    '2 PL citrónovej šťavy',
    '1 lyžička worcesterskej omáčky',
    '1 lyžička dijonskej horčice',
    'soľ, čierne korenie'
  ],
  instructions = ARRAY[
    'Kuracie prsia okoreňte soľou a korením, opečte na panvici 6-7 minút z každej strany',
    'Nechajte kura vychladnúť a nakrájajte na plátky',
    'Pripravte dresing: v mixéri rozmixujte ančovičky, cesnak, žĺtky a horčicu',
    'Za mixovania pomaly pridávajte olivový olej v tenkom prúde',
    'Pridajte citrónovú šťavu, worcesterskú omáčku, dochutite soľou a korením',
    'Rímsky šalát dôkladne umyte a natrhajte na menšie kúsky',
    'Šalát osušte v odstreďovači alebo utierkou',
    'V miske zmiešajte šalát s dresingom',
    'Pridajte kuracie mäso a krutonky',
    'Nasypte nastrúhaný parmezán',
    'Jemne premiešajte a servírujte ihneď'
  ]
WHERE title = 'Kurací Caesar šalát' OR title = 'Cézar šalát';

-- Update more recipes with detailed info
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g lasagne platní',
    '600g mletého hovädzieho mäsa',
    '400g paradajkového pretlaku',
    '1 cibuľa',
    '2 mrkvy',
    '2 stonky zeleru',
    '3 strúčiky cesnaku',
    '200ml červeného vína',
    '1 liter mlieka',
    '100g masla',
    '100g múky',
    '200g strúhaného parmezánu',
    'muškátový oriešok',
    'olivový olej',
    'soľ, korenie',
    'bobkový list'
  ],
  instructions = ARRAY[
    'Pripravte bolonskú omáčku: na olivovom oleji opražte nadrobno nakrájanú cibuľu',
    'Pridajte jemno nakrájanú mrkvu a zeler, opražte 10 minút',
    'Pridajte mleté mäso, opražte dokým nezhnedne',
    'Pridajte prelisovaný cesnak a opražte minútu',
    'Zalejte červeným vínom a nechajte odparovať',
    'Pridajte paradajkový pretlak, bobkový list, soľ, korenie',
    'Duste na miernom ohni 1.5 hodiny, občas premiešajte',
    'Pripravte bešamel: rozohrejte maslo, pridajte múku a opražte 2 minúty',
    'Postupne pridávajte teplé mlieko, neustále miešajte',
    'Varíte kým omáčka nezhustne, dochutite soľou a muškátovým orieškom',
    'V zapekacej mise dajte vrstvu bolonskej omáčky',
    'Pokryte lasagne platňami, bešamelom a parmezánom',
    'Opakujte vrstvy, skončite bešamelom a syrom',
    'Pečte v rúre vyhriatej na 180°C 40-45 minút dozlatista'
  ]
WHERE title = 'Lasagne';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '4 veľké paradajky',
    '300g čerstvej mozzarelly',
    '500g cesta na pizzu',
    '200ml paradajkovej omáčky na pizzu',
    'čerstvá bazalka (1 zväzok)',
    '3 PL olivového oleja',
    '2 strúčiky cesnaku',
    'soľ, oregano'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na maximálnu teplotu (najlepšie 250°C)',
    'Cesto rozvaľkajte na pomúčenej podložke na hrúbku 0.5cm',
    'Preložte cesto na plech vyložený papierom na pečenie',
    'Do paradajkovej omáčky pridajte prelisovaný cesnak a olivový olej',
    'Cesto natrite omáčkou, nechajte 1cm okraj',
    'Mozzarellu nakrájajte na plátky a rozložte po pizze',
    'Paradajky nakrájajte na tenké plátky a rozložte',
    'Pokvapkajte olivovým olejom, posypte soľou a oreganom',
    'Pečte 12-15 minút, kým okraje nie sú zlatisté',
    'Ihneď po vytiahnutí pridajte čerstvú bazalku',
    'Pokrájajte a servírujte horúcu'
  ]
WHERE title = 'Margherita pizza';
