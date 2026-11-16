"use client";

/** Aturan bukti laporan. Batas server ada di bucket report-media (25 MB, jenis file tertentu). */
export const MAX_FILES = 4;
export const MAX_FILE_MB = 25;
export const MAX_VIDEO_SECONDS = 60;
const MAX_IMAGE_SIDE = 1920;
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

/**
 * Perkecil foto (sisi terpanjang maks. 1920 px) dan simpan ulang sebagai WebP/JPEG.
 * Menyimpan ulang lewat canvas juga membuang metadata EXIF, termasuk koordinat GPS dan model HP.
 */
export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Foto ini tidak bisa dibaca browser. Coba format JPG atau PNG.");
  }

  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan foto.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Safari lama tidak bisa membuat WebP dan diam-diam memberi PNG, jadi cek tipenya.
  const webp = await toBlob("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg", 0.85);
  if (!jpeg) throw new Error("Foto gagal diproses.");
  return jpeg;
}

/** Periksa video: jenis didukung, ukuran, dan durasi. Video tidak dikompresi di browser. */
export async function checkVideo(file: File): Promise<void> {
  if (!VIDEO_TYPES.includes(file.type)) throw new Error("Format video belum didukung. Pakai MP4, MOV, atau WebM.");
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`Video maksimal ${MAX_FILE_MB} MB.`);
  const duration = await new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(NaN);
    };
    video.src = url;
  });
  if (Number.isFinite(duration) && duration > MAX_VIDEO_SECONDS + 0.5) {
    throw new Error(`Video maksimal ${MAX_VIDEO_SECONDS} detik.`);
  }
}

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.round(bytes / 1024)} KB`;
}
