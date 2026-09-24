import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Crosshair, Loader2, Sparkles, CheckCircle2, AlertTriangle, Copy, ArrowLeft } from "lucide-react";
import { CATEGORIES, DISTRICTS, districtCenter, catById } from "@/lib/aktau";
import { compressImage } from "@/lib/image";
import { aiCheckPhoto, createReport } from "@/lib/reports.functions";
import { ClientMap } from "@/components/ClientMap";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/otinish")({
  validateSearch: (s: Record<string, unknown>) => z.object({ category: z.string().max(30).optional().catch(undefined) }).parse(s),
  head: () => ({
    meta: [
      { title: "Өтініш жіберу — QalaLine Ақтау" },
      { name: "description", content: "Ақтаудағы қалалық мәселені фото, шағынаудан және геолокациямен хабарлаңыз. Жеке бақылау коды беріледі." },
      { property: "og:title", content: "Өтініш жіберу — QalaLine Ақтау" },
      { property: "og:description", content: "Фото + геолокация + AI тексеруі арқылы өтініш жіберіңіз." },
    ],
  }),
  component: SubmitPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Аты-жөніңізді енгізіңіз").max(100),
  phone: z.string().regex(/^\+7\d{10}$/, "Нөмір +7XXXXXXXXXX форматында болуы керек"),
  microdistrict: z.string().min(1, "Шағынауданды таңдаңыз"),
  address: z.string().trim().min(1, "Үй/ғимарат немесе көшені көрсетіңіз").max(200),
  description: z.string().trim().min(5, "Мәселені қысқаша сипаттаңыз").max(1000),
});

type Ai = Awaited<ReturnType<typeof aiCheckPhoto>>;

