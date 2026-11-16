import { inRegionalMap, type Incident } from "@/lib/incidents";
import { IncidentMarker, RegionalMap } from "./Map";

/**
 * Cuplikan peta ringan untuk kartu kejadian. Peta statis bertekstur hanya mencakup Kalimantan,
 * jadi kejadian di luar cakupan itu memakai panel sederhana dengan penanda dan nama wilayah.
 */
export function IncidentMiniMap({ incident, className = "" }: { incident: Incident; className?: string }) {
  if (inRegionalMap(incident.lon, incident.lat)) {
    return <RegionalMap focus={incident} items={[incident]} showTowns={false} className={className} />;
  }
  return (
    <div
      className={`relative overflow-hidden bg-water ${className}`}
      style={{
        backgroundImage: "radial-gradient(circle, rgb(19 38 27 / 0.12) 1px, transparent 1.5px)",
        backgroundSize: "14px 14px",
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-moss/50 blur-xl" aria-hidden="true" />
      <IncidentMarker incident={incident} style={{ left: "50%", top: "50%" }} />
      <span className="absolute bottom-2.5 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-2">
        {incident.regionShort}
      </span>
    </div>
  );
}
