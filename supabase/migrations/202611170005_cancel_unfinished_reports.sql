-- Laporan yang buktinya gagal diunggah dibatalkan, supaya tidak terbit ke peta tanpa foto.
-- Hanya pemilik, dan hanya selama laporan masih "diperiksa".

create policy "Pelapor membatalkan laporannya yang belum terbit"
on public.reports for delete
to authenticated
using (user_id = (select auth.uid()) and status = 'diperiksa');

create policy "Pelapor menghapus bukti laporan yang belum terbit"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'report-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.reports r
    where r.id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.status = 'diperiksa'
  )
);

-- RLS di atas membatasi baris mana; role tetap butuh hak DELETE pada tabelnya.
grant delete on public.reports to authenticated;
