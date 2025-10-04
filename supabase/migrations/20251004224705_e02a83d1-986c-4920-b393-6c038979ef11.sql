-- Update Predjedlá recipes with detailed ingredients and instructions
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '2 zrelé avokáda',
    '1 stredná červená cibuľa',
    '1 väčšia paradajka',
    'šťava z 1 limetky',
    '2 strúčiky cesnaku (prelisované)',
    '1 malá zelená chilli paprička',
    'čerstvý koriander (30g)',
    '½ lyžičky koreničkovej soli',
    '¼ lyžičky čierneho korenia'
  ],
  instructions = ARRAY[
    'Avokáda prekrojte, odstráňte kôstku a lyžicou vyberte dužinu',
    'Avokádo vložte do misky a vidličkou dôkladne rozmačkajte (môžete nechať kúsky)',
    'Cibuľu nakrájajte nadrobno a pridajte k avokádu',
    'Paradajku nakrájajte na malé kocky, odstráňte semienka',
    'Pridajte paradajky k avokádu',
    'Chilli papričku zbavte semienok a nadrobno nakrájajte',
    'Pridajte chilli, prelisovaný cesnak a nakrájaný koriander',
    'Vyžmýkajte limetkovú šťavu priamo do zmesi',
    'Dochutite soľou a korením',
    'Všetko dobre premiešajte',
    'Servírujte s tortilla čipsami alebo ako prílohu k tacos'
  ]
WHERE title = 'Guacamole';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '1 bageta alebo ciabatta',
    '4 veľké zrelé paradajky',
    '3 strúčiky cesnaku',
    'čerstvá bazalka (1 zväzok)',
    '4 PL extra panenského olivového oleja',
    '1 PL balzamikového octu',
    'morská soľ',
    'čierne korenie',
    'parmazán na posypanie (voliteľné)'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 200°C',
    'Bagetu nakrájajte na plátky hrubé 1-1.5cm šikmo',
    'Plátky chleba poukladajte na plech a pokvapkajte 2 PL olivového oleja',
    'Opečte v rúre 5-7 minút dozlatista, otočte a opečte z druhej strany',
    'Medzitým paradajky nakrájajte na malé kocky',
    'Bazalku nakrájajte nadrobno',
    'V miske zmiešajte paradajky, bazalku, 2 PL olivového oleja a balzamikový ocot',
    'Dochutite soľou a korením',
    'Jeden strúčik cesnaku prekrojte a potrite ním opečený chlieb',
    'Na každý plátok naložte paradajkovú zmes',
    'Podávajte ihneď, aby chlieb zostal chrumkavý'
  ]
WHERE title = 'Bruschetta';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '400g vareného cíceru (1 konzerva)',
    '60ml tahini (sezamovej pasty)',
    '3 strúčiky cesnaku',
    '60ml čerstvej citrónovej šťavy',
    '60ml olivového oleja + extra na pokvapkanie',
    '½ lyžičky koreničkovej soli',
    '¼ lyžičky mletej rasce',
    '80ml studenej vody',
    'paprika na posypanie'
  ],
  instructions = ARRAY[
    'Cícer dôkladne opláchnite a nechajte okvapiť',
    'Do mixéra vložte tahini a citrónovú šťavu, mixujte 1 minútu',
    'Pridajte prelisovaný cesnak, koreničkovú soľ a rascu',
    'Mixujte ďalšie 30 sekúnd',
    'Pridajte polovicu cíceru a mixujte do hladka',
    'Postupne pridávajte studenú vodu počas mixovania',
    'Pridajte zvyšný cícer a mixujte 1-2 minúty do krémova',
    'Ak je hummus príliš hustý, pridajte viac vody',
    'Ochutnajte a podľa chuti pridajte soľ alebo citrónovú šťavu',
    'Preložte na tanier, vytvorte jamku a nalejte olivový olej',
    'Posypte paprikou a servírujte s pitou alebo zeleninou'
  ]
WHERE title = 'Hummus';

-- Update Polievky
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '1 celé kura (1.5-2kg)',
    '3 mrkvy',
    '2 petržleny',
    '1 zeler',
    '1 cibuľa',
    '200g vaječných rezancov',
    '3 bobkové listy',
    '6 zŕn nového korenia',
    '5 zŕn čierneho korenia',
    'soľ',
    'čerstvý petržlen na servírovanie',
    '3 litre vody'
  ],
  instructions = ARRAY[
    'Kura dôkladne umyte a vložte do veľkého hrnca',
    'Zalejte 3 litrami studenej vody a priveďte k varu',
    'Zbierajte penu, ktorá sa tvorí na povrchu',
    'Zeleninu očistite a pridajte celú do hrnca',
    'Pridajte bobkové listy a korenie',
    'Prikryte pokrievkou a varte 1.5 hodiny na miernom ohni',
    'Kura a zeleninu vyberte z vývaru',
    'Vývar precedte cez jemné sitko',
    'Mäso zo kura stiahnite a nakrájajte na kúsky',
    'Mrkvu nakrájajte na kolieska',
    'Vývar dochuťte soľou',
    'Pridajte rezance a varte 8-10 minút',
    'Pridajte mäso a mrkvu, zohrejte',
    'Servírujte posypané čerstvým petržlenom'
  ]
