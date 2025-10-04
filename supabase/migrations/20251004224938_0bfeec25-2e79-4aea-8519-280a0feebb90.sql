-- Update Pizza recipes
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g cesta na pizzu',
    '200ml paradajkovej omáčky',
    '150g mozzarelly',
    '100g gorgonzoly',
    '80g parmezánu',
    '80g fontiny',
    '2 strúčiky cesnaku',
    '2 PL olivového oleja',
    'čerstvý rozmarín',
    'soľ, čierne korenie'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na maximálnu teplotu (250°C)',
    'Cesto rozvaľkajte na hrúbku 0.5cm',
    'Preložte na plech s papierom na pečenie',
    'Natrite jemnou vrstvou olivového oleja',
    'Prelisovaný cesnak rozmiešajte do oleja',
    'Mozzarellu, gorgonzolu a fontinu nakrájajte na kúsky',
    'Rovnomerne rozložte syry po ceste',
    'Nasypte nastrúhaný parmezán',
    'Pridajte lístky rozmarínu',
    'Pečte 12-15 minút, kým nie je zlatistá',
    'Servírujte horúcu s čiernym korením'
  ]
WHERE title = 'Quattro Formaggi';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '500g cesta na pizzu',
    '200ml pikantnej paradajkovej omáčky',
    '300g mozzarelly',
    '150g pikantnej talianskej klobásy (nduja alebo salami)',
    '2 čerstvé chilli papričky',
    '1 červená cibuľa',
    '3 PL olivového oleja',
    'oregano',
    'bazalka'
  ],
  instructions = ARRAY[
    'Rúru predhrejte na 250°C',
    'Cesto rozvaľkajte do kruhu',
    'Preložte na pripravený plech',
    'Natrite pikantnou paradajkovou omáčkou',
    'Mozzarellu nakrájajte na plátky a rozložte',
    'Klobásu nakrájajte na plátky a rozložte po pizze',
    'Chilli papričky nakrájajte na kolieska a rozložte',
    'Cibuľu nakrájajte na tenké pláty',
    'Posypte oreganom',
    'Pokvapkajte olivovým olejom',
    'Pečte 12-15 minút do zlatista',
    'Ozdobte čerstvou bazalkou a servírujte'
  ]
WHERE title = 'Diavola';

-- Update Šaláty
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '4 veľké zrelé paradajky',
    '1 uhorka',
    '200g feta syra',
    '150g čiernych Kalamata olív',
    '1 červená cibuľa',
    '1 zelená paprika',
    '4 PL extra panenského olivového oleja',
    '1 PL červeného vinného octu',
    '1 lyžička sušeného oregana',
    'soľ, čierne korenie'
  ],
  instructions = ARRAY[
    'Paradajky nakrájajte na väčšie kúsky',
    'Uhorku olúpte pruhmi a nakrájajte na hrubšie plátky',
    'Papriku nakrájajte na pásiky',
    'Cibuľu nakrájajte na tenké polmesiace',
    'Olivy nechajte celé alebo prekrojte',
    'V miske zmiešajte nakrájanú zeleninu',
    'Feta syr nakrájajte na hrubé kocky',
    'Pridajte fetu k zelenine',
    'V malej miske zmiešajte olivový olej a ocot',
    'Pridajte oregano, soľ a korenie do dresingu',
    'Zalejte šalát dresingom',
    'Jemne premiešajte',
    'Nechajte 10 minút odpočinúť pred servírovaním'
  ]
WHERE title = 'Grécky šalát';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '200g quino',
    '1 uhorka',
    '250g cherry paradajok',
    '1 zrelé avokádo',
    '1/2 červenej cibuľky',
    'šťava z 2 limetiek',
    '4 PL olivového oleja',
    'čerstvá mäta (30g)',
    'čerstvý koriander (30g)',
    'soľ, čierne korenie',
    '50g pražených semienok (slnečnica, tekvica)'
  ],
  instructions = ARRAY[
    'Quinuu dôkladne opláchnite pod studenou vodou',
    'Varte v osolenej vode 15 minút, kým nezmäkne',
    'Scedťe a nechajte vychladnúť',
    'Uhorku nakrájajte na malé kocky',
    'Cherry paradajky prekrojte na polovice',
    'Avokádo nakrájajte na kocky',
    'Cibuľku nakrájajte nadrobno',
    'Mätu a koriander nakrájajte',
    'V miske zmiešajte vychladnutú quinuu so zeleninou',
    'Pridajte bylinky',
    'Zmiešajte olivový olej s limetkovou šťavou',
    'Zalejte šalát dresingom',
    'Dochutite soľou a korením',
    'Pred servírovaním posypte praženými semienkami'
  ]
