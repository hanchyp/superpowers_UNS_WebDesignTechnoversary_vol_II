"use client";

import { useActionState } from "react";

const inputClass = "mt-1.5 w-full rounded-2xl border-[1.5px] border-control bg-white px-4 py-3.5 text-base outline-none focus:border-leaf";

/** Nilai yang dikembalikan action supaya form tidak kosong lagi setelah gagal. */
export type FormState = { message: string; sent?: boolean; name?: string; email?: string };
type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function AccountForm({ action, register = false, demoAction }: {
  action: Action;
  register?: boolean;
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
          <span className="text-sm font-bold">Password</span>
          <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : undefined} className={inputClass} />
          {register && <span className="mt-1 block text-sm text-ink-2">Minimal 8 karakter.</span>}
        </label>
        {message && <p role="alert" className="text-sm font-semibold text-red-800">{message}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
          {pending ? "Memproses…" : register ? "Buat akun" : "Masuk"}
        </button>
      </form>
      {demoAction && (
        <form action={submitDemo}>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border border-leaf px-4 py-3.5 text-base font-bold text-leaf transition-colors hover:bg-tint disabled:opacity-60"
          >
            {demoPending ? "Masuk ke akun demo…" : "Masuk dengan akun demo"}
          </button>
        </form>
      )}
    </div>
  );
}
