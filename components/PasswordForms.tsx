"use client";

import { useActionState } from "react";
import type { FormState } from "./AccountForm";

type Action = (state: FormState, data: FormData) => Promise<FormState>;

const inputClass = "mt-1.5 w-full rounded-2xl border-[1.5px] border-control bg-white px-4 py-3.5 text-base outline-none focus:border-leaf";

/** Minta tautan reset password lewat email. */
export function ResetRequestForm({ action }: { action: Action }) {
  const [state, submit, pending] = useActionState(action, { message: "" });

  if (state.sent) {
    return <p role="status" className="mt-8 max-w-[420px] rounded-2xl bg-tint p-4 text-forest">{state.message}</p>;
  }

  return (
    <form className="mt-8 max-w-[420px] space-y-4" action={submit}>
      <label className="block">
        <span className="text-sm font-bold">Email</span>
        <input name="email" type="email" autoComplete="username" required placeholder="nama@contoh.id" defaultValue={state.email} className={inputClass} />
      </label>
      {state.message && <p role="alert" className="text-sm font-semibold text-red-800">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
        {pending ? "Mengirim…" : "Kirim tautan reset"}
      </button>
    </form>
  );
}

/** Atur password baru setelah membuka tautan reset. */
export function NewPasswordForm({ action }: { action: Action }) {
  const [state, submit, pending] = useActionState(action, { message: "" });

  return (
    <form className="mt-8 max-w-[420px] space-y-4" action={submit}>
      <label className="block">
        <span className="text-sm font-bold">Password baru</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
        <span className="mt-1 block text-sm text-ink-2">Minimal 8 karakter.</span>
      </label>
      <label className="block">
        <span className="text-sm font-bold">Ulangi password baru</span>
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
      </label>
      {state.message && <p role="alert" className="text-sm font-semibold text-red-800">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan password baru"}
      </button>
    </form>
  );
}
