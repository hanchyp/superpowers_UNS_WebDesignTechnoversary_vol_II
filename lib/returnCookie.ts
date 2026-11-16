import { cookies } from "next/headers";
import { loginReturn } from "./loginReturn";

const NAME = "wana_kembali";

/** Simpan halaman tujuan setelah verifikasi email (berlaku 1 hari, browser yang sama). */
export async function rememberReturn(destination: string) {
  const store = await cookies();
  if (destination === "/") {
    store.delete(NAME);
    return;
  }
  store.set(NAME, destination, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/** Ambil lalu hapus halaman tujuan yang disimpan. Selalu divalidasi ulang. */
export async function takeReturn() {
  const store = await cookies();
  const value = store.get(NAME)?.value;
  if (value) store.delete(NAME);
  return loginReturn(value);
}
