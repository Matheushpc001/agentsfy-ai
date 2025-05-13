
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Tipos para o sistema de agendamento
interface Appointment {
  id: string;
  title: string;
  customerName: string;
  contactPhone: string;
  date: string;
  time: string;
  duration: number; // em minutos
  notes?: string;
  agentId: string;
  status: "scheduled" | "completed" | "canceled";
}

// Dados de exemplo
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt1",
    title: "Reunião de Apresentação",
    customerName: "João Silva",
    contactPhone: "+5511999990001",
    date: new Date().toISOString(),
    time: "14:00",
    duration: 30,
    notes: "Cliente interessado em implementar agente para setor de atendimento",
    agentId: "agent1",
    status: "scheduled",
  },
  {
    id: "apt2",
    title: "Demonstração de Produto",
    customerName: "Maria Oliveira",
    contactPhone: "+5511999990002",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    time: "10:30",
    duration: 45,
    notes: "Preparar demo do agente de vendas",
    agentId: "agent2",
    status: "scheduled",
  },
  {
    id: "apt3",
    title: "Suporte Técnico",
    customerName: "Carlos Pereira",
    contactPhone: "+5511999990003",
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    time: "16:15",
    duration: 60,
    agentId: "agent3",
    status: "completed",
  }
];

// Lista de horários disponíveis para agendamento
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Lista de durações de compromisso
const DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora e 30 minutos" },
  { value: 120, label: "2 horas" },
];

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: new Date().toISOString(),
    time: "14:00",
    duration: 30,
    status: "scheduled",
    agentId: "agent1"
  });
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const isMobile = useIsMobile();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const getDayAppointments = () => {
    if (!date) return [];
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const handleCreateAppointment = () => {
    const appointmentId = `apt${Date.now()}`;
    
    const newApt: Appointment = {
      id: appointmentId,
      title: newAppointment.title || "",
      customerName: newAppointment.customerName || "",
      contactPhone: newAppointment.contactPhone || "",
      date: date ? date.toISOString() : new Date().toISOString(),
      time: newAppointment.time || "09:00",
      duration: newAppointment.duration || 30,
      notes: newAppointment.notes,
      agentId: newAppointment.agentId || "agent1",
      status: "scheduled"
    };
    
    setAppointments([...appointments, newApt]);
    setIsCreateModalOpen(false);
    setNewAppointment({
      date: new Date().toISOString(),
      time: "14:00",
      duration: 30,
      status: "scheduled",
      agentId: "agent1"
    });
    
    toast.success("Compromisso agendado com sucesso!");
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: "canceled" as const } : apt
    ));
    setIsViewModalOpen(false);
    toast.info("Compromisso cancelado com sucesso!");
  };

  const handleCompleteAppointment = (id: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: "completed" as const } : apt
    ));
    setIsViewModalOpen(false);
    toast.success("Compromisso marcado como concluído!");
  };

  const viewAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  const dayAppointments = getDayAppointments();

  const getAppointmentStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agendado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Agenda">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário e botão de novo compromisso */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              <span>Calendário</span>
              <Button 
                size="sm" 
                onClick={() => setIsCreateModalOpen(true)} 
                className="h-8"
              >
                <Plus className="mr-1 h-4 w-4" /> Novo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className={cn("p-3 pointer-events-auto w-full")}
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground"
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de compromissos do dia selecionado */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              {date ? `Compromissos: ${format(date, "dd/MM/yyyy")}` : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayAppointments.length > 0 ? (
              <div className="space-y-4">
                {dayAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      appointment.status === "canceled" ? "bg-gray-50 border-gray-200" : "hover:border-primary/50",
                      appointment.status === "completed" ? "bg-green-50 border-green-100" : ""
                    )}
                    onClick={() => viewAppointment(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{appointment.time} ({appointment.duration} min)</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <User className="h-3.5 w-3.5 mr-1" />
                            <span>{appointment.customerName}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {getAppointmentStatusBadge(appointment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Calendar className="h-12 w-12 stroke-1 mb-2 opacity-30" />
                <p>Nenhum compromisso para esta data</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2"
                >
                  Adicionar compromisso
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de criação de compromisso */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
            <DialogDescription>
              Crie um novo compromisso na agenda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Reunião de apresentação"
                value={newAppointment.title || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Select 
                  value={newAppointment.time || "14:00"}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duração</Label>
              <Select 
                value={String(newAppointment.duration || "30")}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((duration) => (
                    <SelectItem key={duration.value} value={String(duration.value)}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer">Nome do Cliente</Label>
              <Input 
                id="customer" 
                placeholder="Nome do cliente"
                value={newAppointment.customerName || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input 
                id="phone" 
                placeholder="+55 (00) 00000-0000"
                value={newAppointment.contactPhone || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, contactPhone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Adicione notas ou observações sobre o compromisso"
                rows={3}
                value={newAppointment.notes || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment}>
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização/edição de compromisso */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          {currentAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{currentAppointment.title}</DialogTitle>
                  {getAppointmentStatusBadge(currentAppointment.status)}
                </div>
              </DialogHeader>
    
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data</p>
                    <p>{formatAppointmentDate(currentAppointment.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Horário</p>
                    <p>{currentAppointment.time} ({currentAppointment.duration} min)</p>
                  </div>
                </div>
    
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p>{currentAppointment.customerName}</p>
                </div>
    
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contato</p>
                  <p>{currentAppointment.contactPhone}</p>
                </div>
    
                {currentAppointment.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{currentAppointment.notes}</p>
                  </div>
                )}
              </div>
    
              <DialogFooter>
                {currentAppointment.status === "scheduled" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-300 hover:bg-red-50 text-red-600" 
                      onClick={() => handleCancelAppointment(currentAppointment.id)}
                    >
                      Cancelar Compromisso
                    </Button>
                    <Button onClick={() => handleCompleteAppointment(currentAppointment.id)}>
                      Marcar como Concluído
                    </Button>
                  </>
                )}
                
                {currentAppointment.status !== "scheduled" && (
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Fechar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
