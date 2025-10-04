-- Update Hlavné jedlá recipes
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '800g kuracích stehien',
    '2 väčšie cibuľe',
    '3 strúčiky cesnaku',
    '3 PL sladkej papriky',
    '1 PL pálivej papriky',
    '200ml smotany na varenie',
    '400ml kuracieho vývaru',
    '2 PL oleja',
    '2 PL múky',
    '1 paradajka',
    '1 zelená paprika',
    'soľ, korenie',
    'rasca'
  ],
  instructions = ARRAY[
    'Kuracie mäso nakrájajte na väčšie kúsky',
    'Okoreňte soľou a korením',
    'Na veľkej panvici rozohrejte olej',
    'Opečte kura z oboch strán dozlatista, vyberte',
    'Do tej istej panvice pridajte nakrájanú cibuľu',
    'Opražte 8 minút dozlatista',
    'Stiahnite z ohňa, pridajte sladkú a pálivú papriku',
    'Rýchlo premiešajte (pozor aby nezhorela)',
    'Vráťte na oheň, pridajte múku a premiešajte',
    'Postupne dolievajte vývar, miešajte',
    'Pridajte nakrájanú paradajku a papriku',
    'Vráťte kura do omáčky',
    'Pridajte rascu, duste prikryté 30 minút',
    'Dolejte smotanu, zohrejte (už nevarte)',
    'Servírujte s knedlíkmi alebo ryžou'
  ]
WHERE title = 'Kurča na paprike';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '350g ryže arborio',
    '400g čerstvých húb (šampióny, hliva)',
    '1 cibuľa',
    '3 strúčiky cesnaku',
    '150ml bieleho vína',
    '1.2 litra teplého zeleninového vývaru',
    '100g parmezánu',
    '50g masla',
    '3 PL olivového oleja',
    'čerstvý tymián',
    'soľ, čierne korenie',
    'čerstvý petržlen'
  ],
  instructions = ARRAY[
    'Huby očistite a nakrájajte na plátky',
    'Cibuľu nakrájajte nadrobno',
    'V kastróle rozohrejte olivový olej a maslo',
    'Opražte cibuľu 5 minút dozlatista',
    'Pridajte huby a opražte 8 minút',
    'Pridajte prelisovaný cesnak a tymián',
    'Opražte minútu',
    'Pridajte ryžu a opražte 2 minúty',
    'Zalejte vínom a nechajte odparovať',
    'Pridávajte vývar po naberačke, miešajte',
    'Každú dávku vývaru nechajte absorbovať pred pridaním ďalšej',
    'Varíte cca 18-20 minút, kým ryža nie je al dente',
    'Odstavte z ohňa, pridajte maslo a parmazán',
    'Energicky premiešajte',
    'Servírujte ihneď s extra parmezánom'
  ]
WHERE title = 'Rizoto s hubami';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '2 lososové filé (po 200g)',
    '400g čerstvej brokolice',
    '3 strúčiky cesnaku',
    'šťava z 1 citróna',
    'kôra z 1 citróna',
    '4 PL olivového oleja',
    '2 PL masla',
    'soľ, čierne korenie',
    'čerstvý dill',
    'cherry paradajky na ozdobu'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 200°C',
    'Lososové filé osušte papierovou utierkou',
    'Okoreňte soľou a korením z oboch strán',
    'Brokolicu rozdeľte na ružičky',
    'Na panvici rozohrejte 2 PL olivového oleja',
    'Opečte lososa z jednej strany 3-4 minúty',
    'Otočte a preložte do rúry na 6-8 minút',
    'Medzitým blanšírujte brokolicu v osolenej vode 3 minúty',
    'Scedťe a ihneď opláchnite studenou vodou',
    'Na panvici rozohrejte maslo s olivovým olejom',
    'Pridajte prelisovaný cesnak, opražte minútu',
    'Pridajte brokolicu, opražte 3 minúty',
    'Dochutite soľou, korením a citrónovou šťavou',
    'Lososa podávajte s brokolicou',
    'Ozdobte citrónom, dillom a cherry paradajkami'
  ]
WHERE title = 'Losos s brokolicou';

-- Update Dezerty
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g piškót (Savoiardi)',
    '500g mascarpone',
    '4 vajcia (žĺtky a bielky oddelene)',
    '100g cukru',
    '300ml silnej kávy (vychladnutej)',
    '50ml amaretto likéru (voliteľné)',
    'kakao na posypanie',
    '1 lyžička vanilkového extraktu'
  ],
  instructions = ARRAY[
    'Uvarte silnú kávu a nechajte vychladnúť',
    'Ak používate, pridajte amaretto do kávy',
    'Žĺtky vyšľahajte s polovicou cukru do svetlej peny',
    'Pridajte mascarpone a vanilkový extrakt',
    'Šľahajte do hladkej krémovej konzistencie',
    'V čistej mise vyšľahajte bielky do pevného sneh',
    'Postupne pridávajte zvyšný cukor počas šľahania',
    'Jemne vmiešajte bielkový sneh do mascarpone zmesi',
    'Piškóty rýchlo namočte do kávy (len na sekundu)',
    'Poukladajte vrstvu namočených piškót do formy',
    'Natrite vrstvu mascarpone krému',
    'Opakujte vrstvy (2-3 vrstvy)',
    'Zakryte fóliou a chlaďte minimálne 4 hodiny (najlepšie cez noc)',
    'Pred servírovaním hustó posypte kakaom',
    'Nakrájajte a servírujte vychladené'
  ]
WHERE title = 'Tiramisu';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '300g horkej čokolády (70%)',
    '200g masla',
    '4 vajcia',
    '200g kryštálového cukru',
    '150g hladkej múky',
    '50g kakaa',
    '1 lyžička prášku do pečiva',
    'štipka soli',
    '1 lyžička vanilkového extraktu',
    '100g tmavej čokolády na ozdobu'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 180°C',
    'Formu (priemer 24cm) vymastite maslom a vysypte múkou',
    'Čokoládu a maslo roztoťte vo vodnom kúpeli',
    'Nechajte mierne vychladnúť',
    'Vajcia vyšľahajte s cukrom 5 minút do peny',
    'Pridajte vanilkový extrakt',
    'Pomaly vmiešajte rozpustenú čokoládu',
    'Múku, kakao, prášok do pečiva a soľ premiešajte',
    'Jemne vmiešajte suché prísady do čokoládovej zmesi',
    'Vlejte cesto do pripravenej formy',
    'Pečte 35-40 minút (stred má byť jemne vlhký)',
    'Nechajte vo forme vychladnúť 10 minút',
    'Vyklopte na mriežku a nechajte úplne vychladnúť',
    'Rozpusťte tmavú čokoládu a poliate tortu',
    'Nechajte stuhnúť a servírujte'
  ]
WHERE title = 'Čokoládová torta';

-- Continue with more recipes in next migration
