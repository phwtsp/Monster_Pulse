-- New survey fields are nullable to keep historical submissions valid.
alter table public.surveys
  add column if not exists knows_promotion boolean,
  add column if not exists activation_rating integer,
  add column if not exists promotion_comments text;

alter table public.surveys
  drop constraint if exists surveys_activation_rating_check;

alter table public.surveys
  add constraint surveys_activation_rating_check
  check (activation_rating is null or activation_rating between 0 and 10);
