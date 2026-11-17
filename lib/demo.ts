/**
 * Akun demo bersama untuk juri dan penguji. Password-nya hanya ada di server (WANA_DEMO_PASSWORD).
 * Di database, email dan password akun ini dipulihkan otomatis, dan laporannya dihapus setelah 1 jam
 * (lihat supabase/migrations/202611170007_demo_account_sandbox.sql).
 */
export const DEMO_EMAIL = "wana@project.com";

export function isDemoEmail(email: unknown) {
  return typeof email === "string" && email.trim().toLowerCase() === DEMO_EMAIL;
}
