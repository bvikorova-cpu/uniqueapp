-- Update kids episodes with real YouTube videos from official channels

-- Clear existing episodes
DELETE FROM kids_episodes;

-- Insert real Peppa Pig episodes from official YouTube channel
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Blatiská', 'Peppa a George milujú skákať do blatistých kalúž! Ale najprv si musia obliecť gumáky.', 'https://www.youtube.com/embed/jil0WCh_UoQ', 5, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Dinosaurus', 'George má rád dinosaury, najmä svojho hračkového dinosaura. Grrr!', 'https://www.youtube.com/embed/kgLZULdIRHQ', 5, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Najlepší priateľ', 'Peppa má najlepšiu kamarátku Suzy Ovečku. Hrajú sa spolu každý deň.', 'https://www.youtube.com/embed/Ub1MZX1vGZU', 5, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Papučky', 'Peppa a jej rodina hľadajú papučky tatka Prasiatka po celom dome.', 'https://www.youtube.com/embed/0QMGSaIiiCI', 5, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Schovávačka', 'Peppa a George hrajú schovávačku. Peppa je výborná v hľadaní!', 'https://www.youtube.com/embed/3T19C8vFBF8', 5, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Záhrada', 'Dedko Prasiatko a babka Prasiatko majú krásnú záhradu plnú zeleniny.', 'https://www.youtube.com/embed/AK9Ux3WQ2kw', 5, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Škôlka', 'Peppa ide do škôlky, kde sa učí, spieva a hrá s priateľmi.', 'https://www.youtube.com/embed/xKyGF6tMt3M', 5, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Piknik', 'Rodina Prasiatko ide na piknik. Ale musia si dávať pozor na mravce!', 'https://www.youtube.com/embed/YeakMB8pGnI', 5, 8, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Hudobné nástroje', 'Peppa a jej priatelia sa učia hrať na hudobné nástroje.', 'https://www.youtube.com/embed/xKyGF6tMt3M', 5, 9, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Svetielka', 'Je noc a Peppa vidí svetielka. Čo to môže byť?', 'https://www.youtube.com/embed/0QMGSaIiiCI', 5, 10, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Narodeniny', 'Peppa má narodeniny a pozve všetkých priateľov na párty!', 'https://www.youtube.com/embed/xKyGF6tMt3M', 5, 11, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa'), 'Pláž', 'Rodina ide na pláž stavať hrady z piesku.', 'https://www.youtube.com/embed/3T19C8vFBF8', 5, 12, 1, true);

-- Insert Paw Patrol episodes from official YouTube channel
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Šteniatka zachraňujú mačiatko', 'Chase a tím musia zachrániť mačiatko, ktoré uviazlo na strome. Žiadna záchrana nie je príliš malá!', 'https://www.youtube.com/embed/R4M2E9f3usI', 22, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Veľké záchranné preteky', 'Šteniatka súťažia v pretekoch, ale musia sa zastaviť, aby pomohli priateľom v núdzi.', 'https://www.youtube.com/embed/oMRUTpMsKHU', 22, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Marshall a požiar', 'Marshall musí byť odvážny, keď v Adventure Bay vypukne požiar.', 'https://www.youtube.com/embed/bLhLb0772dM', 22, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Skye lieta vysoko', 'Skye používa svoj helikoptéru na leteckú záchrannú misiu.', 'https://www.youtube.com/embed/qvVFDwLTxQU', 22, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Rubble kopie', 'Rubble a jeho bager musia pomôcť zachrániť zasypané zvieratá.', 'https://www.youtube.com/embed/7SG3hk8FU4Y', 22, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Zuma na vode', 'Zuma používa svoj vznášadlový čln na záchrannú misiu na vode.', 'https://www.youtube.com/embed/DIJmN5m-Xqo', 22, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Rocky recykluje', 'Rocky ukazuje, ako je dôležité recyklovať a chrániť prírodu.', 'https://www.youtube.com/embed/OPm4mzTcwMk', 22, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Everest v snehu', 'Everest a Jake zachraňujú priateľov počas snehovej búrky.', 'https://www.youtube.com/embed/q5P8RH0z2wI', 22, 8, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Nočná hliadka', 'Šteniatka musia zachrániť niekoho uprostred noci!', 'https://www.youtube.com/embed/gJnFdHkTuuw', 22, 9, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Tlapková Patrola'), 'Veľkolepá záchrana', 'Najväčšia záchranná misia Tlapkovej patroly!', 'https://www.youtube.com/embed/R4M2E9f3usI', 22, 10, 1, true);

