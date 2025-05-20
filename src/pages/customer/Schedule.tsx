
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, User, Phone, MessageSquare } from "lucide-react";
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

// Interface for appointments
interface Appointment {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: number; // em minutos
  notes?: string;
  agentId: string;
  status: "scheduled" | "completed" | "canceled";
  isReminded: boolean;
}

// Mock data for testing
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt1",
    title: "Reunião sobre novo projeto",
    clientName: "Carlos Santos",
    clientPhone: "+5511998887777",
    date: new Date().toISOString(),
    time: "14:30",
    duration: 30,
    notes: "Apresentação inicial do projeto e discussão de objetivos",
    agentId: "agent1",
    status: "scheduled",
    isReminded: true
  },
  {
    id: "apt2",
    title: "Demo do produto",
    clientName: "Maria Oliveira",
    clientPhone: "+5511997776666",
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days ahead
    time: "10:00",
    duration: 45,
    notes: "Mostrar novos recursos do sistema",
    agentId: "agent1",
    status: "scheduled",
    isReminded: false
  },
  {
    id: "apt3",
    title: "Treinamento da equipe",
    clientName: "João Silva",
    clientPhone: "+5511996665555",
    date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    time: "16:00",
    duration: 60,
    agentId: "agent1",
    status: "completed",
    isReminded: true
  },
  {
    id: "apt4",
    title: "Reunião cancelada",
    clientName: "Ana Ferreira",
    clientPhone: "+5511995554444",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    time: "09:30",
    duration: 30,
    agentId: "agent1",
    status: "canceled",
    isReminded: false
  }
];

// Available time slots
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Duration options
const DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora e 30 minutos" },
  { value: 120, label: "2 horas" },
];

export default function CustomerSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: new Date().toISOString(),
    time: "14:00",
    duration: 30,
    status: "scheduled",
    agentId: "agent1",
    isReminded: false
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
    }).sort((a, b) => {
      // Sort by time
      return a.time.localeCompare(b.time);
    });
  };

  const handleCreateAppointment = () => {
    const appointmentId = `apt${Date.now()}`;
    
    const newApt: Appointment = {
      id: appointmentId,
      title: newAppointment.title || "",
      clientName: newAppointment.clientName || "",
      clientPhone: newAppointment.clientPhone || "",
      date: date ? date.toISOString() : new Date().toISOString(),
      time: newAppointment.time || "09:00",
      duration: newAppointment.duration || 30,
      notes: newAppointment.notes,
      agentId: newAppointment.agentId || "agent1",
      status: "scheduled",
      isReminded: false
    };
    
    setAppointments([...appointments, newApt]);
    setIsCreateModalOpen(false);
    setNewAppointment({
      date: new Date().toISOString(),
      time: "14:00",
      duration: 30,
      status: "scheduled",
      agentId: "agent1",
      isReminded: false
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

  const handleSendReminder = (id: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, isReminded: true } : apt
    ));
    toast.success("Lembrete enviado com sucesso!");
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

  const getAppointmentStatusBadge = (status: Appointment["status"], isReminded: boolean) => {
    switch (status) {
      case "scheduled":
        return (
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agendado</Badge>
            {isReminded && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                Lembrete enviado
              </Badge>
            )}
          </div>
        );
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return null;
    }
  };

  // Count appointments by status for statistics
  const getAppointmentStats = () => {
    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(apt => apt.status === "scheduled").length,
      completed: appointments.filter(apt => apt.status === "completed").length,
      canceled: appointments.filter(apt => apt.status === "canceled").length
    };
    return stats;
  };

  const stats = getAppointmentStats();

  return (
    <DashboardLayout title="Agenda">
      <div className="space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total</p>
                <span className="text-lg font-semibold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Agendados</p>
                <span className="text-lg font-semibold text-blue-600">{stats.scheduled}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <span className="text-lg font-semibold text-green-600">{stats.completed}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <span className="text-lg font-semibold text-red-600">{stats.canceled}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar and new appointment button */}
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

          {/* Appointments list for selected day */}
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
                        appointment.status === "canceled" ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" : "hover:border-primary/50",
                        appointment.status === "completed" ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30" : ""
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
                              <span>{appointment.clientName}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {getAppointmentStatusBadge(appointment.status, appointment.isReminded)}
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
      </div>

      {/* Modal for creating new appointment */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
            <DialogDescription>
              Agende um novo compromisso
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
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input 
                id="clientName" 
                placeholder="Nome do cliente"
                value={newAppointment.clientName || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Telefone do Cliente</Label>
              <Input 
                id="clientPhone" 
                placeholder="+55 (00) 00000-0000"
                value={newAppointment.clientPhone || ""}
                onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
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

      {/* Modal for viewing/editing appointment */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          {currentAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{currentAppointment.title}</DialogTitle>
                  {getAppointmentStatusBadge(currentAppointment.status, currentAppointment.isReminded)}
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
                  <p>{currentAppointment.clientName}</p>
                </div>
    
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{currentAppointment.clientPhone}</p>
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
                      className="border-red-300 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20" 
                      onClick={() => handleCancelAppointment(currentAppointment.id)}
                    >
                      Cancelar Compromisso
                    </Button>
                    
                    {!currentAppointment.isReminded && (
                      <Button 
                        variant="outline" 
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => handleSendReminder(currentAppointment.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Enviar Lembrete
                      </Button>
                    )}
                    
                    <Button onClick={() => handleCompleteAppointment(currentAppointment.id)}>
                      Concluir
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
