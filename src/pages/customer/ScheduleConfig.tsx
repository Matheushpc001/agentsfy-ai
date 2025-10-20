import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

const DAYS = [
  { v: 1, label: "Segunda" },
  { v: 2, label: "Terça" },
  { v: 3, label: "Quarta" },
  { v: 4, label: "Quinta" },
  { v: 5, label: "Sexta" },
  { v: 6, label: "Sábado" },
  { v: 0, label: "Domingo" },
];

interface Availability { id: string; customer_id: string; day_of_week: number; start_time: string; end_time: string }
interface AppointmentType { id: string; customer_id: string; name: string; duration_minutes: number; description?: string }

export default function ScheduleConfig() {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [formAvail, setFormAvail] = useState({ day_of_week: 1, start_time: "09:00", end_time: "18:00" });
  const [formType, setFormType] = useState({ name: "Consulta", duration_minutes: 60, description: "" });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const { data: av } = await supabase.from("availabilities").select("*").eq("customer_id", user.id).order("day_of_week");
      setAvailabilities(av || []);
      const { data: t } = await supabase.from("appointment_types").select("*").eq("customer_id", user.id).order("name");
      setTypes(t || []);
    } catch (e) { console.error(e); toast.error("Erro ao carregar configurações"); }
  };

  const addAvailability = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("availabilities").insert({ customer_id: user.id, ...formAvail });
      if (error) throw error; toast.success("Horário adicionado"); await loadData();
    } catch { toast.error("Erro ao salvar"); }
  };

  const delAvailability = async (id: string) => { try { await supabase.from("availabilities").delete().eq("id", id); await loadData(); } catch {} };

  const addType = async () => {
    if (!user) return;
    if (!formType.name.trim()) return toast.error("Informe um nome");
    try {
      const { error } = await supabase.from("appointment_types").insert({ customer_id: user.id, name: formType.name.trim(), duration_minutes: formType.duration_minutes, description: formType.description?.trim() || null });
      if (error) throw error; toast.success("Tipo adicionado"); await loadData();
    } catch { toast.error("Erro ao salvar"); }
  };

  const delType = async (id: string) => { try { await supabase.from("appointment_types").delete().eq("id", id); await loadData(); } catch {} };

  return (
    <DashboardLayout title="Configurar Agenda">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Horários de Atendimento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Dia</Label>
                <Select value={String(formAvail.day_of_week)} onValueChange={(v) => setFormAvail((p) => ({ ...p, day_of_week: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d) => (<SelectItem key={d.v} value={String(d.v)}>{d.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Início</Label>
                <Input type="time" value={formAvail.start_time} onChange={(e) => setFormAvail((p) => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="time" value={formAvail.end_time} onChange={(e) => setFormAvail((p) => ({ ...p, end_time: e.target.value }))} />
              </div>
              <div className="flex items-end"><Button onClick={addAvailability} className="w-full">Adicionar</Button></div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{DAYS.find((d) => d.v === a.day_of_week)?.label}</TableCell>
                    <TableCell>{a.start_time}</TableCell>
                    <TableCell>{a.end_time}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => delAvailability(a.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tipos de Agendamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Nome</Label>
                <Input value={formType.name} onChange={(e) => setFormType((p) => ({ ...p, name: e.target.value }))} placeholder="Consulta Inicial" />
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Input type="number" value={formType.duration_minutes} onChange={(e) => setFormType((p) => ({ ...p, duration_minutes: parseInt(e.target.value || "0") }))} />
              </div>
              <div className="flex items-end"><Button onClick={addType} className="w-full">Adicionar</Button></div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={formType.description} onChange={(e) => setFormType((p) => ({ ...p, description: e.target.value }))} placeholder="Opcional" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.duration_minutes} min</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => delType(t.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

