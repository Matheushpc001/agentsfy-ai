import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Customer { id: string; name: string; business_name: string; email: string }

export default function SchedulingTest() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(60);

  useEffect(() => {
    const load = async () => {
      // Carregar alguns clientes para teste (todos)
      const { data } = await supabase.from("customers").select("id,name,business_name,email").limit(50);
      setCustomers((data as any) || []);
    };
    load();
  }, []);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

  const checkMigrations = async () => {
    try {
      const { error: e1 } = await supabase.from("availabilities").select("id").limit(1);
      const { error: e2 } = await supabase.from("appointment_types").select("id").limit(1);
      if (e1 || e2) {
        toast.error("Tabelas não encontradas. Aplique as migrações no Supabase.");
      } else {
        toast.success("Migrações OK: tabelas availabilities e appointment_types existem.");
      }
    } catch (e) {
      toast.error("Erro ao checar migrações");
    }
  };

  const seedConfig = async () => {
    if (!customerId) return toast.error("Selecione um cliente");
    try {
      await supabase.from("availabilities").insert([
        { customer_id: customerId, day_of_week: 1, start_time: "09:00", end_time: "18:00" },
      ]);
      await supabase.from("appointment_types").insert([
        { customer_id: customerId, name: "Consulta Teste", duration_minutes: 60, description: "Teste" },
      ]);
      toast.success("Configuração de agenda criada (segunda 09:00-18:00, tipo 60m)");
    } catch (e) {
      toast.error("Erro ao criar configuração");
    }
  };

  const computeSlots = async () => {
    if (!customerId) return toast.error("Selecione um cliente");
    try {
      // Tenta chamar Edge Function se existir
      const { data, error } = await supabase.functions.invoke("get-available-slots", {
        body: { customer_id: customerId, date, duration_minutes: duration, step_minutes: 30 },
      } as any);
      if (!error && data?.slots) {
        setSlots(data.slots);
        toast.success(`Slots carregados (${data.slots.length}) via function`);
        return;
      }
    } catch {}

    // Fallback: computar no cliente
    try {
      const { data: avails } = await supabase
        .from("availabilities")
        .select("day_of_week,start_time,end_time")
        .eq("customer_id", customerId);
      const { data: appts } = await supabase
        .from("appointments")
        .select("start_time,end_time,status")
        .eq("customer_id", customerId)
        .gte("start_time", `${date}T00:00:00Z`)
        .lte("start_time", `${date}T23:59:59Z`);
      const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
      const onDay = (avails as any[])?.filter(a => a.day_of_week === dow) || [];
      const busy = (appts as any[])?.filter(a => a.status !== "canceled").map(a => ({ start: new Date(a.start_time).getTime(), end: new Date(a.end_time).getTime() })) || [];
      const step = 30;
      const found: string[] = [];
      for (const a of onDay) {
        const start = parseHM(date, a.start_time);
        const end = parseHM(date, a.end_time);
        for (let t = start; t + duration * 60000 <= end; t += step * 60000) {
          const tEnd = t + duration * 60000;
          const overlap = busy.some(b => t < b.end && tEnd > b.start);
          if (!overlap) found.push(new Date(t).toISOString());
        }
      }
      setSlots(found);
      toast.success(`Slots carregados (${found.length}) via fallback`);
    } catch (e) {
      toast.error("Erro ao calcular slots");
    }
  };

  const createAppointment = async () => {
    if (!customerId) return toast.error("Selecione um cliente");
    try {
      // Tenta Edge Function se existir
      if (slots[0]) {
        const start = new Date(slots[0]);
        const h = String(start.getUTCHours()).padStart(2, "0");
        const m = String(start.getUTCMinutes()).padStart(2, "0");
        try {
          const { data, error } = await supabase.functions.invoke("create-appointment", {
            body: {
              customer_id: customerId,
              title: "Agendamento Teste",
              date,
              time: `${h}:${m}`,
              duration_minutes: duration,
              description: "Criado pela página de teste",
            },
          } as any);
          if (!error && data?.success) {
            toast.success("Agendamento criado via function");
            return;
          }
        } catch {}
      }
      // Fallback: inserir direto
      const start = slots[0] ? new Date(slots[0]) : new Date(`${date}T09:00:00Z`);
      const end = new Date(start.getTime() + duration * 60000);
      const { error } = await supabase.from("appointments").insert({
        customer_id: customerId,
        franchisee_id: selectedCustomer ? undefined : undefined,
        title: "Agendamento Teste",
        description: "Criado pela página de teste (fallback)",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "scheduled",
      });
      if (error) throw error;
      toast.success("Agendamento criado (fallback)");
    } catch (e) {
      toast.error("Erro ao criar agendamento");
    }
  };

  return (
    <DashboardLayout title="Teste da Agenda Nativa">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>1) Seleção</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.business_name || c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || "60"))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2) Verificações/Mutações</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={checkMigrations} className="w-full">Checar migrações</Button>
            <Button onClick={seedConfig} variant="outline" className="w-full">Criar horário + tipo padrão</Button>
            <Button onClick={computeSlots} variant="outline" className="w-full">Calcular slots do dia</Button>
            <Button onClick={createAppointment} variant="outline" className="w-full">Criar agendamento de teste</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Resultado (Slots)</CardTitle></CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-muted-foreground">Nenhum slot carregado.</p>
            ) : (
              <ul className="list-disc pl-6 space-y-1">
                {slots.map(s => (
                  <li key={s}>{new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function parseHM(date: string, hm: string): number {
  const [h, m] = hm.split(":").map(x => parseInt(x));
  const d = new Date(`${date}T00:00:00Z`); d.setUTCHours(h, m, 0, 0); return d.getTime();
}

