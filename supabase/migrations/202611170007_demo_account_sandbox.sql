-- Akun demo bersama untuk juri (wana@project.com) dibuat aman dipakai banyak orang sekaligus:
-- 1) Email/password akun demo dipulihkan otomatis kalau ada yang menggantinya.
-- 2) Laporan dari akun demo tetap melewati alur lengkap (terbit ke peta), tapi dihapus otomatis
--    setelah 1 jam beserta efeknya, supaya kiriman iseng tidak menetap di peta publik.
-- 3) Batas kirim akun demo lebih longgar (60/jam) karena dipakai beberapa juri.
begin;

-- Ganti alamat akun demo lama bila masih ada.
update auth.users set email = 'wana@project.com' where email = 'wana@gmail.com';
update auth.identities
set identity_data = jsonb_set(identity_data, '{email}', '"wana@project.com"')
where provider = 'email' and identity_data ->> 'email' = 'wana@gmail.com';

-- Skema privat: tidak diekspos lewat API.
create schema if not exists wana_private;
revoke all on schema wana_private from public, anon, authenticated;

create table if not exists wana_private.demo_account (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  encrypted_password text not null,
  -- Laporan demo sebelum waktu ini (data contoh yang sengaja dibuat tim) tidak ikut dihapus.
  purge_after timestamptz not null default now()
);
revoke all on wana_private.demo_account from public, anon, authenticated;

-- Simpan kondisi akun demo yang benar (jalankan ulang bagian ini bila password demo sengaja diganti).
insert into wana_private.demo_account (user_id, email, encrypted_password)
select id, email, encrypted_password from auth.users where email = 'wana@project.com'
on conflict (user_id) do update set email = excluded.email, encrypted_password = excluded.encrypted_password;

create or replace function public.is_demo_user(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from wana_private.demo_account where user_id = p_user);
$$;

revoke all on function public.is_demo_user(uuid) from public, anon, authenticated;

-- Batas kirim: 10 laporan per jam, 60 untuk akun demo bersama.
create or replace function public.limit_report_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_per_hour integer := case when public.is_demo_user(new.user_id) then 60 else 10 end;
begin
  if (select count(*) from public.reports
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= max_per_hour then
    raise exception 'Terlalu banyak laporan dalam satu jam' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Pulihkan email dan password akun demo bila diganti lewat Auth API.
create or replace function public.heal_demo_account()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  update auth.users u
  set email = d.email,
      encrypted_password = d.encrypted_password,
      email_change = '',
      email_change_token_new = '',
      email_change_token_current = '',
      updated_at = now()
  from wana_private.demo_account d
  where u.id = d.user_id
    and (u.email is distinct from d.email
         or u.encrypted_password is distinct from d.encrypted_password
         or coalesce(u.email_change, '') <> '');
  get diagnostics n = row_count;

  update auth.identities i
  set identity_data = jsonb_set(i.identity_data, '{email}', to_jsonb(d.email))
  from wana_private.demo_account d
  where i.user_id = d.user_id and i.provider = 'email'
    and i.identity_data ->> 'email' is distinct from d.email;

  return n;
end;
$$;

revoke all on function public.heal_demo_account() from public, anon, authenticated;

-- Hapus laporan akun demo yang lebih tua dari 1 jam, beserta jejaknya di peta.
-- Batasan: pengamatan akun lain yang digabung ke kejadian buatan akun demo ikut hilang dari linimasa.
-- Foto otomatis tidak lagi publik karena baris report_media ikut terhapus.
create or replace function public.purge_demo_reports()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  create temporary table demo_old on commit drop as
  select r.id, r.incident_id, r.status
  from public.reports r
  join wana_private.demo_account d on d.user_id = r.user_id
  where r.created_at < now() - interval '1 hour' and r.created_at > d.purge_after;

  -- Kejadian yang dibuat oleh laporan demo dihapus (linimasanya ikut terhapus).
  delete from public.incidents i using demo_old o where i.source_report_id = o.id;

  -- Laporan demo yang digabung ke kejadian lain: kembalikan dukungan dan status bukti.
  update public.incidents i
  set support_count = greatest(0, i.support_count - x.merged),
      review = case when x.raised and i.review = 'didukung' then 'lolos-ai'::public.incident_review else i.review end
  from (
    select o.incident_id,
           count(*)::integer as merged,
           bool_or(exists (select 1 from public.incident_events e where e.report_id = o.id and e.kind = 'dukungan')) as raised
    from demo_old o
    where o.status = 'terbit' and o.incident_id is not null
    group by o.incident_id
  ) x
  where i.id = x.incident_id;

  delete from public.incident_events e using demo_old o where e.report_id = o.id;
  delete from public.reports r using demo_old o where r.id = o.id;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.purge_demo_reports() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'wana-demo-account-upkeep';
select cron.schedule(
  'wana-demo-account-upkeep',
  '*/10 * * * *',
  'select public.heal_demo_account(); select public.purge_demo_reports();'
);

commit;
