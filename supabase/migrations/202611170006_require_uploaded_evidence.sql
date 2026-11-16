-- Laporan hanya terbit bila minimal satu bukti benar-benar sudah ada di Storage.
-- Bila setelah 30 menit tidak ada bukti (mis. browser ditutup saat mengunggah), status menjadi "perlu-dilengkapi".

create or replace function public.advance_report_review(p_code text)
returns table (current_status public.report_status, current_checks smallint, current_incident text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reports%rowtype;
  elapsed double precision;
  has_media boolean;
begin
  select * into r from public.reports
  where code = p_code and user_id = (select auth.uid())
  for update;
  if not found then
    return;
  end if;

  if r.status = 'diperiksa' then
    elapsed := extract(epoch from now() - r.created_at);
    select exists (
      select 1 from public.report_media m
      join storage.objects o on o.bucket_id = 'report-media' and o.name = m.path
      where m.report_id = r.id
    ) into has_media;

    update public.reports as rp
    set checks_done = case when has_media then greatest(r.checks_done, least(2, floor(elapsed / 5))::smallint) else r.checks_done end,
        status = case
          when has_media and elapsed >= 12.5 then 'terbit'::public.report_status
          when not has_media and elapsed >= 1800 then 'perlu-dilengkapi'::public.report_status
          else r.status
        end,
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
