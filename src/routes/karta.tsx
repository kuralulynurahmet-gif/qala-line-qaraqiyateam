import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { listPublicReports, getReportPhotos } from "@/lib/reports.functions";
import { CATEGORIES, catById, districtLabel, fmtDate, MAIN_STREETS } from "@/lib/aktau";
import { ClientMap } from "@/components/ClientMap";
import { StatusBadge } from "@/components/StatusBadge";

const reportsQ = queryOptions({ queryKey: ["reports-public"], queryFn: () => listPublicReports() });

export const Route = createFileRoute("/karta")({
  head: () => ({
    meta: [
      { title: "Ақтау картасы — QalaLine өтініштері" },
      { name: "description", content: "Ақтаудың 1–35 шағынаудандары бойынша қалалық мәселелер картасы: санат пен мәртебе сүзгілері." },
      { property: "og:title", content: "Ақтау картасы — QalaLine" },
      { property: "og:description", content: "Қалалық мәселелерді шағынаудан бойынша картадан қараңыз." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(reportsQ),
  errorComponent: ({ error }) => <p className="p-10 text-center">{error.message}</p>,
  notFoundComponent: () => <p className="p-10 text-center">Табылмады</p>,
  component: MapPage,
});

const CAT_FILTERS = [
  { id: "all", label: "Барлығы" },
  { id: "road", label: "🛣️ Жол" },
  { id: "manhole", label: "⚠️ Люк" },
  { id: "light", label: "💡 Жарық" },
  { id: "trash", label: "🗑️ Қоқыс" },
  { id: "water", label: "💧 Су/кәріз" },
  { id: "yard", label: "🌳 Аула" },
];
const ST_FILTERS = [
  { id: "all", label: "Барлығы", dot: "bg-foreground/40" },
  { id: "new", label: "Жаңа", dot: "bg-status-new" },
  { id: "in_progress", label: "Жұмыста", dot: "bg-status-progress" },
  { id: "done", label: "Орындалды", dot: "bg-status-done" },
];

function MapPage() {
  const { data } = useSuspenseQuery(reportsQ);
  const [cat, setCat] = useState("all");
  const [st, setSt] = useState("all");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => data.filter((r) => (cat === "all" || catById(r.category).group === cat) && (st === "all" || r.status === st)),
    [data, cat, st],
  );
  const sel = data.find((r) => r.id === active) ?? null;
  const photos = useQuery({ queryKey: ["photos", active], queryFn: () => getReportPhotos({ data: { id: active! } }), enabled: !!active });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Ақтау қаласының интерактивті картасы</h1>
          <p className="mt-1 text-sm text-muted-foreground">Каспий жағалауы · 1–35 шағынаудандар · {MAIN_STREETS.slice(0, 3).join(", ")}</p>
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-sm font-semibold">{filtered.length} өтініш</span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CAT_FILTERS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{c.label}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ST_FILTERS.map((s) => (
            <button key={s.id} onClick={() => setSt(s.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${st === s.id ? "border-foreground bg-foreground text-background" : "bg-card"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 h-[70vh] min-h-[460px] overflow-hidden rounded-2xl border">
        <ClientMap points={filtered} activeId={active} onSelect={setActive} flyTo={sel ? [sel.lat, sel.lng] : null} />
        {sel && (
          <div className="absolute inset-x-3 bottom-3 z-[500] max-h-[70%] overflow-y-auto rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:right-3 sm:top-3 sm:bottom-auto sm:w-96">
            <div className="relative">
              {photos.isLoading ? <div className="grid aspect-[16/10] place-items-center bg-muted"><Loader2 className="h-6 w-6 animate-spin" /></div>
                : photos.data?.photo ? <img src={photos.data.photo} alt="Мәселе фотосы" className="aspect-[16/10] w-full object-cover" />
                : <div className="grid aspect-[16/10] place-items-center bg-muted text-5xl">{catById(sel.category).icon}</div>}
              <button onClick={() => setActive(null)} className="absolute right-2 top-2 rounded-full bg-card/90 p-1.5" aria-label="Жабу"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2"><span className="font-display text-sm font-bold">{sel.code}</span><StatusBadge status={sel.status} /></div>
              <p className="mt-2 font-semibold">{catById(sel.category).icon} {catById(sel.category).label}</p>
              <p className="text-sm text-muted-foreground">{districtLabel(sel.microdistrict)}{sel.address ? ` · ${sel.address}` : ""}</p>
              <p className="mt-2 text-sm">{sel.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{fmtDate(sel.created_at)}</p>
              {sel.staff_comment && <p className="mt-2 rounded-lg bg-muted p-2 text-xs">💬 {sel.staff_comment}</p>}
              <Link to="/bakylau" search={{ code: sel.code }} className="mt-3 inline-block text-sm font-semibold text-primary">Толығырақ →</Link>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {CATEGORIES.map((c) => <span key={c.id}>{c.icon} {c.label}</span>)}
      </div>
    </div>
  );
}
