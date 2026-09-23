import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PUBLIC_COLS =
  "id, code, microdistrict, address, category, description, lat, lng, status, staff_comment, created_at, updated_at";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type PublicReport = {
  id: string; code: string; microdistrict: string; address: string; category: string;
  description: string; lat: number; lng: number; status: string; staff_comment: string | null;
  created_at: string; updated_at: string;
};

export const listPublicReports = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("reports").select(PUBLIC_COLS).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicReport[];
});

export const getReportPhotos = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: r } = await db.from("reports").select("photo_url, resolved_photo_url").eq("id", data.id).maybeSingle();
    return { photo: r?.photo_url ?? null, resolved: r?.resolved_photo_url ?? null };
  });

export const trackReport = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ code: z.string().trim().min(3).max(30) }).parse(d))
  .handler(async ({ data }) => {
    let code = data.code.toUpperCase().replace(/\s/g, "");
    if (!code.startsWith("#")) code = "#" + code;
    if (!code.startsWith("#AKT-")) code = "#AKT-2026-" + code.replace("#", "");
    const db = await admin();
    const { data: r } = await db.from("reports").select(PUBLIC_COLS + ", photo_url, resolved_photo_url").eq("code", code).maybeSingle();
    return (r ?? null) as (PublicReport & { photo_url: string | null; resolved_photo_url: string | null }) | null;
  });

const photoSchema = z.string().startsWith("data:image/").max(3_000_000);

export const aiCheckPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ photo: photoSchema, category: z.string().max(30), lat: z.number().nullable(), lng: z.number().nullable() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { distanceM } = await import("./reports.server");
    let isIssue = true, reason = "", suggested = data.category;
    const key = process.env['LOVABLE_API_KEY'];
    if (key) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  'Сен қалалық инфрақұрылым өтініштерін тексеретін модераторсың. Фотода қалалық мәселе (жол тесігі, ашық люк, жанбайтын шам, сынған аялдама, қоқыс, жол белгісі, су/кәріз, аула) бар-жоғын анықта. Тек JSON қайтар: {"is_city_issue": boolean, "category": "pothole|manhole|light|bus_stop|trash|signs|water|yard|other", "reason": "қазақ тілінде 1 сөйлем"}',
              },
              { role: "user", content: [{ type: "text", text: `Тұрғын таңдаған санат: ${data.category}` }, { type: "image_url", image_url: { url: data.photo } }] },
            ],
          }),
        });
        if (res.ok) {
          const j = await res.json();
          const txt: string = j.choices?.[0]?.message?.content ?? "";
          const m = txt.match(/\{[\s\S]*\}/);
          if (m) {
            const p = JSON.parse(m[0]);
            isIssue = !!p.is_city_issue; reason = String(p.reason ?? ""); suggested = String(p.category ?? data.category);
          }
        } else {
          reason = res.status === 429 ? "AI қызметі бос емес, кейінірек қайталаңыз." : "AI тексеруі уақытша қолжетімсіз.";
        }
      } catch {
        reason = "AI тексеруі уақытша қолжетімсіз.";
      }
    }
    let duplicate: string | null = null;
    if (data.lat != null && data.lng != null) {
      const db = await admin();
      const { data: rows } = await db.from("reports").select("code, lat, lng, category, status").eq("category", data.category).in("status", ["new", "in_progress"]);
      const hit = (rows ?? []).find((r) => distanceM([r.lat, r.lng], [data.lat!, data.lng!]) < 60);
      if (hit) duplicate = hit.code;
    }
    return { isIssue, reason, suggested, duplicate };
  });

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      full_name: z.string().trim().min(2).max(100),
      phone: z.string().trim().regex(/^\+7\d{10}$/),
      microdistrict: z.string().trim().min(1).max(40),
      address: z.string().trim().min(1).max(200),
      category: z.string().max(30),
      description: z.string().trim().min(5).max(1000),
      photo: photoSchema.nullable(),
      lat: z.number().min(43.5).max(43.8),
      lng: z.number().min(51.0).max(51.4),
      ai_note: z.string().max(300).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    for (let i = 0; i < 6; i++) {
      const code = `#AKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await db.from("reports").insert({
        code, full_name: data.full_name, phone: data.phone, microdistrict: data.microdistrict, address: data.address,
        category: data.category, description: data.description, photo_url: data.photo, lat: data.lat, lng: data.lng,
        ai_note: data.ai_note ?? null,
      });
      if (!error) return { code };
      if (!error.message.includes("duplicate")) throw new Error(error.message);
    }
    throw new Error("Код жасау мүмкін болмады");
  });

const cred = z.object({ u: z.string().max(50), p: z.string().max(50) });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => cred.parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./reports.server");
    assertAdmin(data.u, data.p);
    return { ok: true };
  });

export type AdminReport = PublicReport & { full_name: string; phone: string; ai_note: string | null };

export const adminListReports = createServerFn({ method: "POST" })
  .inputValidator((d) => cred.parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./reports.server");
    assertAdmin(data.u, data.p);
    const db = await admin();
    const { data: rows, error } = await db.from("reports").select(PUBLIC_COLS + ", full_name, phone, ai_note").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as AdminReport[];
  });

export const adminUpdateReport = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    cred.extend({
      id: z.string().uuid(),
      status: z.enum(["new", "in_progress", "done", "rejected"]),
      staff_comment: z.string().max(1000),
      resolved_photo: photoSchema.nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./reports.server");
    assertAdmin(data.u, data.p);
    const db = await admin();
    const patch: { status: string; staff_comment: string; updated_at: string; resolved_photo_url?: string } = { status: data.status, staff_comment: data.staff_comment, updated_at: new Date().toISOString() };
    if (data.resolved_photo) patch.resolved_photo_url = data.resolved_photo;
    const { error } = await db.from("reports").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
