import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Plus, User, Settings, ExternalLink, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interfaces
interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  franchisee_id: string;
  franchisee?: {
    name: string;
    email: string;
  };
  google_event_id?: string;
  status: "scheduled" | "completed" | "canceled";
}

interface GoogleCalendarConfig {
  id: string;
  franchisee_id: string;
  google_calendar_id?: string;
  is_active: boolean;
}

export default function CustomerSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleCalendarId, setGoogleCalendarId] = useState("");
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newGoogleConfig, setNewGoogleConfig] = useState({
    google_calendar_id: "primary",
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDate]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Carregar agendamentos que são para este cliente
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_franchisee_id_fkey (
            name,
            email
          )
        `)
        .eq('customer_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      setAppointments(appointmentsData || []);

      // Verificar se já tem configuração do Google Calendar
      const { data: configData } = await supabase
        .from('google_calendar_configs')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_active', true)
        .single();

      if (configData) {
        setIsGoogleConnected(true);
        setGoogleCalendarId(configData.google_calendar_id || "primary");
      }

      // Verificar se tem token do Google salvo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('google_calendar_token')
        .eq('id', user.id)
        .single();
      
      setIsGoogleConnected(!!profileData?.google_calendar_token);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogleCalendar = () => {
    // Simulação da conexão - em produção seria OAuth real
    toast.info('Para conectar ao Google Calendar, você precisará configurar as credenciais OAuth.');
    
    if (window.confirm('Simular conexão com seu Google Calendar para teste?')) {
      setIsGoogleConnected(true);
      toast.success('Conectado ao seu Google Calendar (modo simulação)');
      saveGoogleConfig();
    }
  };

  const saveGoogleConfig = async () => {
    if (!user) return;

    try {
      // Salvar configuração do Google Calendar para este cliente
      const { error } = await supabase
        .from('google_calendar_configs')
        .upsert({
          franchisee_id: user.franchisee_id, // ID do franqueado que atende este cliente
          customer_id: user.id, // ID do cliente atual
          google_calendar_id: newGoogleConfig.google_calendar_id,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Configuração do Google Calendar salva!');
      setIsConnectModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Deseja desconectar do Google Calendar?')) return;

    try {
      // Desativar configurações do Google Calendar
      await supabase
        .from('google_calendar_configs')
        .update({ is_active: false })
        .eq('customer_id', user?.id);

      // Remover token do perfil
      await supabase
        .from('profiles')
        .update({ 
          google_calendar_token: null,
          google_calendar_refresh_token: null,
          google_calendar_email: null 
        })
        .eq('id', user?.id);

      setIsGoogleConnected(false);
      toast.success('Desconectado do Google Calendar');
      await loadData();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  return (
    <DashboardLayout title="Minha Agenda">
      <div className="space-y-6">
        {/* Header com status de conexão */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground">
              {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isGoogleConnected ? (
              <Button onClick={() => setIsConnectModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Conectar Google Calendar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Google Calendar Conectado
                </Badge>
                <Button variant="outline" size="sm" onClick={handleDisconnectGoogle}>
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Alert explicativo */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Conecte seu Google Calendar para que seus agendamentos com franqueados sejam automaticamente sincronizados com sua agenda pessoal.
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                      {appointment.google_event_id && (
                        <Button variant="ghost" size="sm" title="Ver no Google Calendar">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para conectar Google Calendar */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Google Calendar</DialogTitle>
            <DialogDescription>
              Sincronize seus agendamentos com seu Google Calendar pessoal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seus agendamentos serão automaticamente adicionados ao seu Google Calendar quando criados pelo franqueado.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="calendar-id">Google Calendar (opcional)</Label>
              <Input
                id="calendar-id"
                value={newGoogleConfig.google_calendar_id}
                onChange={(e) => setNewGoogleConfig(prev => ({ ...prev, google_calendar_id: e.target.value }))}
                placeholder="primary"
              />
              <p className="text-xs text-muted-foreground">
                Deixe "primary" para usar seu calendário principal, ou insira o ID de um calendário específico
              </p>
            </div>

            <div className="text-center py-4">
              <Button onClick={handleConnectGoogleCalendar} className="w-full bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Conectar com Google Calendar
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}