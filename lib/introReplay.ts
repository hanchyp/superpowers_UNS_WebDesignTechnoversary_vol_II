export const INTRO_REPLAY_EVENT = "wana:replay-intro";

let replayRequested = false;

/** Dipanggil oleh tautan logo: minta beranda gulir ke paling atas dan putar ulang intro. */
export function requestIntroReplay() {
  replayRequested = true;
  window.dispatchEvent(new Event(INTRO_REPLAY_EVENT));
}

/** True sekali per permintaan, supaya kembali lewat tombol back tidak memutar ulang intro. */
export function consumeIntroReplay() {
  const requested = replayRequested;
  replayRequested = false;
  return requested;
}

/** Gulir instan ke paling atas (lewati scroll-behavior: smooth di html). */
export function scrollToTopInstant() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
