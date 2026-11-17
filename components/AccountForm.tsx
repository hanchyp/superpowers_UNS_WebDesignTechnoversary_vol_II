"use client";

import Link from "next/link";
import { useActionState } from "react";

const inputClass = "mt-1.5 w-full rounded-2xl border-[1.5px] border-control bg-white px-4 py-3.5 text-base outline-none focus:border-leaf";

/** Nilai yang dikembalikan action supaya form tidak kosong lagi setelah gagal. */
export type FormState = { message: string; sent?: boolean; name?: string; email?: string };
type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function AccountForm({ action, register = false, demoAction, forgotHref }: {
  action: Action;
  register?: boolean;
  /** Tautan "Lupa password?" di samping label Password (khusus halaman masuk). */
  forgotHref?: string;
  /** Login akun demo di server; password demo tidak pernah dikirim ke browser. */
  demoAction?: Action;
}) {
  const [state, submit, pending] = useActionState(action, { message: "" });
  const [demoState, submitDemo, demoPending] = useActionState(demoAction ?? (async (s: FormState) => s), { message: "" });
  const busy = pending || demoPending;

  if (state.sent) {
    return <p role="status" className="mt-8 max-w-[420px] rounded-2xl bg-tint p-4 text-forest">{state.message}</p>;
  }

  const message = state.message || demoState.message;

  return (
    <div className="mt-8 max-w-[420px] space-y-4">
      <form className="space-y-4" action={submit}>
        {register && (
          <label className="block">
            <span className="text-sm font-bold">Nama</span>
            <input name="name" autoComplete="name" required maxLength={80} defaultValue={state.name} className={inputClass} />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-bold">Email</span>
          <input name="email" type="email" autoComplete="username" required placeholder="nama@contoh.id" defaultValue={state.email} className={inputClass} />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold">Password</span>
            {forgotHref && (
              <Link href={forgotHref} className="text-sm font-bold text-leaf hover:underline">
                Lupa password?
              </Link>
            )}
          </span>
          <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : undefined} className={inputClass} />
          {register && <span className="mt-1 block text-sm text-ink-2">Minimal 8 karakter.</span>}
        </label>
        {message && <p role="alert" className="text-sm font-semibold text-red-800">{message}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
          {pending ? "Memproses…" : register ? "Buat akun" : "Masuk"}
        </button>
      </form>
      {demoAction && (
        <>
          <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-stale" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            atau
            <span className="h-px flex-1 bg-line" />
          </div>
          <form action={submitDemo} className="space-y-2">
            <button
              type="submit"
              disabled={busy}
              className="btn w-full border border-leaf bg-white py-3.5 text-base text-leaf disabled:opacity-60"
            >
              {demoPending ? "Masuk ke akun demo…" : "Coba dengan akun demo"}
            </button>
            <p className="text-center text-sm text-ink-2">Lihat isi WANA tanpa perlu mendaftar.</p>
          </form>
        </>
      )}
    </div>
  );
}
