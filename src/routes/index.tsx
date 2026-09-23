import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Sparkles, MapPin, Send, Eye, MessageCircle, ArrowRight, Search, Map } from "lucide-react";
import { CATEGORIES } from "@/lib/aktau";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QalaLine — Ақтау қаласының мәселесін хабарлаңыз" },
      { name: "description", content: "Ақтау тұрғындарына арналған платформа: жол тесігі, ашық люк, жарық, қоқыс мәселелерін фото мен геолокация арқылы хабарлап, шешілуін бақылаңыз." },
      { property: "og:title", content: "QalaLine — Ақтау қаласының мәселесін хабарлаңыз" },
      { property: "og:description", content: "Фото + геолокация арқылы қалалық мәселені хабарлаңыз және шешілу барысын бақылаңыз." },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Camera, t: "Фото жіберіңіз", d: "Мәселені суретке түсіріп, қысқаша сипаттаңыз." },
  { icon: Sparkles, t: "AI тексереді", d: "Жасанды интеллект фотоның қалалық мәселе екенін және қайталанбағанын тексереді." },
  { icon: MapPin, t: "Геолокация", d: "GPS немесе Ақтау картасы арқылы нақты нүкте белгіленеді." },
  { icon: Send, t: "Қызметкерге жіберіледі", d: "Өтініш тиісті әкімдік бөліміне немесе коммуналдық қызметке жолданады." },
  { icon: Eye, t: "Бақылаңыз", d: "#AKT-2026-XXXX кодымен мәртебені кез келген уақытта тексеріңіз." },
  { icon: MessageCircle, t: "WhatsApp хабарламасы", d: "Мәселе шешілгенде WhatsApp арқылы хабарлама аласыз." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden sea-gradient text-primary-foreground">
        <div className="absolute inset-0 wave-lines opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" /> Ақтау · Каспий жағалауы · 1–35 шағынаудан
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl">
              QalaLine — Ақтау қаласының мәселесін <span className="text-accent">хабарлаңыз</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
              Жол тесігі, ашық люк, жанбайтын шам немесе толған қоқыс контейнері — фото мен геолокацияны жіберіңіз, әкімдік пен коммуналдық қызметтер жұмысын ашық бақылаңыз.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/otinish" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-lg hover:brightness-105">
                <Camera className="h-5 w-5" /> Өтініш жіберу
              </Link>
              <Link to="/bakylau" className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground/15 px-5 py-3 font-semibold hover:bg-primary-foreground/25">
                <Search className="h-5 w-5" /> Өтінішті бақылау
              </Link>
              <Link to="/karta" className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-3 font-semibold hover:bg-primary-foreground/10">
                <Map className="h-5 w-5" /> Ақтау картасы
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-center">
            {[["Жаңа", "bg-status-new"], ["Жұмыста", "bg-status-progress"], ["Орындалды", "bg-status-done"], ["Қабылданбады", "bg-status-rejected"]].map(([l, c]) => (
              <div key={l} className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
                <span className={`block h-2.5 w-10 rounded-full ${c}`} />
                <p className="mt-3 font-display text-sm font-bold">{l}</p>
                <p className="mt-1 text-xs text-primary-foreground/70">өтініш мәртебесі</p>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl bg-primary-foreground p-4 text-foreground">
              <p className="text-xs text-muted-foreground">Бақылау коды</p>
              <p className="font-display text-xl font-bold text-caspian">#AKT-2026-1042</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">QalaLine қалай жұмыс істейді?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className="group relative rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-sand">{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-bold">{i + 1}. {s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Қандай мәселелерді жіберуге болады?</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
              <Link key={c.id} to="/otinish" search={{ category: c.id }} className="flex flex-col items-start gap-3 rounded-2xl bg-card p-5 transition hover:shadow-md">
                <span className="text-3xl">{c.icon}</span>
                <span className="font-semibold">{c.label}</span>
              </Link>
            ))}
          </div>
          <Link to="/otinish" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary">Қазір хабарлау <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
