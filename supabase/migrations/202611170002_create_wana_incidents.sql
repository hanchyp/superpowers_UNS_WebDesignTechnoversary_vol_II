-- Kejadian publik di peta + linimasa, dan penerbitan laporan ke peta.
-- Data awal (seed) ada di 202611170003_seed_wana_incidents.sql.
begin;

create type public.incident_review as enum ('lolos-ai', 'didukung', 'terverifikasi');
create type public.incident_condition as enum ('belum-diketahui', 'berlangsung', 'mereda', 'selesai');

create table public.incidents (
  id text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 1 and 160),
  place text not null,
  region text not null,
  region_short text not null,
  lon double precision not null check (lon between -180 and 180),
  lat double precision not null check (lat between -90 and 90),
  indication public.report_indication not null,
  review public.incident_review not null default 'lolos-ai',
  support_count integer not null default 0 check (support_count >= 0),
  condition public.incident_condition not null default 'belum-diketahui',
  summary text not null default '',
  precision text not null default 'area' check (precision in ('titik', 'area')),
  radius_km real not null default 1 check (radius_km > 0 and radius_km <= 50),
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  -- true = data simulasi untuk demo; laporan warga yang terbit menghasilkan baris is_demo = false.
  is_demo boolean not null default false,
  source_report_id uuid references public.reports (id) on delete set null
);

create index incidents_updated_idx on public.incidents (updated_at desc);

create table public.incident_events (
  id uuid primary key default gen_random_uuid(),
  incident_id text not null references public.incidents (id) on delete cascade,
  at timestamptz not null default now(),
  kind text not null check (kind in ('pertama', 'ai', 'dukungan', 'pengamatan')),
  title text not null,
  note text not null default '',
  report_id uuid references public.reports (id) on delete set null
);

create index incident_events_incident_idx on public.incident_events (incident_id, at desc);

-- Publik boleh membaca kejadian dan linimasa; hanya sistem yang menulis.
alter table public.incidents enable row level security;
alter table public.incident_events enable row level security;
revoke all on public.incidents, public.incident_events from public, anon, authenticated;
grant select on public.incidents, public.incident_events to anon, authenticated;

create policy "Semua orang membaca kejadian" on public.incidents for select to anon, authenticated using (true);
create policy "Semua orang membaca linimasa" on public.incident_events for select to anon, authenticated using (true);

-- Jarak antar titik (km), rumus haversine.
create function public.km_between(lon1 double precision, lat1 double precision, lon2 double precision, lat2 double precision)
returns double precision
language sql
immutable
set search_path = ''
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
  ));
$$;

-- Terbitkan laporan ke peta: tambah ke kejadian yang dipilih, atau buat kejadian baru.
create function public.publish_report(p_report uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reports%rowtype;
  inc public.incidents%rowtype;
  near_place text;
  near_region text;
  near_short text;
  kind_text text;
  new_id text;
  v_lon double precision;
  v_lat double precision;
begin
  select * into r from public.reports where id = p_report;
  if not found then
    return null;
  end if;
  kind_text := case r.indication when 'asap' then 'asap' when 'api' then 'api' else 'asap dan api' end;

  -- 1) Digabung ke kejadian yang ada: dukungan bertambah, linimasa diperbarui.
  if r.incident_id is not null then
    select * into inc from public.incidents where id = r.incident_id for update;
    if found then
      update public.incidents
      set support_count = support_count + 1,
          review = case when review = 'lolos-ai' then 'didukung'::public.incident_review else review end,
          indication = case when indication = r.indication then indication else 'keduanya'::public.report_indication end,
          updated_at = now()
      where id = inc.id;

      if inc.review = 'lolos-ai' then
        insert into public.incident_events (incident_id, kind, title, note, report_id)
        values (inc.id, 'dukungan', 'Status naik: didukung pengamatan lain',
                'Ada pengamatan tambahan yang lolos pemeriksaan. Oleh sistem, bukan verifikasi petugas.', r.id);
      end if;
      insert into public.incident_events (incident_id, kind, title, note, report_id)
      values (inc.id, 'pengamatan', 'Pengamatan tambahan dari warga',
              coalesce(nullif(left(btrim(r.note), 280), ''), 'Foto lolos pemeriksaan awal AI.'), r.id);
      return inc.id;
    end if;
  end if;

  -- 2) Kejadian baru. Mode "arah" memakai posisi pelapor, jadi koordinat dibulatkan (~1 km)
  --    dan ditampilkan sebagai area supaya lokasi pengamat tidak terlihat persis.
  v_lon := case when r.location_mode = 'arah' then round(r.lon::numeric, 2)::double precision else r.lon end;
  v_lat := case when r.location_mode = 'arah' then round(r.lat::numeric, 2)::double precision else r.lat end;

  select i.place, i.region, i.region_short into near_place, near_region, near_short
  from public.incidents i
  where public.km_between(v_lon, v_lat, i.lon, i.lat) <= 60
  order by public.km_between(v_lon, v_lat, i.lon, i.lat)
  limit 1;

  new_id := 'wr-' || lower(substr(r.code, 4));
  insert into public.incidents (
    id, title, place, region, region_short, lon, lat, indication, review, support_count, condition,
    summary, precision, radius_km, first_seen_at, updated_at, source_report_id
  ) values (
    new_id,
    'Indikasi ' || kind_text || ' di sekitar ' || coalesce(near_place, 'titik pelapor'),
    coalesce(near_place, 'Titik pelapor'),
    coalesce(near_region, 'Indonesia'),
    coalesce(near_short, 'Indonesia'),
    v_lon, v_lat, r.indication, 'lolos-ai', 0, 'berlangsung',
    coalesce(nullif(left(btrim(r.note), 600), ''),
             'Warga melaporkan ' || kind_text || '. Lokasi berupa perkiraan dari pengamat di sekitar area.'),
    case when r.location_mode = 'titik' then 'titik' else 'area' end,
    case when r.location_mode = 'titik' then 1 else 3 end,
    r.observed_at, now(), r.id
  )
  on conflict (id) do nothing;

  insert into public.incident_events (incident_id, at, kind, title, note, report_id) values
    (new_id, r.created_at, 'pertama', 'Laporan pertama diterima', 'Identitas pelapor dan lokasi pengamat tidak ditampilkan ke publik.', r.id),
    (new_id, now(), 'ai', 'Lolos pemeriksaan awal AI, kejadian terbit',
     case when r.location_mode = 'titik' then 'Tampil di peta sebagai titik perkiraan menurut pelapor.'
          else 'Tampil di peta sebagai area perkiraan di sekitar pelapor.' end, r.id);

  update public.reports set incident_id = new_id where id = r.id;
  return new_id;
