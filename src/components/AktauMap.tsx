import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { AKTAU_CENTER, DISTRICTS, STATUS_HEX, catById } from "@/lib/aktau";

export type MapPoint = { id: string; lat: number; lng: number; status: string; category: string };

function pin(status: string, category: string, active: boolean) {
  const c = STATUS_HEX[status] ?? "#888";
  const size = active ? 42 : 34;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${c};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.3);display:grid;place-items:center"><span style="transform:rotate(45deg);font-size:${active ? 18 : 15}px">${catById(category).icon}</span></div>`,
  });
}

const pickIcon = L.divIcon({
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0e3b52;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.35)"></div>`,
});

function ClickPicker({ onPick }: { onPick?: ((lat: number, lng: number) => void) | undefined }) {
  useMapEvents({ click: (e) => onPick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}
function FlyTo({ to }: { to?: [number, number] | null | undefined }) {
  const map = useMap();
  useEffect(() => { if (to) map.flyTo(to, Math.max(map.getZoom(), 15), { duration: 0.6 }); }, [to, map]);
  return null;
}

export default function AktauMap({
  points = [], activeId, onSelect, picked, onPick, flyTo, showDistricts = false, className = "h-full w-full",
}: {
  points?: MapPoint[] | undefined; activeId?: string | null | undefined; onSelect?: ((id: string) => void) | undefined;
  picked?: [number, number] | null | undefined; onPick?: ((lat: number, lng: number) => void) | undefined;
  flyTo?: [number, number] | null | undefined; showDistricts?: boolean | undefined; className?: string | undefined;
}) {
  return (
    <MapContainer center={AKTAU_CENTER} zoom={13} minZoom={11} maxBounds={[[43.55, 50.95], [43.8, 51.45]]} className={className} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {showDistricts && DISTRICTS.map((d) => (
        <Marker key={d.id} position={d.center} interactive={false}
          icon={L.divIcon({ className: "", iconSize: [60, 16], iconAnchor: [30, 8], html: `<span class="mk-label">${/^\d+$/.test(d.id) ? d.id + " ш/а" : d.label}</span>` })} />
      ))}
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pin(p.status, p.category, p.id === activeId)}
          zIndexOffset={p.id === activeId ? 1000 : 100} eventHandlers={{ click: () => onSelect?.(p.id) }} />
      ))}
      {picked && <Marker position={picked} icon={pickIcon} />}
      <ClickPicker onPick={onPick} />
      <FlyTo to={flyTo} />
    </MapContainer>
  );
}
