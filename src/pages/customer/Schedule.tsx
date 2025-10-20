import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Calendar, User } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  franchisee_id: string;
  franchisee?: { name: string; email: string };
  status: "scheduled" | "completed" | "canceled";
}

export default function CustomerSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_franchisee_id_fkey (
            name,
            email
          )
        `)
        .eq("customer_id", user.id)
        .gte("start_time", startOfDay)
        .lte("start_time", endOfDay)
        .order("start_time", { ascending: true });
      setAppointments((data as any) || []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      toast.error("Erro ao carregar agenda");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "canceled":
        return "Cancelado";
      default:
        return "Agendado";
    }
  };

  return (
    <DashboardLayout title="Minha Agenda">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground">
              {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Info agenda nativa */}
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-800">Agenda nativa</strong>
            <br />
            Seus agendamentos agora são gerenciados 100% dentro da plataforma.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Lista de agendamentos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Meus Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">Nenhum agendamento para hoje</p>
                  <p className="text-sm">Entre em contato com seu franqueado para agendar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start space-x-3 p-4 border rounded-lg"
                    >
                      <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(appointment.status)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{appointment.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>Com: {appointment.franchisee?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
                            </span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                        </div>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

