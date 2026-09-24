import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { getThanksLetter } from "@/lib/volunteers.functions";
import { fmtDate } from "@/lib/aktau";

export const Route = createFileRoute("/algys/$id")({
  loader: ({ params }) => getThanksLetter({ data: { id: params.id } }),
  head: () => ({
    meta: [
      { title: "Алғыс хат — Ақтау қаласы әкімдігі" },
      { name: "description", content: "Ақтау қаласы әкімдігінің волонтер кәсіпкерге берген алғыс хаты." },
      { property: "og:title", content: "Алғыс хат — Ақтау қаласы әкімдігі" },
      { property: "og:description", content: "Қала абаттандыруына көмектескен кәсіпкерге алғыс хат." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <p className="p-10 text-center">Қате орын алды</p>,
  notFoundComponent: () => <p className="p-10 text-center">Табылмады</p>,
  component: Letter,
});

function Letter() {
  const l = Route.useLoaderData();
  if (!l) return (
    <div className="p-16 text-center">
      <p className="text-muted-foreground">Алғыс хат табылмады</p>
      <Link to="/" className="mt-4 inline-block underline">Басты бет</Link>
    </div>
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Printer className="h-4 w-4" /> Басып шығару / PDF</button>
      </div>
      <div className="rounded-2xl border-[6px] border-double border-caspian bg-card p-10 text-center sm:p-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-caspian">Маңғыстау облысы · Ақтау қаласының әкімдігі</p>
        <h1 className="mt-6 font-display text-5xl font-bold">АЛҒЫС ХАТ</h1>
        <p className="mt-8 text-lg">Құрметті</p>
        <p className="mt-1 font-display text-2xl font-bold">{l.company_name}</p>
        <p className="text-muted-foreground">{l.full_name}</p>
        <p className="mx-auto mt-8 max-w-xl whitespace-pre-line text-lg leading-relaxed">{l.thanks_text}</p>
        <div className="mt-14 flex items-end justify-between text-left text-sm">
          <div><p className="font-semibold">Ақтау қаласының әкімдігі</p><p className="text-muted-foreground">QalaLine платформасы</p></div>
          <div className="text-right"><p>{l.thanked_at ? fmtDate(l.thanked_at) : ""}</p><p className="text-muted-foreground">Ақтау қ.</p></div>
        </div>
      </div>
    </div>
  );
}