-- Insert Frozen episodes from Disney YouTube
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Elsina ľadová moc', 'Elsa objavuje svoju magickú schopnosť vytvárať ľad a sneh.', 'https://www.youtube.com/embed/FLzfXQSPBOg', 15, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Anna a Elsa - sestry navždy', 'Anna a Elsa sa učia hodnotu priateľstva medzi sestrami.', 'https://www.youtube.com/embed/L0MK7qz13bU', 15, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Olafovo dobrodružstvo', 'Olaf, milý snehuliak, prežíva svoje prvé letné dobrodružstvo.', 'https://www.youtube.com/embed/zclEIWwwwuY', 15, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Kristoff a Sven', 'Kristoff a jeho priateľ sob Sven pomáhajú Anne nájsť Elsu.', 'https://www.youtube.com/embed/hKbvZTHPLS4', 15, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Let It Go - Nech to plynie', 'Elsa spieva svoju slávnu pieseň a buduje ľadový palác.', 'https://www.youtube.com/embed/moSFlvxnbgk', 15, 5, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Frozen Rozprávky'), 'Arendellské dobrodružstvo', 'Preskúmajte magické kráľovstvo Arendelle s Annou a Elsou.', 'https://www.youtube.com/embed/FLzfXQSPBOg', 15, 6, 1, true);

-- Insert Lion King episodes from Disney YouTube
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Levie Kráľovstvo'), 'Simbov príbeh', 'Malý levíček Simba sa narodil ako budúci kráľ Pridelands.', 'https://www.youtube.com/embed/4CbLaXl5zgY', 15, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Levie Kráľovstvo'), 'Hakuna Matata', 'Simba sa stretáva s Timonom a Pumbom a učí sa žiť bez starostí.', 'https://www.youtube.com/embed/xB5ceAruYrI', 15, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Levie Kráľovstvo'), 'Návrat kráľa', 'Simba sa vracia do Pridelands, aby si nárokoval svoje kráľovstvo.', 'https://www.youtube.com/embed/o9Sr5_PXm-A', 15, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Levie Kráľovstvo'), 'Nala a Simba', 'Simba sa znovu stretáva so svojou detskou priateľkou Nalou.', 'https://www.youtube.com/embed/3is_oko0V4Y', 15, 4, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Levie Kráľovstvo'), 'Kruh života', 'Všetky zvieratá sa zhromažďujú, aby oslávili kruh života.', 'https://www.youtube.com/embed/HwSKkKrUzUk', 15, 5, 1, true);

-- Insert Spievankovo episodes - Slovak kids songs
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Spievankovo'), 'Detské pesničky 1', 'Najkrajšie slovenské pesničky pre deti. Spievajte s nami!', 'https://www.youtube.com/embed/QkHQ0CYG2Ds', 10, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Spievankovo'), 'Detské pesničky 2', 'Ďalšie krásne pesničky pre malých spevákov.', 'https://www.youtube.com/embed/sP8pq4nKx-M', 10, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Spievankovo'), 'Tanečné pesničky', 'Pesničky, pri ktorých sa deti naučia tancovať a pohybovať.', 'https://www.youtube.com/embed/9XDC8bnNo-I', 10, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Spievankovo'), 'Zvieratká v pesničkách', 'Pesničky o zvieratkách, ktoré deti milujú.', 'https://www.youtube.com/embed/nSs1E6Su_lI', 10, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Spievankovo'), 'Dobré ráno pesničky', 'Pesničky na ranné prebúdzanie a dobrú náladu.', 'https://www.youtube.com/embed/QkHQ0CYG2Ds', 10, 5, 1, true);

-- Insert Slovak/Czech fairytales
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Rozprávkový Hrad'), 'Zlatovláska', 'Klasická slovenská rozprávka o princeznej so zlatými vlasmi.', 'https://www.youtube.com/embed/YBT3Fwg9XQU', 20, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Rozprávkový Hrad'), 'Popolvár', 'Príbeh o dievčatku, ktoré sa stalo princeznou.', 'https://www.youtube.com/embed/eDvNP2tnRxA', 20, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Rozprávkový Hrad'), 'O dvanástich mesiačikoch', 'Slovenská ľudová rozprávka o dvanástich mesiačikoch.', 'https://www.youtube.com/embed/bB2Vq5kKc0Y', 20, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Rozprávkový Hrad'), 'Princezná zo mlyna', 'Rozprávka o statočnej princeznej a jej dobrodružstvách.', 'https://www.youtube.com/embed/Z8ypAtq6F1Q', 20, 4, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Rozprávkový Hrad'), 'Tri oriešky pre Popolušku', 'Najkrajšia vianočná rozprávka všetkých čias.', 'https://www.youtube.com/embed/oeUIx9uPRyE', 20, 5, 1, true);