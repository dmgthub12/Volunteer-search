create table if not exists public.volunteer_opportunities (
  id text primary key,
  data jsonb not null,
  organization text generated always as (data ->> 'organization') stored,
  town text generated always as (data ->> 'town') stored,
  category text generated always as (data ->> 'category') stored,
  teen_friendly boolean generated always as ((data ->> 'teenFriendly')::boolean) stored,
  needs_verification boolean generated always as ((data ->> 'needsVerification')::boolean) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.volunteer_opportunities enable row level security;

drop policy if exists "Anyone can read volunteer opportunities"
on public.volunteer_opportunities;

create policy "Anyone can read volunteer opportunities"
on public.volunteer_opportunities
for select
to anon, authenticated
using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_volunteer_opportunities_updated_at
on public.volunteer_opportunities;

create trigger set_volunteer_opportunities_updated_at
before update on public.volunteer_opportunities
for each row execute procedure public.set_updated_at();
