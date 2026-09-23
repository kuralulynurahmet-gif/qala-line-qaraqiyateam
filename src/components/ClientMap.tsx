import { lazy, Suspense, useEffect, useState, type ComponentProps } from "react";
import type AktauMapType from "./AktauMap";

const LazyMap = lazy(() => import("./AktauMap"));

export function ClientMap(props: ComponentProps<typeof AktauMapType>) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const fallback = <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground">Ақтау картасы жүктелуде…</div>;
  if (!ready) return fallback;
  return <Suspense fallback={fallback}><LazyMap {...props} /></Suspense>;
}
