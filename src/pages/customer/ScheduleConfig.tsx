import { useCallback, useEffect, useState } from "react";
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
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: av } = await supabase.from("availabilities").select("*").eq("customer_id", user.id).order("day_of_week");
      setAvailabilities(av || []);
      const { data: t } = await supabase.from("appointment_types").select("*").eq("customer_id", user.id).order("name");
      setTypes(t || []);
    } catch (e) { console.error(e); toast.error("Erro ao carregar configurações"); }
  }, [user]);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const resetAvailabilityForm = () => {
    setFormAvail({ day_of_week: 1, start_time: "09:00", end_time: "18:00" });
    setEditingAvailabilityId(null);
  };

  const resetTypeForm = () => {
    setFormType({ name: "Consulta", duration_minutes: 60, description: "" });
    setEditingTypeId(null);
  };

  const availabilityToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const handleAvailabilitySubmit = async () => {
    if (!user) return;
    try {
      if (!formAvail.start_time || !formAvail.end_time) {
        toast.error("Informe horário de início e fim");
        return;
      }

      const startMinutes = availabilityToMinutes(formAvail.start_time);
      const endMinutes = availabilityToMinutes(formAvail.end_time);

      if (isNaN(startMinutes) || isNaN(endMinutes)) {
        toast.error("Horários inválidos");
        return;
      }

      if (startMinutes >= endMinutes) {
        toast.error("Horário inicial deve ser antes do horário final");
        return;
      }

      const hasDayAlready = availabilities.some((a) => a.day_of_week === formAvail.day_of_week && a.id !== editingAvailabilityId);
      if (hasDayAlready) {
        toast.error("Esse dia já possui um horário cadastrado");
        return;
      }

      if (editingAvailabilityId) {
        const { error } = await supabase
          .from("availabilities")
          .update({
            day_of_week: formAvail.day_of_week,
            start_time: formAvail.start_time,
            end_time: formAvail.end_time,
          })
          .eq("id", editingAvailabilityId);
        if (error) throw error;
        toast.success("Horário atualizado");
      } else {
        const { error } = await supabase.from("availabilities").insert({ customer_id: user.id, ...formAvail });
        if (error) throw error;
        toast.success("Horário adicionado");
      }

      await loadData();
      resetAvailabilityForm();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar horário");
    }
  };

  const startEditAvailability = (availability: Availability) => {
    setFormAvail({
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
    });
    setEditingAvailabilityId(availability.id);
  };

  const delAvailability = async (id: string) => {
    try {
      await supabase.from("availabilities").delete().eq("id", id);
      if (id === editingAvailabilityId) resetAvailabilityForm();
      await loadData();
    } catch {
      toast.error("Erro ao remover horário");
    }
  };

  const handleTypeSubmit = async () => {
    if (!user) return;
    try {
      const name = formType.name.trim();
      const description = formType.description.trim();
      const duration = Number(formType.duration_minutes);

      if (!name) {
        toast.error("Informe um nome");
        return;
      }

      if (name.length > 60) {
        toast.error("Nome deve ter até 60 caracteres");
        return;
      }

      if (!Number.isFinite(duration) || duration <= 0) {
        toast.error("Informe uma duração válida");
        return;
      }

      if (duration < 5 || duration > 600) {
        toast.error("Duração deve ficar entre 5 e 600 minutos");
        return;
      }

      if (description.length > 200) {
        toast.error("Descrição deve ter até 200 caracteres");
        return;
      }

      const duplicateName = types.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== editingTypeId);
      if (duplicateName) {
        toast.error("Já existe um tipo de agendamento com esse nome");
        return;
      }

      if (editingTypeId) {
        const { error } = await supabase
          .from("appointment_types")
          .update({
            name,
            duration_minutes: duration,
            description: description || null,
          })
          .eq("id", editingTypeId);
        if (error) throw error;
        toast.success("Tipo atualizado");
      } else {
        const { error } = await supabase.from("appointment_types").insert({
          customer_id: user.id,
          name,
          duration_minutes: duration,
          description: description || null,
        });
        if (error) throw error;
        toast.success("Tipo adicionado");
      }

      await loadData();
      resetTypeForm();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar tipo de agendamento");
    }
  };

  const startEditType = (type: AppointmentType) => {
    setFormType({
      name: type.name,
      duration_minutes: type.duration_minutes,
      description: type.description || "",
    });
    setEditingTypeId(type.id);
  };

  const delType = async (id: string) => {
    try {
      await supabase.from("appointment_types").delete().eq("id", id);
      if (id === editingTypeId) resetTypeForm();
      await loadData();
    } catch {
      toast.error("Erro ao remover tipo");
    }
  };

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
              <div className="flex flex-col md:flex-row md:items-end md:justify-end gap-2">
                {editingAvailabilityId ? (
                  <>
                    <Button onClick={handleAvailabilitySubmit} className="w-full md:w-auto md:min-w-[140px]">Salvar alterações</Button>
                    <Button variant="outline" onClick={resetAvailabilityForm} className="w-full md:w-auto md:min-w-[100px]">Cancelar</Button>
                  </>
                ) : (
                  <Button onClick={handleAvailabilitySubmit} className="w-full md:w-auto md:min-w-[140px]">Adicionar</Button>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead className="w-24 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{DAYS.find((d) => d.v === a.day_of_week)?.label}</TableCell>
                    <TableCell>{a.start_time}</TableCell>
                    <TableCell>{a.end_time}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditAvailability(a)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => delAvailability(a.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                <Input
                  value={formType.name}
                  onChange={(e) => setFormType((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Consulta Inicial"
                  maxLength={60}
                />
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={5}
                  max={600}
                  value={formType.duration_minutes}
                  onChange={(e) => setFormType((p) => ({ ...p, duration_minutes: parseInt(e.target.value || "0") || 0 }))}
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-end gap-2">
                {editingTypeId ? (
                  <>
                    <Button onClick={handleTypeSubmit} className="w-full md:w-auto md:min-w-[140px]">Salvar alterações</Button>
                    <Button variant="outline" onClick={resetTypeForm} className="w-full md:w-auto md:min-w-[100px]">Cancelar</Button>
                  </>
                ) : (
                  <Button onClick={handleTypeSubmit} className="w-full md:w-auto md:min-w-[140px]">Adicionar</Button>
                )}
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={formType.description}
                onChange={(e) => setFormType((p) => ({ ...p, description: e.target.value }))}
                placeholder="Opcional"
                maxLength={200}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="w-24 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.duration_minutes} min</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-[200px]">{t.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditType(t)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => delType(t.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
