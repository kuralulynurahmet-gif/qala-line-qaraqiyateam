import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, MessageCircle, Upload, Phone, Search, ArrowLeft } from "lucide-react";
import { adminListReports, adminLogin, adminUpdateReport, getReportPhotos, type AdminReport } from "@/lib/reports.functions";
import { CATEGORIES, STATUSES, catById, districtLabel, fmtDate, statusById } from "@/lib/aktau";
import { compressImage } from "@/lib/image";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Әкімдік бөлімі — QalaLine Ақтау" },
      { name: "description", content: "Ақтау әкімдігі мен коммуналдық қызмет қызметкерлеріне арналған өтініштерді басқару панелі." },
      { property: "og:title", content: "Әкімдік бөлімі — QalaLine" },
      { property: "og:description", content: "Өтініштерді басқару және тұрғындарға WhatsApp арқылы жауап беру." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Cred = { u: string; p: string };

function AdminPage() {
  const [cred, setCred] = useState<Cred | null>(null);
  useEffect(() => { const s = sessionStorage.getItem("ql-admin"); if (s) setCred(JSON.parse(s)); }, []);
  if (!cred) return <Login onOk={(c) => { sessionStorage.setItem("ql-admin", JSON.stringify(c)); setCred(c); }} />;
  return <Dashboard cred={cred} onLogout={() => { sessionStorage.removeItem("ql-admin"); setCred(null); }} />;
}

function Login({ onOk }: { onOk: (c: Cred) => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="text-xl font-bold">Қызметкерлер кіруі</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ақтау қаласы әкімдігі · коммуналдық қызметтер</p>
        <form className="mt-6 space-y-3" onSubmit={async (e) => {
          e.preventDefault(); setBusy(true);
          try { await adminLogin({ data: { u, p } }); onOk({ u, p }); } catch { toast.error("Логин немесе құпиясөз қате"); } finally { setBusy(false); }
        }}>
          <Input placeholder="Логин" value={u} onChange={(e) => setU(e.target.value)} />
          <Input placeholder="Құпиясөз" type="password" value={p} onChange={(e) => setP(e.target.value)} />
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Кіру</button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">Демо: admin / 1234</p>
      </div>
    </div>
  );
}

function Dashboard({ cred, onLogout }: { cred: Cred; onLogout: () => void }) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-reports"], queryFn: () => adminListReports({ data: cred }) });
  const [st, setSt] = useState("all"); const [cat, setCat] = useState("all"); const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    all: data.length, new: data.filter((r) => r.status === "new").length,
    in_progress: data.filter((r) => r.status === "in_progress").length, done: data.filter((r) => r.status === "done").length,
  }), [data]);
  const list = data.filter((r) => (st === "all" || r.status === st) && (cat === "all" || r.category === cat) &&
    (!q || `${r.code} ${r.full_name} ${r.address} ${r.microdistrict}`.toLowerCase().includes(q.toLowerCase())));
  const sel = data.find((r) => r.id === selId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Басты бетке оралу</Link>
      <div className="mt-3 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Әкімдік бөлімі</h1><p className="text-sm text-muted-foreground">Өтініштерді басқару панелі</p></div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><LogOut className="h-4 w-4" /> Шығу</button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Барлық өтініштер", stats.all, "bg-caspian"], ["Жаңа", stats.new, "bg-status-new"], ["Жұмыста", stats.in_progress, "bg-status-progress"], ["Орындалды", stats.done, "bg-status-done"]].map(([l, n, c]) => (
          <div key={l as string} className="rounded-2xl border bg-card p-4">
            <span className={`block h-1.5 w-8 rounded-full ${c}`} />
            <p className="mt-3 text-sm text-muted-foreground">{l}</p>
            <p className="font-display text-3xl font-bold">{n}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Код, аты, мекенжай…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select value={st} onChange={(e) => setSt(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
          <option value="all">Барлық мәртебе</option>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
          <option value="all">Барлық санат</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-2xl border bg-card">
          {isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : list.length === 0 ? <p className="p-10 text-center text-muted-foreground">Өтініш жоқ</p> : (
            <ul className="divide-y">
              {list.map((r) => (
                <li key={r.id}>
                  <button onClick={() => setSelId(r.id)} className={`flex w-full items-start gap-3 p-4 text-left hover:bg-muted/60 ${selId === r.id ? "bg-muted" : ""}`}>
                    <span className="text-2xl">{catById(r.category).icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2"><span className="font-display text-xs font-bold">{r.code}</span><StatusBadge status={r.status} /></span>
                      <span className="mt-1 block truncate text-sm font-medium">{catById(r.category).label} · {districtLabel(r.microdistrict)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.full_name} · {fmtDate(r.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          {sel ? <Editor key={sel.id} r={sel} cred={cred} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-reports"] })} />
            : <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Өңдеу үшін тізімнен өтінішті таңдаңыз</div>}
        </div>
      </div>
    </div>
  );
}

function Editor({ r, cred, onSaved }: { r: AdminReport; cred: Cred; onSaved: () => void }) {
  const [status, setStatus] = useState(r.status);
  const [comment, setComment] = useState(r.staff_comment ?? "");
  const [resolved, setResolved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const photos = useQuery({ queryKey: ["photos", r.id], queryFn: () => getReportPhotos({ data: { id: r.id } }) });

  const waText = `Сәлеметсіз бе, ${r.full_name}! QalaLine (Ақтау қ. әкімдігі) хабарлайды: сіздің ${r.code} өтінішіңіз (${catById(r.category).label}, ${districtLabel(r.microdistrict)}) мәртебесі — «${statusById(status).label}».${comment ? " Түсініктеме: " + comment : ""} Бақылау: ${typeof window !== "undefined" ? window.location.origin : ""}/bakylau?code=${encodeURIComponent(r.code)}`;
  const wa = `https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`;

  async function save() {
    setSaving(true);
    try {
      await adminUpdateReport({ data: { ...cred, id: r.id, status: status as "new", staff_comment: comment.slice(0, 1000), resolved_photo: resolved } });
      toast.success("Сақталды"); onSaved(); photos.refetch();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Қате"); } finally { setSaving(false); }
  }

  return (
    <div className="rounded-2xl border bg-card">
      {photos.data?.photo && <img src={photos.data.photo} alt="Мәселе фотосы" className="aspect-[16/10] w-full rounded-t-2xl object-cover" />}
      <div className="space-y-4 p-5">
        <div>
          <p className="font-display font-bold">{r.code}</p>
          <p className="text-sm">{catById(r.category).icon} {catById(r.category).label} · {districtLabel(r.microdistrict)}, {r.address}</p>
          <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
          <p className="mt-2 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {r.full_name} · <a href={`tel:${r.phone}`} className="text-primary">{r.phone}</a></p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Мәртебе</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button key={s.id} onClick={() => setStatus(s.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${status === s.id ? `${s.soft} border-current ${s.text} font-semibold` : ""}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}
              </button>
            ))}
          </div>
        </div>
        <div><p className="mb-2 text-sm font-semibold">Түсініктеме</p><Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Жауапты маман пікірі…" maxLength={1000} /></div>
        <div>
          <p className="mb-2 text-sm font-semibold">Шешілген фото</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground hover:bg-muted">
            {resolved || photos.data?.resolved ? <img src={resolved ?? photos.data!.resolved!} alt="Шешілген" className="max-h-40 rounded" /> : <><Upload className="h-4 w-4" /> Фото тіркеу</>}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setResolved(await compressImage(f)); }} />
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Сақтау</button>
          <a href={wa} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-whatsapp py-2.5 font-semibold text-primary-foreground"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
