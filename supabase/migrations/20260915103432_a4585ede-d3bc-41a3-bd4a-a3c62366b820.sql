INSERT INTO public.gift_catalog (slug, name, category, price_credits, rarity, animation, is_active, sort_order) VALUES
 ('mega-golden-lion','Golden Lion','mega',29999,'legendary','mega',true,10),
 ('mega-phoenix','Phoenix Rising','mega',25999,'legendary','mega',true,20),
 ('mega-dragon-flame','Dragon Flame','mega',26999,'legendary','mega',true,30),
 ('mega-sky-castle','Sky Castle','mega',39999,'legendary','mega',true,40),
 ('mega-rocket','Rocket Voyage','mega',20000,'legendary','mega',true,50),
 ('mega-diamond-crown','Diamond Crown','mega',49999,'legendary','mega',true,60),
 ('mega-unicorn-dream','Unicorn Dream','mega',15000,'legendary','mega',true,70),
 ('mega-private-jet','Private Jet','mega',10000,'legendary','mega',true,80)
ON CONFLICT (slug) DO NOTHING;