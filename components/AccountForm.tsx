"use client";

import { useActionState, useRef } from "react";

const inputClass = "mt-1.5 w-full rounded-2xl border-[1.5px] border-control bg-white px-4 py-3.5 text-base outline-none focus:border-leaf";

type FormState = { message: string; sent?: boolean };

export function AccountForm({ action, register = false, demo }: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  register?: boolean;
  demo?: { email: string; password: string };
}) {
  const [state, submit, pending] = useActionState(action, { message: "" });
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  if (state.sent) {
    return <p role="status" className="mt-8 max-w-[420px] rounded-2xl bg-tint p-4 text-forest">{state.message}</p>;
  }

  return (
    <form className="mt-8 max-w-[420px] space-y-4" action={submit}>
      {register && (
        <label className="block">
          <span className="text-sm font-bold">Nama</span>
          <input name="name" autoComplete="name" required maxLength={80} className={inputClass} />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-bold">Email</span>
        <input ref={emailInput} name="email" type="email" autoComplete="username" required placeholder="nama@contoh.id" className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-bold">Password</span>
        <input ref={passwordInput} name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : undefined} className={inputClass} />
        {register && <span className="mt-1 block text-sm text-ink-2">Minimal 8 karakter.</span>}
      </label>
      {state.message && <p role="alert" className="text-sm font-semibold text-red-800">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
        {pending ? "Memproses…" : register ? "Buat akun" : "Masuk"}
      </button>
      {demo && (
        <button
          type="button"
          onClick={() => {
            if (!emailInput.current || !passwordInput.current) return;
            emailInput.current.value = demo.email;
            passwordInput.current.value = demo.password;
          }}
          disabled={pending}
          className="w-full rounded-full border border-leaf px-4 py-3.5 text-base font-bold text-leaf transition-colors hover:bg-tint disabled:opacity-60"
        >
          Coba akun demo
        </button>
      )}
    </form>
  );
}