function SubmitPage() {
  const search = Route.useSearch();
  const [f, setF] = useState({ full_name: "", phone: "+7", microdistrict: "", address: "", description: "", category: search.category ?? "pothole" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [fly, setFly] = useState<[number, number] | null>(null);
  const [ai, setAi] = useState<Ai | null>(null);
  const [checking, setChecking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Тек сурет файлын жүктеңіз"); return; }
    const data = await compressImage(file);
    setPhoto(data);
    runAi(data, f.category, point);
  }
  async function runAi(p: string, category: string, pt: [number, number] | null) {
    setChecking(true); setAi(null);
    try { setAi(await aiCheckPhoto({ data: { photo: p, category, lat: pt?.[0] ?? null, lng: pt?.[1] ?? null } })); }
    catch { toast.error("AI тексеруі сәтсіз аяқталды"); }
    finally { setChecking(false); }
  }
  function locate() {
    if (!navigator.geolocation) { toast.error("Құрылғыңыз геолокацияны қолдамайды"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (p[0] < 43.5 || p[0] > 43.8 || p[1] < 51 || p[1] > 51.4) { toast.warning("Сіз Ақтау аумағынан тыссыз. Нүктені картадан таңдаңыз."); return; }
        setPoint(p); setFly(p); toast.success("Орныңыз анықталды");
      },
      () => { setLocating(false); toast.error("Орынды анықтау мүмкін болмады. Картадан таңдаңыз."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(f);
    const errs: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    if (!point) errs["point"] = "Картадан нүктені таңдаңыз немесе GPS қолданыңыз";
    if (!photo) errs["photo"] = "Мәселенің фотосын жүктеңіз";
    setErrors(errs);
    if (Object.keys(errs).length || !point) { toast.error("Форманы толық толтырыңыз"); return; }
    if (ai && !ai.isIssue && !confirm("AI бұл фотода қалалық мәселе анықтамады. Бәрібір жібересіз бе?")) return;
    setSending(true);
    try {
      const res = await createReport({ data: { ...f, photo, lat: point[0], lng: point[1] } });
      setDone(res.code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Жіберу сәтсіз"); }
    finally { setSending(false); }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-status-done" />
        <h1 className="mt-4 text-2xl font-bold">Өтінішіңіз қабылданды!</h1>
        <p className="mt-2 text-muted-foreground">Жеке бақылау кодыңызды сақтап қойыңыз:</p>
        <button onClick={() => { navigator.clipboard.writeText(done); toast.success("Көшірілді"); }}
          className="mx-auto mt-5 flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary bg-primary/5 px-6 py-4 font-display text-2xl font-bold text-primary">
          {done} <Copy className="h-5 w-5" />
        </button>
        <p className="mt-4 text-sm text-muted-foreground">Мәселе шешілгенде WhatsApp арқылы хабарлама аласыз.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/bakylau" search={{ code: done }} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Бақылау</Link>
          <button onClick={() => { setDone(null); setPhoto(null); setAi(null); setPoint(null); setF((p) => ({ ...p, description: "", address: "" })); }} className="rounded-xl border px-5 py-3 font-semibold">Жаңа өтініш</button>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Артқа қайту</Link>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Өтініш жіберу</h1>
      <p className="mt-2 text-muted-foreground">Ақтау қаласындағы мәселе туралы хабарлаңыз — барлық өріс міндетті.</p>

      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Аты-жөніңіз</Label><Input className="mt-1.5" value={f.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Мысалы: Айгүл Серікова" maxLength={100} />{err("full_name")}</div>
            <div><Label>Телефон / WhatsApp</Label><Input className="mt-1.5" inputMode="tel" value={f.phone}
              onChange={(e) => { let v = e.target.value.replace(/[^\d+]/g, ""); if (!v.startsWith("+7")) v = "+7" + v.replace(/^\+?7?/, ""); set("phone", v.slice(0, 12)); }} placeholder="+77011234567" />{err("phone")}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Шағынаудан</Label>
              <select className="mt-1.5 h-9 w-full rounded-md border bg-transparent px-3 text-sm" value={f.microdistrict}
                onChange={(e) => { set("microdistrict", e.target.value); if (e.target.value) setFly(districtCenter(e.target.value)); }}>
                <option value="">— таңдаңыз —</option>
                <optgroup label="Шағынаудандар">{DISTRICTS.filter((d) => /^\d+$/.test(d.id)).map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</optgroup>
                <optgroup label="Жаңа шағынаудандар">{DISTRICTS.filter((d) => !/^\d+$/.test(d.id)).map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</optgroup>
              </select>{err("microdistrict")}
            </div>
            <div><Label>Үй / ғимарат немесе көше</Label><Input className="mt-1.5" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Мысалы: 12-үй, Тәуелсіздік даңғылы" maxLength={200} />{err("address")}</div>
          </div>
          <div>
            <Label>Мәселе санаты</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.filter((c) => c.id !== "yard").map((c) => (
                <button type="button" key={c.id} onClick={() => { set("category", c.id); if (photo) runAi(photo, c.id, point); }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${f.category === c.id ? "border-primary bg-primary/10 font-semibold" : "hover:bg-muted"}`}>
                  <span>{c.icon}</span>{c.label}
                </button>
              ))}
            </div>
          </div>
          <div><Label>Мәселенің сипаттамасы</Label><Textarea className="mt-1.5" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Не болды, қашаннан бері, қаншалықты қауіпті?" maxLength={1000} />{err("description")}</div>

          <div>
            <Label>Фото</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-muted/50 p-4 text-sm text-muted-foreground hover:bg-muted">
              {photo ? <img src={photo} alt="Алдын ала қарау" className="max-h-64 rounded-lg object-contain" /> : <><Camera className="h-8 w-8" /> Суретке түсіру немесе жүктеу</>}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {err("photo")}
            {(checking || ai) && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${checking ? "bg-muted" : ai?.isIssue && !ai.duplicate ? "bg-status-done/10" : "bg-status-new/15"}`}>
                <p className="flex items-center gap-2 font-semibold">
                  {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> AI фотоны тексеруде…</> : ai?.isIssue ? <><Sparkles className="h-4 w-4 text-status-done" /> AI: қалалық мәселе расталды</> : <><AlertTriangle className="h-4 w-4 text-status-new" /> AI: қалалық мәселе анық емес</>}
                </p>
                {ai?.reason && <p className="mt-1 text-muted-foreground">{ai.reason}</p>}
                {ai && ai.suggested !== f.category && ai.suggested !== "other" && (
                  <button type="button" onClick={() => set("category", ai.suggested)} className="mt-1 text-primary underline">Ұсынылған санат: {catById(ai.suggested).label}</button>
                )}
                {ai?.duplicate && <p className="mt-1 font-medium text-status-rejected">Бұл жерде ұқсас өтініш бар: {ai.duplicate}</p>}
                {ai && !ai.duplicate && !checking && <p className="mt-1 text-muted-foreground">Қайталанатын өтініш табылмады.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold">Геолокация</p><p className="text-xs text-muted-foreground">GPS қолданыңыз немесе Ақтау картасын басып нүктені белгілеңіз</p></div>
              <button type="button" onClick={locate} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold">
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />} Менің орным
              </button>
            </div>
            <div className="h-80 overflow-hidden rounded-xl sm:h-[420px]">
              <ClientMap picked={point} flyTo={fly} onPick={(lat, lng) => { const p: [number, number] = [lat, lng]; setPoint(p); if (photo) runAi(photo, f.category, p); }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{point ? `Таңдалған нүкте: ${point[0].toFixed(5)}, ${point[1].toFixed(5)}` : "Нүкте әлі таңдалмаған"}</p>
            {err("point")}
          </div>
          <button disabled={sending || checking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground shadow-lg disabled:opacity-60">
            {sending && <Loader2 className="h-5 w-5 animate-spin" />} Өтінішті жіберу
          </button>
          <p className="text-center text-xs text-muted-foreground">Жібергеннен кейін #AKT-2026-XXXX бақылау коды автоматты беріледі.</p>
        </div>
      </form>
    </div>
  );
}
