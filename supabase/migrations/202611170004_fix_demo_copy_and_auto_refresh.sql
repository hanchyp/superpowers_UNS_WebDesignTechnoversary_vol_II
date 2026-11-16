-- 1) Ringkasan data simulasi tidak boleh menyebut jam atau waktu hari yang pasti,
--    karena waktu kejadian demo digeser relatif terhadap saat ini.
-- 2) Waktu kejadian demo disegarkan otomatis tiap jam, jadi demo tidak berubah jadi "Info lama".

update public.incidents
set summary = 'Asap putih keabuan terlihat naik dari arah lahan gambut di timur laut Pulang Pisau sejak pengamatan pertama. Dua pelapor menyebut titik api kecil di tepi kanal. Asap terbawa angin ke barat daya.'
where id = 'pulang-pisau' and is_demo;

update public.incidents
set summary = 'Asap terlihat sejak beberapa jam lalu, pengamatan terbaru menyebut asap mulai menipis.'
where id = 'ketapang' and is_demo;

update public.incidents
set summary = 'Asap dari arah padang savana, dilaporkan mereda pada pengamatan terakhir.'
where id = 'sumba-timur' and is_demo;

-- Kejadian berpresisi "area" tidak tampil sebagai titik.
update public.incident_events e
set note = 'Tampil di peta sebagai area perkiraan menurut pelapor.'
from public.incidents i
where i.id = e.incident_id and i.precision = 'area' and e.kind = 'ai'
  and e.note = 'Tampil di peta sebagai titik perkiraan menurut pelapor.';

create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'wana-refresh-demo-incidents';
select cron.schedule('wana-refresh-demo-incidents', '0 * * * *', 'select public.refresh_demo_incidents()');
