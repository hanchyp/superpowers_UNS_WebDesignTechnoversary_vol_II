"use client";

import type { FormEvent } from "react";
import { RippleLink } from "@/components/RippleLink";

const contactEmail = "wana@project.com";

export function ContactForm() {
  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = String(formData.get("message") ?? "").trim();
    if (!message) {
      const field = event.currentTarget.querySelector("textarea");
      if (field) {
        field.value = "";
        field.reportValidity();
      }
      return;
    }

    const subject = encodeURIComponent("Pesan untuk WANA");
    const body = encodeURIComponent(message.replace(/\r?\n/g, "\r\n"));
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="mt-3" onSubmit={openEmail}>
      <p className="text-ink-2">
        Email tujuan{" "}
        <a href={`mailto:${contactEmail}`} className="font-semibold text-forest underline underline-offset-4">
          {contactEmail}
        </a>
      </p>
      <label htmlFor="contact-message" className="mt-5 block font-bold text-ink">
        Pesan
      </label>
      <textarea
        id="contact-message"
        name="message"
        rows={5}
        required
        placeholder="Tulis pertanyaan atau masukanmu untuk WANA"
        className="mt-2 block w-full rounded-2xl border border-control bg-white px-4 py-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
      />
      <RippleLink type="submit" fill="bg-forest" className="btn mt-4 bg-leaf px-5 py-3 text-white">
        Buka draf email
      </RippleLink>
      <p className="mt-2 text-sm text-ink-2">Kirim pesan dari aplikasi email setelah draf terbuka.</p>
    </form>
  );
}
