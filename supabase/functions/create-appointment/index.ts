import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  customer_id: string;
  franchisee_id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration_minutes: number;
  description?: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = (await req.json()) as Body;
    const { customer_id, franchisee_id, title, date, time, duration_minutes, description, location } = body;
    if (!customer_id || !title || !date || !time || !duration_minutes) {
      return json({ error: "Missing params" }, 400);
    }

    // Derive franchisee_id if not provided
    let fid = franchisee_id;
    if (!fid) {
      const { data: cust } = await supabase.from("customers").select("franchisee_id").eq("id", customer_id).single();
      fid = cust?.franchisee_id ?? null;
    }

    const start = new Date(`${date}T${time}:00Z`);
    const end = new Date(start.getTime() + duration_minutes * 60000);

    // Validate within availability
    const dow = start.getUTCDay();
    const { data: avails } = await supabase.from("availabilities").select("start_time,end_time").eq("customer_id", customer_id).eq("day_of_week", dow);
    const fitsAvailability = (avails || []).some((a) => {
      const avStart = parseHM(date, a.start_time);
      const avEnd = parseHM(date, a.end_time);
      return start.getTime() >= avStart && end.getTime() <= avEnd;
    });
    if (!fitsAvailability) return json({ error: "outside_availability" }, 409);

    // Check overlap
    const { data: overlaps } = await supabase
      .from("appointments")
      .select("id,start_time,end_time,status")
      .eq("customer_id", customer_id)
      .gte("start_time", new Date(date + "T00:00:00Z").toISOString())
      .lte("start_time", new Date(date + "T23:59:59Z").toISOString());

    const busy = (overlaps || []).filter((a) => a.status !== "canceled").map((a) => ({ start: new Date(a.start_time).getTime(), end: new Date(a.end_time).getTime() }));
    const conflict = busy.some((b) => start.getTime() < b.end && end.getTime() > b.start);
    if (conflict) return json({ error: "slot_conflict" }, 409);

    const { error } = await supabase.from("appointments").insert({
      franchisee_id: fid,
      customer_id,
      title,
      description: description || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      location: location || null,
      status: "scheduled",
    });
    if (error) throw error;

    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function parseHM(date: string, hm: string): number {
  const [h, m] = hm.split(":").map((x) => parseInt(x));
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(h, m, 0, 0);
  return d.getTime();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

