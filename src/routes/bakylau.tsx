import { z } from "zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Loader2, Calendar, MapPin, Tag, MessageSquare } from "lucide-react";
import { trackReport } from "@/lib/reports.functions";
import { catById, districtLabel, fmtDate, STATUSES } from "@/lib/aktau";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/bakylau")({
  validateSearch: (s: Record<string, unknown>) => z.object({ code: z.string().max(30).optional().catch(undefined) }).parse(s),
  head: () => ({
    meta: [
      { title: "Өтінішті бақылау — QalaLine Ақтау" },
      { name: "description", content: "#AKT-2026-XXXX кодымен өтінішіңіздің мәртебесін, жауапты маман пікірін және фотоларын қараңыз." },
      { property: "og:title", content: "Өтінішті бақылау — QalaLine Ақтау" },
      { property: "og:description", content: "Өтініш нөмірі бойынша жылдам іздеу." },
    ],
  }),
  component: TrackPage,
});

const STAGES = ["new", "in_progress", "done"];

function TrackPage() {
  const { code } = Route.useSearch();
  const nav = useNavigate({ from: "/bakylau" });
  const [q, setQ] = useState(code ?? "");
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["track", code],
    queryFn: () => trackReport({ data: { code: code! } }),
    enabled: !!code && code.length >= 3,
  });

  const idx = data ? (data.status === "rejected" ? -1 : STAGES.indexOf(data.status)) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Өтінішті бақылау</h1>
      <p className="mt-2 text-muted-foreground">Өтініш нөмірін енгізіңіз (мысалы, #AKT-2026-1042 немесе 1042).</p>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ search: { code: q.trim() } }); }} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="#AKT-2026-XXXX" maxLength={30}
            className="h-12 w-full rounded-xl border bg-card pl-10 pr-3 font-display text-sm uppercase outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Іздеу</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">{STATUSES.map((s) => <StatusBadge key={s.id} status={s.id} />)}</div>

      {isFetching && <div className="mt-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {!isFetching && isFetched && !data && <p className="mt-10 rounded-xl bg-muted p-6 text-center">Мұндай нөмірмен өтініш табылмады.</p>}

      {data && !isFetching && (
        <article className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div><p className="text-xs text-muted-foreground">Өтініш</p><p className="font-display text-xl font-bold">{data.code}</p></div>
            <StatusBadge status={data.status} className="text-sm" />
          </div>
          <div className="p-5">
            {data.status === "rejected" ? (
              <div className="rounded-xl bg-status-rejected/10 p-3 text-sm font-medium text-status-rejected">Өтініш қабылданбады</div>
            ) : (
              <ol className="grid grid-cols-3 gap-2">
                {["Жаңа", "Қаралуда / Жұмыста", "Орындалды"].map((l, i) => (
                  <li key={l} className="text-center">
                    <div className={`h-2 rounded-full ${i <= idx ? ["bg-status-new", "bg-status-progress", "bg-status-done"][i] : "bg-muted"}`} />
                    <p className={`mt-2 text-xs ${i <= idx ? "font-semibold" : "text-muted-foreground"}`}>{l}</p>
                  </li>
                ))}
              </ol>
            )}
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <Info icon={Calendar} k="Күні" v={fmtDate(data.created_at)} />
              <Info icon={MapPin} k="Шағынаудан" v={`${districtLabel(data.microdistrict)}${data.address ? ", " + data.address : ""}`} />
              <Info icon={Tag} k="Санат" v={`${catById(data.category).icon} ${catById(data.category).label}`} />
            </dl>
            <p className="mt-5 text-sm">{data.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.photo_url && <figure><img src={data.photo_url} alt="Мәселе фотосы" className="aspect-[4/3] w-full rounded-xl object-cover" /><figcaption className="mt-1 text-xs text-muted-foreground">Тұрғын фотосы</figcaption></figure>}
              {data.resolved_photo_url && <figure><img src={data.resolved_photo_url} alt="Шешілген фото" className="aspect-[4/3] w-full rounded-xl object-cover" /><figcaption className="mt-1 text-xs text-muted-foreground">Орындалғаннан кейін</figcaption></figure>}
            </div>
            <div className="mt-5 rounded-xl bg-muted p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> Жауапты маман пікірі</p>
              <p className="mt-1 text-sm text-muted-foreground">{data.staff_comment || "Әзірге пікір жоқ. Өтініш кезекте."}</p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

function Info({ icon: I, k, v }: { icon: typeof Calendar; k: string; v: string }) {
  return (
    <div><dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><I className="h-3.5 w-3.5" />{k}</dt><dd className="mt-1 text-sm font-medium">{v}</dd></div>
  );
}
