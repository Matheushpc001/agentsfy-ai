import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Calendar, Edit, Trash2, CheckCircle, User } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  customer_id: string;
  status: "scheduled" | "completed" | "canceled";
  customer?: { name: string; business_name: string; email: string };
}

interface Customer { id: string; name: string; business_name: string; email: string }

export default function ScheduleNative() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const [form, setForm] = useState({
    customer_id: "",
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    duration: 60,
    location: "",
  });

  useEffect(() => { if (user) loadData(); }, [user, selectedDate]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data: customersData } = await supabase.from("customers").select("*").eq("franchisee_id", user.id);
      setCustomers(customersData || []);

      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      const { data: appts } = await supabase
        .from("appointments")
        .select(`*, customers (name, business_name, email)`) 
        .eq("franchisee_id", user.id)
        .gte("start_time", startOfDay)
        .lte("start_time", endOfDay)
        .order("start_time", { ascending: true });
      setAppointments(appts || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar agenda");
    } finally { setIsLoading(false); }
  };

  const submit = async () => {
    if (!user) return;
    if (!form.customer_id) return toast.error("Selecione um cliente");
    if (!form.title.trim()) return toast.error("Informe um título");
    try {
      const start = new Date(`${form.date}T${form.time}`);
      const end = new Date(start.getTime() + form.duration * 60000);
      const payload = {
        franchisee_id: user.id,
        customer_id: form.customer_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        location: form.location.trim() || null,
        status: "scheduled" as const,
      };
      if (editing) {
        const { error } = await supabase.from("appointments").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Agendamento atualizado");
      } else {
        const { error } = await supabase.from("appointments").insert(payload);
        if (error) throw error;
        toast.success("Agendamento criado");
      }
      setIsModalOpen(false);
      setEditing(null);
      setForm({ customer_id: "", title: "", description: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00", duration: 60, location: "" });
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar agendamento");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir agendamento?")) return;
    try { await supabase.from("appointments").delete().eq("id", id); toast.success("Agendamento excluído"); await loadData(); } catch { toast.error("Erro ao excluir"); }
  };

  const statusColor = (s: string) => s === "completed" ? "bg-green-500" : s === "canceled" ? "bg-red-500" : "bg-blue-500";
  const statusLabel = (s: string) => s === "completed" ? "Concluído" : s === "canceled" ? "Cancelado" : "Agendado";

  return (
    <DashboardLayout title="Agenda">
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })}</h2>
            <p className="text-muted-foreground">{appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => { setEditing(null); setIsModalOpen(true); }}>Novo Agendamento</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Calendário</CardTitle></CardHeader>
            <CardContent>
              <CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={ptBR} className="rounded-md border" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Agendamentos do Dia</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : appointments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">Nenhum agendamento para hoje</p>
                  <p className="text-sm">Clique em "Novo Agendamento" para criar um</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-2 ${statusColor(a.status)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{a.title}</h4>
                          <Badge variant="outline" className="text-xs">{statusLabel(a.status)}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>{a.customer?.business_name || a.customer?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(a.start_time), "HH:mm")} - {format(new Date(a.end_time), "HH:mm")}</span>
                          </div>
                          {a.location && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{a.location}</span>
                            </div>
                          )}
                        </div>
                        {a.description && (<p className="text-sm text-muted-foreground mt-2">{a.description}</p>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditing(a); setForm({ customer_id: a.customer_id, title: a.title, description: a.description || "", date: format(new Date(a.start_time), "yyyy-MM-dd"), time: format(new Date(a.start_time), "HH:mm"), duration: Math.round((new Date(a.end_time).getTime() - new Date(a.start_time).getTime())/60000), location: a.location || "" }); setIsModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => del(a.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              <DialogDescription>{editing ? "Atualize as informações do agendamento" : "Crie um novo agendamento para seus clientes"}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm((p) => ({ ...p, customer_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.business_name || c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Consulta" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Select value={String(form.duration)} onValueChange={(v) => setForm((p) => ({ ...p, duration: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Local (opcional)</Label>
                <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Ex: Online / Presencial" />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancelar</Button>
              <Button onClick={submit}>{editing ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

