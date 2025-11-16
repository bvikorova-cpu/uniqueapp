-- Insert demo crystal marketplace items with proper JSON format
INSERT INTO crystal_marketplace_items (
  seller_id,
  title,
  description,
  crystal_type,
  weight_grams,
  price,
  image_url,
  energy_profile,
  authenticity_certificate,
  is_available
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Natural Amethyst Cluster',
    'Beautiful natural amethyst cluster with deep purple coloration. Excellent for meditation and spiritual work. This piece has been ethically sourced from Brazil and carries high vibrational energy.',
    'Amethyst',
    450,
    89.99,
    'https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800',
    '{"vibration": "high", "chakra": "Crown", "properties": ["Spiritual awareness", "Meditation", "Protection"]}'::json,
    '{"issuer": "International Gem Society", "verified": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Rose Quartz Heart Stone',
    'Hand-carved rose quartz in perfect heart shape. Known as the stone of unconditional love. Ideal for heart chakra healing and attracting love energy.',
    'Rose Quartz',
    120,
    45.00,
    'https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=800',
    '{"vibration": "medium", "chakra": "Heart", "properties": ["Love", "Emotional healing", "Self-love"]}'::json,
    '{"issuer": "Natural Formation", "verified": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Clear Quartz Master Healer',
    'Large clear quartz point with exceptional clarity. Known as the master healer crystal. Perfect for energy amplification and programming.',
    'Clear Quartz',
    580,
    125.00,
    'https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=800',
    '{"vibration": "high", "chakra": "All", "properties": ["Amplification", "Healing", "Clarity"]}'::json,
    '{"issuer": "Gemological Lab", "verified": true, "certificate_number": "CQ-2024-001"}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Citrine Abundance Stone',
    'Natural citrine crystal known for attracting wealth and abundance. Solar Plexus chakra activation. Heat-treated for enhanced golden color.',
    'Citrine',
    200,
    65.00,
    'https://images.unsplash.com/photo-1603830415857-00c9b6b71654?w=800',
    '{"vibration": "medium", "chakra": "Solar Plexus", "properties": ["Abundance", "Manifestation", "Joy"]}'::json,
    '{"issuer": "Natural Citrine", "verified": true, "heat_treated": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Black Tourmaline Protection',
    'Raw black tourmaline specimen. Powerful protection stone against negative energy. Root chakra grounding.',
    'Black Tourmaline',
    350,
    55.00,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    '{"vibration": "medium", "chakra": "Root", "properties": ["Protection", "Grounding", "EMF Shield"]}'::json,
    '{"issuer": "Raw Specimen", "verified": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Selenite Tower Cleansing',
    'Pure white selenite tower for cleansing and charging other crystals. Crown chakra connection and mental clarity.',
    'Selenite',
    280,
    38.00,
    'https://images.unsplash.com/photo-1574773305141-e325c94b9155?w=800',
    '{"vibration": "high", "chakra": "Crown", "properties": ["Cleansing", "Mental clarity", "Angelic connection"]}'::json,
    '{"issuer": "Gypsum Formation", "verified": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Labradorite Magic Stone',
    'Stunning labradorite with blue and gold flash. Known for psychic protection and intuition enhancement.',
    'Labradorite',
    310,
    78.00,
    'https://images.unsplash.com/photo-1609447606545-95f71b3cd7e6?w=800',
    '{"vibration": "high", "chakra": "Third Eye", "properties": ["Psychic protection", "Intuition", "Transformation"]}'::json,
    '{"issuer": "Natural Flash", "verified": true}'::json,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Tiger Eye Confidence Booster',
    'Polished tiger eye stone with beautiful golden chatoyancy. Solar Plexus and Sacral chakra activation.',
    'Tiger Eye',
    180,
    42.00,
    'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800',
    '{"vibration": "medium", "chakra": "Solar Plexus", "properties": ["Confidence", "Willpower", "Courage"]}'::json,
    '{"issuer": "Natural Chatoyancy", "verified": true}'::json,
    true
  );
