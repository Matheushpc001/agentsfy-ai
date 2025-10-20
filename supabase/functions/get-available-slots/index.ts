import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  customer_id: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  step_minutes?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = (await req.json()) as Body;
    const { customer_id, date, duration_minutes, step_minutes = 15 } = body;
    if (!customer_id || !date || !duration_minutes) {
      return json({ error: "Missing params" }, 400);
    }

    const day = new Date(`${date}T00:00:00Z`);
    const dayOfWeek = day.getUTCDay();

    const { data: avails } = await supabase
      .from("availabilities")
      .select("start_time,end_time")
      .eq("customer_id", customer_id)
      .eq("day_of_week", dayOfWeek);

    if (!avails || avails.length === 0) return json({ slots: [] });

    // Fetch existing appointments for that day
    const startOfDay = new Date(date + "T00:00:00Z").toISOString();
    const endOfDay = new Date(date + "T23:59:59Z").toISOString();
    const { data: appts } = await supabase
      .from("appointments")
      .select("start_time,end_time,status")
      .eq("customer_id", customer_id)
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay);

    const busy = (appts || []).filter((a) => a.status !== "canceled").map((a) => ({
      start: new Date(a.start_time).getTime(),
      end: new Date(a.end_time).getTime(),
    }));

    const result: string[] = [];
    for (const a of avails) {
      const start = parseHM(date, a.start_time);
      const end = parseHM(date, a.end_time);
      for (let t = start; t + duration_minutes * 60000 <= end; t += step_minutes * 60000) {
        const slotStart = t;
        const slotEnd = t + duration_minutes * 60000;
        const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
        if (!overlaps) result.push(new Date(slotStart).toISOString());
      }
    }

    return json({ slots: result });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function parseHM(date: string, hm: string): number {
  // hm = "HH:MM"
  const [h, m] = hm.split(":").map((x) => parseInt(x));
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(h, m, 0, 0);
  return d.getTime();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

