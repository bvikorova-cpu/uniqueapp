
DELETE FROM public.dating_profiles WHERE bio LIKE '%[seed:v1]%';

DO $$
DECLARE
  female_names TEXT[] := ARRAY['Sofia','Emma','Nina','Lena','Klara','Ella','Mia','Zoe','Lucia','Petra','Anna','Eva','Julia','Sara','Nora','Ivana','Barbora','Katarina','Michaela','Andrea','Tereza','Linda','Alena','Simona','Monika','Denisa','Kristina','Veronika','Natalia','Diana','Elena','Marta','Silvia','Renata','Adela','Bianca','Chiara','Elise','Freya','Greta','Hana','Isabel','Jana','Karin','Livia','Marina','Olivia','Paulina','Rebeka','Stela'];
  male_names TEXT[] := ARRAY['Adam','Alex','Ben','Boris','Daniel','David','Erik','Filip','Gabriel','Henrik','Ivan','Jakub','Juraj','Karol','Lukas','Marek','Martin','Matej','Michal','Milan','Nikola','Oliver','Patrik','Pavol','Peter','Radoslav','Richard','Robert','Samuel','Simon','Stefan','Tomas','Viktor','Vlado','Adrian','Bruno','Cyril','Dominik','Emil','Fabian','George','Hugo','Igor','Jan','Kevin','Leo','Marco','Noah','Oskar','Rasto'];
  cities TEXT[] := ARRAY['Bratislava, Slovakia','Kosice, Slovakia','Zilina, Slovakia','Nitra, Slovakia','Presov, Slovakia','Trnava, Slovakia','Prague, Czechia','Brno, Czechia','Vienna, Austria','Graz, Austria','Budapest, Hungary','Warsaw, Poland','Krakow, Poland','Berlin, Germany','Munich, Germany','Amsterdam, Netherlands','Barcelona, Spain','Madrid, Spain','Rome, Italy','Milan, Italy','Paris, France','Lyon, France','Lisbon, Portugal','Copenhagen, Denmark','Stockholm, Sweden','Oslo, Norway','Helsinki, Finland','Dublin, Ireland','London, UK','Edinburgh, UK','Athens, Greece','Zagreb, Croatia','Ljubljana, Slovenia','Bucharest, Romania','Sofia, Bulgaria','Zurich, Switzerland'];
  interest_pool TEXT[] := ARRAY['Travel','Coffee','Yoga','Hiking','Photography','Music','Concerts','Cooking','Wine','Movies','Reading','Gaming','Fitness','Running','Cycling','Skiing','Dancing','Art','Museums','Theatre','Podcasts','Tech','Startups','Fashion','Dogs','Cats','Meditation','Volunteering','Languages','Nature','Beach','Mountains','Board games','Foodie','Brunch','Sushi','Craft beer','Cocktails','Astronomy','Writing'];
  bios TEXT[] := ARRAY[
    'Coffee in the morning, wine in the evening. Looking for someone to explore the city with. [seed:v1]',
    'Weekend hiker, weekday dreamer. Ask me about my last trip. [seed:v1]',
    'Foodie with a camera. Show me the best sunset spot. [seed:v1]',
    'Book in one hand, dog leash in the other. Introvert with sudden bursts of energy. [seed:v1]',
    'Gym at 6, gigs at 10. Life is short, playlists are long. [seed:v1]',
    'Sarcasm is my love language. Bring snacks. [seed:v1]',
    'Traveler, learner, terrible dancer. Teach me? [seed:v1]',
    'Startup by day, sushi by night. Left swipe if you hate memes. [seed:v1]',
    'Mountains over beaches, but I will compromise. [seed:v1]',
    'Looking for a partner in crime for concerts and long walks. [seed:v1]'
  ];
  i INT;
  g TEXT;
  nm TEXT;
  photo_idx INT;
  chosen_interests TEXT[];
BEGIN
  FOR i IN 0..99 LOOP
    IF i % 2 = 0 THEN
      g := 'female';
      nm := female_names[1 + (i/2) % array_length(female_names,1)];
    ELSE
      g := 'male';
      nm := male_names[1 + (i/2) % array_length(male_names,1)];
    END IF;
    photo_idx := (i/2) % 100;

    chosen_interests := ARRAY(
      SELECT s.val FROM (
        SELECT unnest(interest_pool) AS val
      ) s
      ORDER BY md5(i::text || s.val)
      LIMIT 5
    );

    INSERT INTO public.dating_profiles (
      user_id, display_name, age, gender, looking_for, bio, location,
      profile_photo_url, interests, is_active
    ) VALUES (
      gen_random_uuid(),
      nm,
      20 + (i % 26),
      g,
      CASE WHEN g='female' THEN 'male' ELSE 'female' END,
      bios[1 + i % array_length(bios,1)],
      cities[1 + i % array_length(cities,1)],
      'https://randomuser.me/api/portraits/' || CASE WHEN g='female' THEN 'women/' ELSE 'men/' END || photo_idx || '.jpg',
      chosen_interests,
      true
    );
  END LOOP;
END $$;