WHERE title = 'Kurací vývar';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '800g hovädzieho mäsa na guláš',
    '3 väčšie cibuľe',
    '3 strúčiky cesnaku',
    '3 PL mletej papriky',
    '2 PL paradajkového pretlaku',
    '3 väčšie zemiaky',
    '2 papriky (červená a zelená)',
    '1 paradajka',
    '2 PL oleja',
    '1 lyžička rasce',
    'soľ, korenie',
    '1.5 litra hovädzieho vývaru',
    'bobkový list'
  ],
  instructions = ARRAY[
    'Mäso nakrájajte na kocky 2x2cm',
    'Na hrubodnom hrnci rozohrejte olej',
    'Cibuľu nakrájajte nadrobno a opražte dozlatista',
    'Pridajte mäso a opečte zo všetkých strán',
    'Stiahnite z ohňa a pridajte mletú papriku (pozor aby nezhorela)',
    'Pridajte prelisovaný cesnak a paradajkový pretlak',
    'Zalejte vývarom, pridajte bobkový list a rascu',
    'Prikryte a duste 1 hodinu na miernom ohni',
    'Zemiaky a papriky nakrájajte na kocky',
    'Paradajku nakrájajte na menšie kúsky',
    'Pridajte zeleninu do polievky',
    'Varte ďalších 30 minút, kým zemiaky nezmäknú',
    'Dochutite soľou a korením',
    'Servírujte s čerstvým chlebom'
  ]
WHERE title = 'Gulášová polievka';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '400g bielych fazulí (konzerva)',
    '400g červených fazulí (konzerva)',
    '3 paradajky',
    '2 cukety',
    '2 mrkvy',
    '2 stonky zeleru',
    '1 cibuľa',
    '3 strúčiky cesnaku',
    '150g malých cestovín (ditalini)',
    '1 liter zeleninového vývaru',
    '2 PL paradajkového pretlaku',
    '4 PL olivového oleja',
    'čerstvá bazalka',
    'oregano',
    'soľ, korenie',
    'parmazán na servírovanie'
  ],
  instructions = ARRAY[
    'Cibuľu, zeler a mrkvu nakrájajte nadrobno',
    'Na veľkom hrnci rozohrejte olivový olej',
    'Opražte cibuľu, zeler a mrkvu 8 minút',
    'Pridajte prelisovaný cesnak, opražte minútu',
    'Cuketu nakrájajte na kocky a pridajte',
    'Paradajky nakrájajte, pridajte s paradajkovým pretlakom',
    'Zalejte zeleninový vývar',
    'Pridajte oregano, bazalku, soľ a korenie',
    'Varte 20 minút na miernom ohni',
    'Pridajte opláchnute fazule',
    'Pridajte cestoviny a varte podľa návodu',
    'Dochutite soľou a korením',
    'Servírujte s parmazánom a čerstvou bazalkou',
    'Pokvapkajte olivovým olejom'
  ]
WHERE title = 'Minestrone';

-- Update more Polievky
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '1.5kg tekvice (najlepšie Hokkaido)',
    '1 cibuľa',
    '2 strúčiky cesnaku',
    '1 kúsok čerstvého zázvoru (3cm)',
    '150ml smotany na šľahanie',
    '1 liter zeleninového vývaru',
    '2 PL olivového oleja',
    '1 lyžička koreničkovej soli',
    '½ lyžičky muškátového oriešku',
    'soľ, korenie',
    'tekvicové semienka na ozdobu'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 200°C',
    'Tekvicu prekrojte, odstráňte semienka',
    'Nakrájajte na menšie kusy, pokropte olejom',
    'Pečte 35-40 minút, kým tekvica nezmäkne',
    'Cibuľu nakrájajte nadrobno',
    'Na hrnci rozohrejte olivový olej a opražte cibuľu',
    'Pridajte prelisovaný cesnak a nastrúhaný zázvor',
    'Opražte minútu',
    'Z upečenej tekvice lyžicou vyberte dužinu',
    'Pridajte tekvicu do hrnca',
    'Zalejte vývarom a varte 10 minút',
    'Ponorným mixérom rozmixujte do hladkej konzistencie',
    'Pridajte smotanu, muškátový oriešok, soľ a korenie',
    'Servírujte s pražnými tekkvicovými semienkami'
  ]
WHERE title = 'Tekvicová krémová';
