
alter table public.coupon_orders
  add column if not exists dispute_reason text,
  add column if not exists dispute_resolution text;

create or replace view public.coupon_seller_analytics as
with sales as (
  select seller_id,
    count(*) filter (where status = 'completed') as orders_completed,
    coalesce(sum(amount) filter (where escrow_status = 'released'), 0)::numeric(10,2) as gross_revenue_eur,
    count(*) filter (where escrow_status = 'disputed') as disputes,
    count(*) as total_orders
  from public.coupon_orders
  group by seller_id
),
listings as (
  select user_id as seller_id,
    count(*) as listings_total,
    count(*) filter (where is_sold = false) as listings_active
  from public.coupon_listings
  group by user_id
),
ratings as (
  select seller_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
  from public.coupon_buyer_reviews
  group by seller_id
)
select
  coalesce(s.seller_id, l.seller_id, r.seller_id) as seller_id,
  coalesce(s.orders_completed, 0) as orders_completed,
  coalesce(s.gross_revenue_eur, 0) as gross_revenue_eur,
  coalesce(s.disputes, 0) as disputes,
  case when coalesce(s.total_orders,0) > 0
       then round((coalesce(s.disputes,0)::numeric / s.total_orders) * 100, 1)
       else 0 end as dispute_rate_pct,
  coalesce(l.listings_total, 0) as listings_total,
  coalesce(l.listings_active, 0) as listings_active,
  coalesce(r.avg_rating, 0) as avg_rating,
  coalesce(r.review_count, 0) as review_count
from sales s
full outer join listings l on l.seller_id = s.seller_id
full outer join ratings r on r.seller_id = coalesce(s.seller_id, l.seller_id);

grant select on public.coupon_seller_analytics to authenticated;
