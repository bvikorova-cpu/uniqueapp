-- Delete existing episodes first to avoid duplicates
DELETE FROM kids_episodes;

-- Insert episodes for all shows
-- Using freely available video URLs from open sources

-- Function to generate episodes for each show
DO $$
DECLARE
  show_record RECORD;
  episode_num INT;
  season_num INT;
  video_urls TEXT[] := ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  ];
  thumb_urls TEXT[] := ARRAY[
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg'
  ];
  episode_titles TEXT[] := ARRAY[
    'Veľké dobrodružstvo',
    'Magické kráľovstvo',
    'Tajomný les',
    'Stratený poklad',
    'Nový priateľ',
    'Záchranná misia',
    'Oslava narodenín',
    'Zimné radovánky',
    'Letné prázdniny',
    'Halloween večer',
    'Vianočný zázrak',
    'Jarné prekvapenie',
    'Deň v ZOO',
    'Výlet na pláž',
    'Cesta do hôr',
    'Návšteva múzea',
    'Detská párty',
    'Školský deň',
    'Sporťácky deň',
    'Hudobný festival'
  ];
  episode_descriptions TEXT[] := ARRAY[
    'Úžasné dobrodružstvo plné zábavy a prekvapení',
    'Navštívime čarovné miesta',
    'Objavíme tajomstvá prírody',
    'Hľadáme ukrytý poklad',
    'Spoznáme nových kamarátov',
    'Pomôžeme tým, ktorí to potrebujú',
    'Oslávime špeciálny deň',
    'Užívame si zimnú zábavu',
    'Letné radovánky a slnko',
    'Strašidelné a zábavné Halloween',
    'Čarovná vianočná atmosféra',
    'Jar prináša nové začiatky',
    'Deň medzi zvieratkami',
    'Piesok, more a slnko',
    'Horské dobrodružstvo',
    'Spoznávame históriu a umenie',
    'Oslava s priateľmi',
    'Učíme sa nové veci',
    'Športové aktivity',
    'Hudba a tanec'
  ];
BEGIN
  FOR show_record IN SELECT id, title, category FROM kids_shows ORDER BY title
  LOOP
    -- Create 20 episodes per show (2 seasons with 10 episodes each)
    FOR season_num IN 1..2 LOOP
      FOR episode_num IN 1..10 LOOP
        INSERT INTO kids_episodes (
          show_id,
          title,
          description,
          season_number,
          episode_number,
          duration_minutes,
          video_url,
          thumbnail_url,
          is_premium,
          views
        ) VALUES (
          show_record.id,
          episode_titles[episode_num],
          episode_descriptions[episode_num],
          season_num,
          episode_num,
          CASE 
            WHEN episode_num % 3 = 0 THEN 45
            WHEN episode_num % 3 = 1 THEN 30
            ELSE 25
          END,
          video_urls[(episode_num % 10) + 1],
          thumb_urls[(episode_num % 10) + 1],
          CASE 
            WHEN season_num = 2 AND episode_num > 5 THEN true
            ELSE false
          END,
          (RANDOM() * 1000)::INT
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;