WHERE title = 'Quinoa šalát';

-- Update Nápoje
UPDATE public.recipes SET 
  ingredients = ARRAY[
    '2 zrelé banány',
    '250g jahôd',
    '200ml prírodného jogurtu',
    '100ml mlieka',
    '2 PL medu',
    '1 lyžička vanilkového extraktu',
    '1 šálka ľadových kociek',
    'čerstvá mäta na ozdobu'
  ],
  instructions = ARRAY[
    'Jahody dôkladne umyte a odstráňte stopky',
    'Banány olúpte a nakrájajte na kúsky',
    'Do mixéra vložte banány a jahody',
    'Pridajte jogurt a mlieko',
    'Pridajte med a vanilkový extrakt',
    'Pridajte ľadové kocky',
    'Mixujte 30-45 sekúnd do hladka',
    'Ak je príliš husté, pridajte viac mlieka',
    'Nalejte do pohárov',
    'Ozdobte čerstvou jahodou a mätou',
    'Servírujte ihneď'
  ]
WHERE title = 'Smoothie';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '2 hrste čerstvého špenátu',
    '1 zrelý banán',
    '1 zelené jablko',
    '1 kúsok zázvoru (2cm)',
    '250ml kokosovej vody',
    '1 PL chia semienok',
    'šťava z ½ limetky',
    '1 lyžička medu (voliteľné)',
    '½ šálky ľadu'
  ],
  instructions = ARRAY[
    'Špenát dôkladne umyte',
    'Banán olúpte a nakrájajte',
    'Jablko vykrájajte a nakrájajte (s kôrou)',
    'Zázvor olúpte a nastrúhajte',
    'Do mixéra vložte špenát a kokosovú vodu',
    'Mixujte 15 sekúnd',
    'Pridajte banán, jablko a zázvor',
    'Pridajte chia semienka a limetkovú šťavu',
    'Pridajte ľad a med',
    'Mixujte 30-40 sekúnd do úplne hladka',
    'Ak je príliš hustý, pridajte viac kokosovej vody',
    'Nalejte do pohára a servírujte ihneď'
  ]
WHERE title = 'Zelené smoothie';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '30g proteínového prášku (vanilka alebo čokoláda)',
    '1 zrelý banán',
    '250ml mlieka (kravské alebo rastlinné)',
    '2 PL arašidového masla',
    '2 PL ovosných vločiek',
    '1 PL chia semienok',
    '1 lyžička medu',
    '½ šálky ľadu',
    'škorica na posypanie'
  ],
  instructions = ARRAY[
    'Banán olúpte a nakrájajte',
    'Do mixéra vložte mlieko',
    'Pridajte proteínový prášok',
    'Pridajte banán a arašidové maslo',
    'Pridajte ovosné vločky a chia semienka',
    'Pridajte med a ľad',
    'Mixujte 30-45 sekúnd do hladka',
    'Kontrolujte konzistenciu, pridajte viac mlieka ak je potrebné',
    'Nalejte do vysokého pohára',
    'Posypte škoricou',
    'Servírujte ihneď, najlepšie po tréningu'
  ]
WHERE title = 'Protein shake';

UPDATE public.recipes SET 
  ingredients = ARRAY[
    '6 veľkých citrónov',
    '150g kryštálového cukru',
    '1.5 litra studenej vody',
    '1 zväzok čerstvej mäty',
    'ľad na servírovanie',
    '1 citrón na plátky (na ozdobu)'
  ],
  instructions = ARRAY[
    'Citróny dôkladne umyte teplou vodou',
    'Vyžmýkajte šťavu zo 6 citrónov (cca 250ml)',
    'V malom hrnci zohrejte 250ml vody s cukrom',
    'Miešajte kým sa cukor nerozpustí',
    'Nechajte sirup vychladnúť',
    'V džbáne zmiešajte citrónovú šťavu so sirupom',
    'Pridajte zvyšnú studenú vodu',
    'Mätu jemne poklepte v dlani a pridajte do limonády',
    'Dobre premiešajte a chlaďte 1 hodinu',
    'Jeden citrón nakrájajte na plátky',
    'Servírujte s ľadom a plátkami citróna',
    'Ozdobte vetvičkou mäty'
  ]
WHERE title = 'Limonáda';
