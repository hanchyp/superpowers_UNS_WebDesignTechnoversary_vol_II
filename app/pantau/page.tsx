import type { Metadata } from "next";
import { AppBar } from "@/components/Chrome";
import { PantauView } from "./PantauView";

export const metadata: Metadata = {
  title: "Pantau Wilayah",
  description: "Peta laporan indikasi asap dan api dari warga. Data simulasi.",
};

export default function PantauPage() {
  return <PantauView header={<AppBar active="pantau" />} />;
}
