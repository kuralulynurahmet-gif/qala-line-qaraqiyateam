import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type Volunteer = {
  id: string; full_name: string; company_name: string; iin: string; phone: string; activity: string;
  microdistrict: string; help_description: string; thanked: boolean; thanks_text: string | null;
  thanked_at: string | null; created_at: string;
};

export const registerVolunteer = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      full_name: z.string().trim().min(2).max(100),
      company_name: z.string().trim().min(2).max(150),
      iin: z.string().trim().regex(/^\d{12}$/),
      phone: z.string().trim().regex(/^\+7\d{10}$/),
      activity: z.string().trim().min(2).max(200),
      microdistrict: z.string().trim().max(40),
      help_description: z.string().trim().min(5).max(1000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db.from("volunteers").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getThanksLetter = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: r } = await db.from("volunteers")
      .select("full_name, company_name, help_description, thanks_text, thanked, thanked_at")
      .eq("id", data.id).eq("thanked", true).maybeSingle();
    return r ?? null;
  });

const cred = z.object({ u: z.string().max(50), p: z.string().max(50) });

export const adminListVolunteers = createServerFn({ method: "POST" })
  .inputValidator((d) => cred.parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./reports.server");
    assertAdmin(data.u, data.p);
    const db = await admin();
    const { data: rows, error } = await db.from("volunteers").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Volunteer[];
  });

export const adminThankVolunteer = createServerFn({ method: "POST" })
  .inputValidator((d) => cred.extend({ id: z.string().uuid(), text: z.string().trim().min(5).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./reports.server");
    assertAdmin(data.u, data.p);
    const db = await admin();
    const { error } = await db.from("volunteers")
      .update({ thanked: true, thanks_text: data.text, thanked_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
