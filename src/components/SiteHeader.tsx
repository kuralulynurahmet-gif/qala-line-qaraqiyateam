import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Басты бет" },
  { to: "/otinish", label: "Өтініш жіберу" },
  { to: "/bakylau", label: "Бақылау" },
  { to: "/karta", label: "Ақтау картасы" },
  { to: "/admin", label: "Әкімдік" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[1000] border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl sea-gradient font-display text-sm font-bold text-primary-foreground">QL</span>
          <span className="font-display text-lg font-bold">Qala<span className="text-caspian">Line</span></span>
          <span className="hidden rounded-full bg-sand px-2 py-0.5 text-xs font-semibold sm:inline">Ақтау</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted !text-foreground" }}>{n.label}</Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Мәзір">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="flex flex-col border-t px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© 2026 QalaLine — Ақтау қаласының цифрлық кері байланыс платформасы</span>
        <span>Маңғыстау облысы, Ақтау қ.</span>
      </div>
    </footer>
  );
}
