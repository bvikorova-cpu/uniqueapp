-- Insert demo brand sponsors for testing
INSERT INTO public.brand_sponsors (
  user_id,
  name,
  description,
  category,
  tier,
  logo,
  website,
  subscription_status,
  subscription_start,
  total_votes
) VALUES
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'TechVibe Electronics',
    'Leading provider of innovative consumer electronics and smart home devices',
    'Technology',
    'platinum',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    'https://example.com/techvibe',
    'active',
    NOW(),
    150
  ),
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'FitLife Sports',
    'Premium sportswear and fitness equipment for athletes of all levels',
    'Sports & Fitness',
    'gold',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop',
    'https://example.com/fitlife',
    'active',
    NOW(),
    230
  ),
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'GreenLeaf Organics',
    'Sustainable and organic food products delivered to your door',
    'Food & Beverage',
    'silver',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
    'https://example.com/greenleaf',
    'active',
    NOW(),
    95
  ),
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'StyleHub Fashion',
    'Trendy fashion and accessories for modern lifestyle',
    'Fashion',
    'gold',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop',
    'https://example.com/stylehub',
    'active',
    NOW(),
    178
  ),
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'EduTech Academy',
    'Online learning platform with courses for all ages',
    'Education',
    'platinum',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop',
    'https://example.com/edutech',
    'active',
    NOW(),
    312
  ),
  (
    '3c23b29d-c9e2-4495-8772-143464d08486',
    'HomeComfort Living',
    'Quality furniture and home decor solutions',
    'Home & Living',
    'silver',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop',
    'https://example.com/homecomfort',
    'active',
    NOW(),
    67
  );