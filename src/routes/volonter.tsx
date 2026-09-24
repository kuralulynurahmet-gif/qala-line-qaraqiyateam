import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, HandHeart, Loader2, CheckCircle2 } from "lucide-react";
import { registerVolunteer } from "@/lib/volunteers.functions";
import { DISTRICTS } from "@/lib/aktau";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/volonter")({
  head: () => ({
    meta: [
      { title: "ЖК волонтер ретінде тіркелу — QalaLine Ақтау" },
      { name: "description", content: "Ақтаудағы жеке кәсіпкерлер қала абаттандыруына көмектесу үшін волонтер ретінде тіркеле алады." },
      { property: "og:title", content: "ЖК волонтер ретінде тіркелу — QalaLine" },
      { property: "og:description", content: "Қалаға көмектескен кәсіпкерлерге әкімдік атынан алғыс хат беріледі." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  const [f, setF] = useState({ full_name: "", company_name: "", iin: "", phone: "+7", activity: "", microdistrict: "", help_description: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (done) return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-status-done" />
      <h1 className="mt-4 text-2xl font-bold">Рақмет! Сіз тіркелдіңіз</h1>
      <p className="mt-2 text-muted-foreground">Әкімдік қызметкерлері сізбен WhatsApp арқылы хабарласады. Көмегіңіз үшін әкімдік атынан алғыс хат беріледі.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Басты бетке</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button onClick={() => history.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Артқа қайту</button>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl sea-gradient text-primary-foreground"><HandHeart /></span>
        <div><h1 className="text-2xl font-bold">ЖК волонтер ретінде тіркелу</h1>
          <p className="text-sm text-muted-foreground">Қаламызды бірге абаттандырайық — көмектескен кәсіпкерлерге әкімдіктің алғыс хаты</p></div>
      </div>
      <form className="mt-6 space-y-4 rounded-2xl border bg-card p-5" onSubmit={async (e) => {
        e.preventDefault();
        if (!/^\+7\d{10}$/.test(f.phone)) { toast.error("Телефон +7XXXXXXXXXX форматында болсын"); return; }
        if (!/^\d{12}$/.test(f.iin)) { toast.error("ЖСН/БСН 12 саннан тұруы керек"); return; }
        setBusy(true);
        try { await registerVolunteer({ data: f }); setDone(true); }
        catch { toast.error("Тіркелу сәтсіз. Өрістерді тексеріңіз."); }
        finally { setBusy(false); }
      }}>
        <L t="Аты-жөніңіз"><Input required value={f.full_name} onChange={set("full_name")} /></L>
        <L t="ЖК атауы"><Input required placeholder="ЖК «Каспий Құрылыс»" value={f.company_name} onChange={set("company_name")} /></L>
        <div className="grid gap-4 sm:grid-cols-2">
          <L t="ЖСН / БСН"><Input required inputMode="numeric" maxLength={12} value={f.iin} onChange={set("iin")} /></L>
          <L t="Телефон / WhatsApp"><Input required value={f.phone} onChange={set("phone")} /></L>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <L t="Қызмет саласы"><Input required placeholder="Құрылыс, көгалдандыру..." value={f.activity} onChange={set("activity")} /></L>
          <L t="Шағынаудан (міндетті емес)">
            <select value={f.microdistrict} onChange={set("microdistrict")} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">—</option>
              {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </L>
        </div>
        <L t="Қандай көмек көрсете аласыз?"><Textarea required rows={4} value={f.help_description} onChange={set("help_description")} /></L>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Тіркелу
        </button>
      </form>
    </div>
  );
}

function L({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{t}</span>{children}</label>;
}
