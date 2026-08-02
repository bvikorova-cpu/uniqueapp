UPDATE public.fashion_categories SET name = v.en FROM (VALUES
 ('67763ee3-1b2d-413f-bd23-cd603d39d1fb','Kids'),
 ('bfd25f52-6896-4d73-8b3e-43c2637a9a8f','Swimwear'),
 ('48e908ee-c8c1-45f5-8b65-f6a7e733b680','Bridesmaids'),
 ('b45526cb-75d8-4670-b184-d8819b94ee5d','Seasonal'),
 ('3cde2a34-d627-4aa5-9b80-a7315abf1b0c','Special Sizes'),
 ('6b6c616d-6ec5-427b-9f0c-aa99ace2c56e','Formal / Evening'),
 ('fa9bf307-f1f4-485e-a584-d2c132465308','Bridal'),
 ('55b5865b-4b40-4f42-957c-7bd35f0b82f5','Wedding Suits for Men'),
 ('bed173c2-3f16-49b1-a1e8-ae4065d86c10','Wedding Dress - A-Line'),
 ('7f35fce3-6df7-48ac-bbe5-3b796279fbaf','Wedding Dress - Boho'),
 ('54180a0c-abe6-4ed8-9ac3-705f65249ec4','Wedding Dress - Mermaid'),
 ('46cbcf76-fd61-4273-bd18-2321adccd650','Wedding Dress - Princess')
) AS v(id, en) WHERE public.fashion_categories.id = v.id::uuid;

UPDATE public.fashion_materials SET name = v.en FROM (VALUES
 ('87af3522-a366-4764-bd55-882071cdf198','Cotton'),
 ('c6697699-a1c5-4968-b8bb-6febd27815a6','Lace'),
 ('b1b1a4bf-4859-43a1-9789-e54a80738436','Silk'),
 ('9bb982e1-c1fd-4938-b88e-196d8e0ac430','Leather'),
 ('92d93bb1-bb85-49e2-a143-9b23588d0a13','Linen'),
 ('1d2baa39-1a17-42e8-a178-a4630fbda5bc','Satin'),
 ('aabc9097-3aba-4c6f-a1d3-8fc3bebff24b','Tulle'),
 ('6331942e-28d7-4a87-94a6-d9eb14e83616','Wool')
) AS v(id, en) WHERE public.fashion_materials.id = v.id::uuid;