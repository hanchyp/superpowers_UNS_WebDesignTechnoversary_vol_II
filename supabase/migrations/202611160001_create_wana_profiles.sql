begin;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create function public.create_wana_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, created_at)
  values (
    new.id,
    nullif(left(btrim(new.raw_user_meta_data ->> 'full_name'), 80), ''),
    new.created_at
  );
  return new;
end;
$$;

revoke all on function public.create_wana_profile() from public, anon, authenticated;

create trigger on_auth_user_created_create_wana_profile
  after insert on auth.users
  for each row execute function public.create_wana_profile();

insert into public.profiles (id, full_name, created_at)
select id, nullif(left(btrim(raw_user_meta_data ->> 'full_name'), 80), ''), created_at
from auth.users
on conflict (id) do nothing;

commit;
