-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  time TEXT NOT NULL,
  servings INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active recipes" 
ON public.recipes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create recipes" 
ON public.recipes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update recipes" 
ON public.recipes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample recipes (100+ recipes)
INSERT INTO public.recipes (title, category, difficulty, time, servings, calories, image_url, description, ingredients, instructions, tags) VALUES
-- Predjedlá (10)
('Guacamole', 'Predjedlá', 'Ľahké', '10 min', 4, 160, 'https://images.unsplash.com/photo-1601026296557-9e2f22c4ef05', 'Mexická omáčka z avokáda', ARRAY['2 avokáda', '1 cibuľa', '1 paradajka', 'šťava z limetky', 'soľ'], ARRAY['Rozmačkať avokádo', 'Pridať nakrájanú cibuľu a paradajky', 'Dochutiť šťavou z limetky a soľou'], ARRAY['mexické', 'vegetariánske', 'bezlepkové']),
('Bruschetta', 'Predjedlá', 'Ľahké', '15 min', 4, 180, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f', 'Talianske opekané chlebíky s paradajkami', ARRAY['4 plátky chleba', '3 paradajky', 'cesnak', 'bazalka', 'olivový olej'], ARRAY['Opiecť chlieb', 'Potlačiť cesnakom', 'Pridať nakrájané paradajky a bazalku'], ARRAY['talianske', 'vegetariánske']),
('Hummus', 'Predjedlá', 'Ľahké', '10 min', 6, 140, 'https://images.unsplash.com/photo-1639024471283-03518883512d', 'Cícerová nátierka', ARRAY['400g cíceru', '2 PL tahini', 'cesnak', 'olivový olej', 'koreničková soľ'], ARRAY['Rozmixovať všetky prísady', 'Dochutiť podľa chuti'], ARRAY['vegánske', 'bezlepkové', 'blízkovýchodné']),
('Caprese šalát', 'Predjedlá', 'Ľahké', '10 min', 2, 220, 'https://images.unsplash.com/photo-1592417817038-d13fd7342e31', 'Mozzarella s paradajkami', ARRAY['mozzarella', '3 paradajky', 'bazalka', 'olivový olej', 'balzamikový ocot'], ARRAY['Nakrájať paradajky a mozzarellu', 'Poukladať na tanier', 'Pokvapkať olejom a octom'], ARRAY['talianske', 'vegetariánske', 'bezlepkové']),
('Pečené baklažány', 'Predjedlá', 'Stredné', '40 min', 4, 200, 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c', 'Baklažány s paradajkovou omáčkou', ARRAY['2 baklažány', 'paradajková omáčka', 'mozzarella', 'bazalka'], ARRAY['Nakrájať baklažány', 'Piecť s omáčkou a syrom'], ARRAY['vegetariánske', 'talianske']),
('Cesnakový chlieb', 'Predjedlá', 'Ľahké', '20 min', 6, 250, 'https://images.unsplash.com/photo-1573140401552-3fab0b24f9a6', 'Chrumkavý chlieb s cesnakom a maslom', ARRAY['1 bageta', '100g masla', '4 strúčiky cesnaku', 'petržlen'], ARRAY['Rozmiešať maslo s cesnakom', 'Natierať na chlieb', 'Piecť v rúre'], ARRAY['vegetariánske']),
('Krevety na masle', 'Predjedlá', 'Stredné', '15 min', 4, 280, 'https://images.unsplash.com/photo-1565299543923-37dd37887442', 'Šťavnaté krevety s cesnakom', ARRAY['500g kreviet', 'maslo', 'cesnak', 'petržlen', 'citrón'], ARRAY['Osmažiť cesnak na masle', 'Pridať krevety', 'Dochutiť citrónovou šťavou'], ARRAY['morské plody', 'bezlepkové']),
('Tzatziki', 'Predjedlá', 'Ľahké', '15 min', 6, 120, 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff', 'Grécka uhorková omáčka', ARRAY['jogurt', '1 uhorka', 'cesnak', 'olivový olej', 'dill'], ARRAY['Nastrúhať uhorku', 'Zmiešať s jogurtom a cesnakom'], ARRAY['grécke', 'vegetariánske', 'bezlepkové']),
('Pečené papriky', 'Predjedlá', 'Stredné', '30 min', 4, 150, 'https://images.unsplash.com/photo-1608877907149-a206d75ba011', 'Sladké pečené papriky', ARRAY['4 papriky', 'olivový olej', 'cesnak', 'bazalka'], ARRAY['Upiecť papriky', 'Ošúpať a nakrájať', 'Marinovať v oleji'], ARRAY['vegánske', 'bezlepkové']),
('Spring rolls', 'Predjedlá', 'Stredné', '30 min', 4, 180, 'https://images.unsplash.com/photo-1587573111706-e6f0b4c67eec', 'Ázijské jarné závitky', ARRAY['ryžový papier', 'mrkva', 'uhorka', 'rezance', 'mint'], ARRAY['Namočiť ryžový papier', 'Naplniť zeleninou', 'Zabaliť'], ARRAY['ázijské', 'bezlepkové']),

-- Polievky (10)
('Kurací vývar', 'Polievky', 'Ľahké', '1 hod', 6, 180, 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 'Tradičný kurací vývar s rezancami', ARRAY['1 kura', 'mrkva', 'zeler', 'cibuľa', 'rezance'], ARRAY['Uvariť kura', 'Pridať zeleninu', 'Dochutiť'], ARRAY['tradičné', 'bezlepkové']),
('Paradajková polievka', 'Polievky', 'Ľahké', '30 min', 4, 150, 'https://images.unsplash.com/photo-1622923764737-2a767f9c4f14', 'Krémová paradajková polievka', ARRAY['1kg paradajok', 'cibuľa', 'cesnak', 'smotana', 'bazalka'], ARRAY['Opražiť cibuľu a cesnak', 'Pridať paradajky', 'Rozmixovať'], ARRAY['vegetariánske']),
('Gulášová polievka', 'Polievky', 'Náročné', '2 hod', 6, 320, 'https://images.unsplash.com/photo-1604908815221-0048a909ae8c', 'Sýta maďarská polievka', ARRAY['hovädzie mäso', 'cibuľa', 'paprika', 'paradajky', 'zemiaky'], ARRAY['Osmažiť mäso', 'Pridať zeleninu', 'Variť pomaly'], ARRAY['tradičné', 'maďarské']),
('Minestrone', 'Polievky', 'Stredné', '45 min', 6, 200, 'https://images.unsplash.com/photo-1610218467732-07e46441c4fe', 'Talianska zeleninová polievka', ARRAY['fazuľa', 'rajčiny', 'cesnak', 'pasta', 'zelenina'], ARRAY['Opražiť zeleninu', 'Pridať fazuľu a rajčiny', 'Variť s pastou'], ARRAY['talianske', 'vegetariánske']),
('Tom Yum', 'Polievky', 'Stredné', '30 min', 4, 180, 'https://images.unsplash.com/photo-1596797038530-2c107229654b', 'Thajská kyslá polievka', ARRAY['krevety', 'citrónová tráva', 'galangal', 'chilli', 'hríby'], ARRAY['Uvariť vývár', 'Pridať krevety a korenie'], ARRAY['thajské', 'bezlepkové', 'pikantné']),
('Tekvicová krémová', 'Polievky', 'Ľahké', '40 min', 4, 160, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a', 'Jemná tekvicová polievka', ARRAY['1kg tekvice', 'cibuľa', 'smotana', 'zázvor', 'vývár'], ARRAY['Upiecť tekvicu', 'Rozmixovať so smotanou'], ARRAY['vegetariánske', 'bezlepkové']),
('Francúzska cibuľová', 'Polievky', 'Stredné', '1 hod', 4, 280, 'https://images.unsplash.com/photo-1547592180-85f173990554', 'Klasická cibuľová polievka so syrom', ARRAY['5 cibuľ', 'hovädzie víno', 'bageta', 'gruyère syr'], ARRAY['Karamelizovať cibuľu', 'Zalievať vývarom', 'Zapiecť so syrom'], ARRAY['francúzske']),
('Šošovicová polievka', 'Polievky', 'Ľahké', '35 min', 6, 220, 'https://images.unsplash.com/photo-1547592166-91b21a91a2c2', 'Výživná polievka zo šošovice', ARRAY['šošovica', 'mrkva', 'zeler', 'cesnak', 'koreničková soľ'], ARRAY['Uvariť šošovicu', 'Pridať zeleninu'], ARRAY['vegánske', 'bezlepkové', 'fitness']),
('Ramen', 'Polievky', 'Náročné', '2 hod', 4, 380, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624', 'Japonská polievka s rezancami', ARRAY['bravčové mäso', 'vajce', 'ramen rezance', 'šalotka', 'miso pasta'], ARRAY['Pripraviť vývár', 'Uvariť mäso', 'Pridať rezance'], ARRAY['japonské', 'ázijské']),
('Krémová hubová', 'Polievky', 'Stredné', '40 min', 4, 240, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4', 'Lahodná polievka z húb', ARRAY['500g húb', 'cibuľa', 'smotana', 'maslo', 'biele víno'], ARRAY['Opražiť huby', 'Pridať smotanu', 'Rozmixovať'], ARRAY['vegetariánske']),

-- Hlavné jedlá (20)
('Sviečková na smotane', 'Hlavné jedlá', 'Náročné', '2 hod 30 min', 4, 520, 'https://images.unsplash.com/photo-1603073163308-9c4f1678d9c0', 'Klasické české jedlo', ARRAY['hovädzie mäso', 'mrkva', 'zeler', 'smotana', 'knedlíky'], ARRAY['Marinovať mäso', 'Upiecť so zeleninou', 'Pripraviť omáčku'], ARRAY['české', 'tradičné']),
('Lasagne', 'Hlavné jedlá', 'Náročné', '1 hod 30 min', 6, 480, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3', 'Talianske cestoviny zapekané', ARRAY['mleté mäso', 'paradajková omáčka', 'bešamel', 'lasagne plátky', 'parmezán'], ARRAY['Pripraviť mäsovú omáčku', 'Striedať vrstvy', 'Zapiecť v rúre'], ARRAY['talianske']),
('Kurča na paprike', 'Hlavné jedlá', 'Stredné', '1 hod', 4, 420, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6', 'Maďarské jedlo s kuracím mäsom', ARRAY['kuracie mäso', 'cibuľa', 'paprika', 'smotana', 'knedlíky'], ARRAY['Osmažiť mäso', 'Pridať papriku', 'Doliať smotanou'], ARRAY['maďarské', 'tradičné']),
('Rizoto s hubami', 'Hlavné jedlá', 'Stredné', '45 min', 4, 380, 'https://images.unsplash.com/photo-1476124369491-b79d94986f24', 'Krémové talianske rizoto', ARRAY['ryža arborio', 'huby', 'biele víno', 'parmezán', 'vývár'], ARRAY['Opražiť ryžu', 'Postupne pridávať vývár', 'Domiešať syr'], ARRAY['talianske', 'vegetariánske']),
('Losos s brokolicou', 'Hlavné jedlá', 'Ľahké', '30 min', 2, 420, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 'Zdravé fitness jedlo', ARRAY['losos', 'brokolica', 'citrón', 'olivový olej', 'cesnak'], ARRAY['Upiecť lososa', 'Uvariť brokolicu', 'Pokvapkať citrónom'], ARRAY['fitness', 'bezlepkové', 'zdravé']),
('Steak s hranolčekmi', 'Hlavné jedlá', 'Stredné', '40 min', 2, 680, 'https://images.unsplash.com/photo-1600891964092-4316c288032e', 'Šťavnatý hovädží steak', ARRAY['hovädzie steak', 'zemiaky', 'maslo', 'rozmarín', 'cesnak'], ARRAY['Opiecť steak', 'Pripraviť hranolky', 'Servírovať s maslom'], ARRAY['gril']),
('Kurací Caesar šalát', 'Hlavné jedlá', 'Ľahké', '25 min', 2, 380, 'https://images.unsplash.com/photo-1546793665-c74683f339c1', 'Klasický Caesar s kuracím mäsom', ARRAY['kuracie prsia', 'rímsky šalát', 'parmezán', 'krutonky', 'caesar dresing'], ARRAY['Opiecť kuracie mäso', 'Zmiešať šalát', 'Pridať dresing'], ARRAY['šaláty', 'fitness']),
('Hovädzie po burgundsky', 'Hlavné jedlá', 'Náročné', '3 hod', 6, 560, 'https://images.unsplash.com/photo-1595777216528-071e0127ccf4', 'Francúzske dusené mäso', ARRAY['hovädzie mäso', 'červené víno', 'cibuľa', 'mrkva', 'slanina'], ARRAY['Opiecť mäso', 'Dusiť vo víne', 'Pridať zeleninu'], ARRAY['francúzske']),
('Kuracie teriyaki', 'Hlavné jedlá', 'Stredné', '35 min', 4, 420, 'https://images.unsplash.com/photo-1606995926016-e9c5c8eb7b12', 'Japonské sladko-slané kura', ARRAY['kuracie stehná', 'teriyaki omáčka', 'zázvor', 'cesnak', 'ryža'], ARRAY['Marinovať kura', 'Opiecť na panvici', 'Servírovať s ryžou'], ARRAY['japonské', 'ázijské']),
('Paella', 'Hlavné jedlá', 'Náročné', '1 hod 30 min', 6, 520, 'https://images.unsplash.com/photo-1534080564583-6be75777b70a', 'Španielske ryžové jedlo', ARRAY['ryža', 'krevety', 'mušle', 'klobása chorizo', 'šafrán'], ARRAY['Opražiť mäso', 'Pridať ryžu a vývár', 'Nechať odparovať'], ARRAY['španielske', 'bezlepkové']);
