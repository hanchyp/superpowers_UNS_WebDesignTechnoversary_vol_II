-- Laporan warga + bukti foto/video.
-- Kejadian (incidents) masih data simulasi di lib/incidents.ts, jadi incident_id berupa slug teks.
begin;

create type public.report_indication as enum ('asap', 'api', 'keduanya');
create type public.report_status as enum ('diperiksa', 'terbit', 'perlu-dilengkapi', 'ditolak');

create sequence public.report_code_seq start 1030;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('WR-' || nextval('public.report_code_seq')::text),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  incident_id text check (incident_id ~ '^[a-z0-9-]{1,80}$'),
  indication public.report_indication not null,
  observed_at timestamptz not null,
  location_mode text not null check (location_mode in ('titik', 'arah')),
  lon double precision check (lon between -180 and 180),
  lat double precision check (lat between -90 and 90),
  direction text check (char_length(direction) <= 40),
  note text check (char_length(note) <= 4000),
  status public.report_status not null default 'diperiksa',
  -- Jumlah pemeriksaan otomatis yang sudah selesai (0-2), untuk tampilan status.
  checks_done smallint not null default 0 check (checks_done between 0 and 2),
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_point_required check (location_mode <> 'titik' or (lon is not null and lat is not null)),
  constraint reports_observed_recent check (observed_at <= created_at + interval '5 minutes' and observed_at >= created_at - interval '7 days')
);

create index reports_user_created_idx on public.reports (user_id, created_at desc);

create table public.report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  path text not null unique,
  kind text not null check (kind in ('foto', 'video')),
  mime text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 26214400),
  position smallint not null check (position between 0 and 3),
  created_at timestamptz not null default now(),
  unique (report_id, position),
  -- File harus ada di folder milik pelapor: {user_id}/{report_id}/...
  constraint report_media_path_owner check (path like user_id::text || '/' || report_id::text || '/%')
);

create index report_media_user_idx on public.report_media (user_id);

-- RLS: pelapor hanya bisa melihat dan menambah miliknya sendiri. Status hanya diubah oleh sistem.
alter table public.reports enable row level security;
alter table public.report_media enable row level security;

revoke all on public.reports, public.report_media from public, anon, authenticated;
grant select on public.reports, public.report_media to authenticated;
grant insert (incident_id, indication, observed_at, location_mode, lon, lat, direction, note, consent_at)
  on public.reports to authenticated;
grant insert (report_id, path, kind, mime, size_bytes, position) on public.report_media to authenticated;
grant usage on sequence public.report_code_seq to authenticated;

create policy "Pelapor membaca laporannya sendiri"
  on public.reports for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Pelapor menambah laporannya sendiri"
  on public.reports for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Pelapor membaca bukti miliknya"
  on public.report_media for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Pelapor menambah bukti ke laporannya"
  on public.report_media for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.reports r where r.id = report_id and r.user_id = (select auth.uid()))
  );

-- Maksimal 4 bukti per laporan.
create function public.limit_report_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.report_media where report_id = new.report_id) >= 4 then
    raise exception 'Maksimal 4 bukti per laporan';
  end if;
  return new;
end;
$$;

revoke all on function public.limit_report_media() from public, anon, authenticated;

create trigger report_media_limit
  before insert on public.report_media
  for each row execute function public.limit_report_media();

-- Batas kirim: maksimal 10 laporan per pengguna per jam.
create function public.limit_report_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.reports
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Terlalu banyak laporan dalam satu jam' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.limit_report_rate() from public, anon, authenticated;

create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.limit_report_rate();

-- SIMULASI pemeriksaan AI: kemajuan dihitung dari waktu sejak laporan dibuat
-- (5 dtk per pemeriksaan, terbit setelah 12,5 dtk). Hanya maju, hanya untuk status 'diperiksa',
-- jadi status yang diubah manual (mis. 'perlu-dilengkapi' dari dashboard) tidak tertimpa.
-- Ganti dengan Edge Function pemeriksa AI sungguhan nanti.
create function public.advance_report_review(p_code text)
returns table (current_status public.report_status, current_checks smallint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reports%rowtype;
  elapsed double precision;
begin
  select * into r from public.reports
  where code = p_code and user_id = (select auth.uid());
  if not found then
    return;
  end if;

  if r.status = 'diperiksa' then
    elapsed := extract(epoch from now() - r.created_at);
    update public.reports as rp
    set checks_done = greatest(r.checks_done, least(2, floor(elapsed / 5))::smallint),
        status = case when elapsed >= 12.5 then 'terbit'::public.report_status else r.status end,
        updated_at = now()
    where rp.id = r.id
    returning rp.status, rp.checks_done into r.status, r.checks_done;
  end if;

  return query select r.status, r.checks_done;
end;
$$;

revoke all on function public.advance_report_review(text) from public, anon;
grant execute on function public.advance_report_review(text) to authenticated;

-- Storage: bucket privat, batas ukuran dan jenis file ditegakkan oleh server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-media', 'report-media', false, 26214400,
  array['image/jpeg', 'image/webp', 'image/png', 'video/mp4', 'video/quicktime', 'video/webm']
);

create policy "Pelapor mengunggah ke foldernya sendiri"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'report-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Pelapor membaca file miliknya"
  on storage.objects for select to authenticated
  using (bucket_id = 'report-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