end;
$$;

revoke all on function public.publish_report(uuid) from public, anon, authenticated;

-- Simulasi pemeriksaan AI (tetap sama), kini juga menerbitkan laporan ke peta saat lolos.
drop function public.advance_report_review(text);

create function public.advance_report_review(p_code text)
returns table (current_status public.report_status, current_checks smallint, current_incident text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reports%rowtype;
  elapsed double precision;
begin
  select * into r from public.reports
  where code = p_code and user_id = (select auth.uid())
  for update;
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

    if r.status = 'terbit' then
      r.incident_id := public.publish_report(r.id);
    end if;
  end if;

  return query select r.status, r.checks_done, r.incident_id;
end;
$$;

revoke all on function public.advance_report_review(text) from public, anon;
grant execute on function public.advance_report_review(text) to authenticated;

-- Foto dari laporan yang sudah terbit boleh dilihat publik (EXIF sudah dibuang saat kompresi).
-- Video tidak ditampilkan publik karena metadata video tidak dibersihkan.
create function public.is_published_photo(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.report_media m
    join public.reports r on r.id = m.report_id
    where m.path = p_name and m.kind = 'foto' and r.status = 'terbit'
  );
$$;

revoke all on function public.is_published_photo(text) from public;
grant execute on function public.is_published_photo(text) to anon, authenticated;

create policy "Publik membaca foto laporan terbit"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'report-media' and public.is_published_photo(name));

create function public.incident_photos(p_incident_id text)
returns table (path text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.path, m.created_at
  from public.report_media m
  join public.reports r on r.id = m.report_id
  where r.incident_id = p_incident_id and r.status = 'terbit' and m.kind = 'foto'
  order by r.created_at desc, m.position
  limit 12;
$$;

revoke all on function public.incident_photos(text) from public;
grant execute on function public.incident_photos(text) to anon, authenticated;

-- Untuk demo: geser waktu data simulasi supaya pembaruan terbarunya ~12 menit lalu.
-- Jalankan dari SQL Editor sebelum presentasi: select public.refresh_demo_incidents();
create function public.refresh_demo_incidents()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  shift interval;
  n integer;
begin
  select now() - interval '12 minutes' - max(updated_at) into shift from public.incidents where is_demo;
  if shift is null then
    return 0;
  end if;
  update public.incidents set updated_at = updated_at + shift, first_seen_at = first_seen_at + shift where is_demo;
  get diagnostics n = row_count;
  update public.incident_events e set at = e.at + shift
  from public.incidents i where i.id = e.incident_id and i.is_demo and e.report_id is null;
  return n;
end;
$$;

revoke all on function public.refresh_demo_incidents() from public, anon, authenticated;

commit;
