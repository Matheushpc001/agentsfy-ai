import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Plus, User, X, Settings, ExternalLink, Calendar, Edit, Trash2, CheckCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Tipos para o sistema de agendamento
interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  customer_id: string;
  customer?: {
    name: string;
    business_name: string;
    email: string;
  };
  google_event_id?: string;
  status: "scheduled" | "completed" | "canceled";
}

interface Customer {
  id: string;
  name: string;
  business_name: string;
  email: string;
}

interface GoogleCalendarConfig {
  id: string;
  customer_id: string;
  google_calendar_id?: string;
  is_active: boolean;
}

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const isMobile = useIsMobile();

  const [newAppointment, setNewAppointment] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    duration: 60,
    location: "",
    customer_id: "",
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
      
      // Carregar customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('franchisee_id', user.id);
      
      setCustomers(customersData || []);

      // Carregar agendamentos do sistema
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            name,
            business_name,
            email
          )
        `)
        .eq('franchisee_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      setAppointments(appointmentsData || []);

      // Verificar conexão Google Calendar
      const { data: profileData } = await supabase
        .from('profiles')
        .select('google_calendar_token')
        .eq('id', user.id)
        .single();
      
      const connected = !!profileData?.google_calendar_token;
      setIsGoogleConnected(connected);
      
      // Se conectado, carregar eventos do Google Calendar
      if (connected) {
        await loadGoogleEvents(profileData.google_calendar_token, startOfDay, endOfDay);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleEvents = async (token: string, startDate: string, endDate: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(startDate)}&` +
        `timeMax=${encodeURIComponent(endDate)}&` +
        `singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGoogleEvents(data.items || []);
      } else {
        console.log('Erro ao carregar eventos do Google:', response.status);
        setGoogleEvents([]);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do Google:', error);
      setGoogleEvents([]);
    }
  };

  const handleCreateAppointment = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!newAppointment.customer_id) {
      toast.error('Por favor, selecione um cliente');
      return;
    }

    if (!newAppointment.title.trim()) {
      toast.error('Por favor, insira um título para o agendamento');
      return;
    }

    if (!newAppointment.date || !newAppointment.time) {
      toast.error('Por favor, defina data e horário');
      return;
    }

    try {
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + newAppointment.duration * 60000);

      // Verificar se a data não é no passado
      if (startDateTime < new Date()) {
        toast.error('Não é possível criar agendamentos no passado');
        return;
      }

      // Criar agendamento no banco
      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .insert({
          franchisee_id: user.id,
          customer_id: newAppointment.customer_id,
          title: newAppointment.title.trim(),
          description: newAppointment.description.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: newAppointment.location.trim() || null,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        throw error;
      }

      // Tentar sincronizar com Google Calendar do franqueado
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('google_calendar_token, google_calendar_refresh_token')
          .eq('id', user.id)
          .single();

        if (profileData?.google_calendar_token) {
          const selectedCustomer = customers.find(c => c.id === newAppointment.customer_id);
          
          const eventPayload = {
            summary: newAppointment.title,
            description: `Cliente: ${selectedCustomer?.business_name || selectedCustomer?.name || 'N/A'}\n\n${newAppointment.description || ''}`,
            location: newAppointment.location || '',
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: 'America/Sao_Paulo',
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: 'America/Sao_Paulo',
            },
            attendees: selectedCustomer?.email ? [{ email: selectedCustomer.email }] : [],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 15 },
              ],
            },
          };

          const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${profileData.google_calendar_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventPayload),
            }
          );

          if (response.ok) {
            const eventResult = await response.json();
            
            // Atualizar agendamento com ID do evento do Google
            await supabase
              .from('appointments')
              .update({ google_event_id: eventResult.id })
              .eq('id', appointmentData.id);

            toast.success('🎉 Agendamento criado e sincronizado com seu Google Calendar!');
          } else if (response.status === 401 && profileData.google_calendar_refresh_token) {
            // Token expirado, tentar refresh
            const newToken = await refreshGoogleToken(profileData.google_calendar_refresh_token);
            if (newToken) {
              // Tentar novamente com novo token
              const retryResponse = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(eventPayload),
                }
              );

              if (retryResponse.ok) {
                const eventResult = await retryResponse.json();
                await supabase
                  .from('appointments')
                  .update({ google_event_id: eventResult.id })
                  .eq('id', appointmentData.id);
                toast.success('🎉 Agendamento criado e sincronizado com seu Google Calendar!');
              } else {
                toast.success('Agendamento criado! (Erro na sincronização com Google Calendar)');
              }
            } else {
              toast.success('Agendamento criado! (Reconecte seu Google Calendar para sincronização)');
            }
          } else {
            const errorText = await response.text();
            console.error('Erro na sincronização:', errorText);
            toast.success('Agendamento criado! (Erro na sincronização com Google Calendar)');
          }
        } else {
          toast.success('Agendamento criado com sucesso!');
        }
      } catch (syncError) {
        console.warn('Erro na sincronização com Google Calendar:', syncError);
        toast.success('Agendamento criado com sucesso!');
      }

      setIsAppointmentModalOpen(false);
      setNewAppointment({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        duration: 60,
        location: "",
        customer_id: "",
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento. Verifique se todos os campos estão preenchidos corretamente.');
    }
  };

  const handleGoogleCalendarAuth = async () => {
    const clientId = '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
    
    // Usar redirect_uri local para desenvolvimento
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/oauth/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(JSON.stringify({ userId: user?.id }))}`;

    // Abrir janela de autorização
    window.open(authUrl, 'google-auth', 'width=600,height=700');
    
    // Mostrar modal para colar código
    setShowGoogleAuth(true);
  };

  const refreshGoogleToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const clientId = '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
      const clientSecret = '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';

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        console.error('Erro ao renovar token:', await response.text());
        return null;
      }

      const tokenData = await response.json();
      
      if (tokenData.access_token && user) {
        // Salvar novo token
        await supabase
          .from('profiles')
          .update({ 
            google_calendar_token: tokenData.access_token,
            google_calendar_refresh_token: tokenData.refresh_token || refreshToken
          })
          .eq('id', user.id);
        
        return tokenData.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao renovar token Google:', error);
      return null;
    }
  };

  const handleAuthCodeSubmit = async (code: string) => {
    if (!user || !code.trim()) {
      toast.error('Código de autorização obrigatório');
      return;
    }

    try {
      const clientId = '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
      const clientSecret = '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';
      
      // Trocar código por tokens
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}/oauth/callback`;
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code.trim(),
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do Google: ${response.status} - ${errorText}`);
      }

      const tokens = await response.json();
      
      // Salvar tokens no perfil do franqueado (SUA conta)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          google_calendar_token: tokens.access_token,
          google_calendar_refresh_token: tokens.refresh_token,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('✅ Seu Google Calendar foi conectado com sucesso!');
      setShowGoogleAuth(false);
      await loadData();

    } catch (error: any) {
      console.error('Erro na conexão:', error);
      toast.error('Erro ao conectar: ' + (error.message || 'Erro desconhecido'));
    }
  };


  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || "",
      date: format(new Date(appointment.start_time), "yyyy-MM-dd"),
      time: format(new Date(appointment.start_time), "HH:mm"),
      duration: Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 60000),
      location: appointment.location || "",
      customer_id: appointment.customer_id,
    });
    setIsAppointmentModalOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!user || !editingAppointment) {
      toast.error('Erro interno');
      return;
    }

    if (!newAppointment.customer_id) {
      toast.error('Por favor, selecione um cliente');
      return;
    }

    if (!newAppointment.title.trim()) {
      toast.error('Por favor, insira um título para o agendamento');
      return;
    }

    try {
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + newAppointment.duration * 60000);

      const { error } = await supabase
        .from('appointments')
        .update({
          title: newAppointment.title.trim(),
          description: newAppointment.description.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: newAppointment.location.trim() || null,
          customer_id: newAppointment.customer_id
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      // Tentar sincronizar atualização com Google Calendar
      try {
        if (editingAppointment.google_event_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('google_calendar_token, google_calendar_refresh_token')
            .eq('id', user.id)
            .single();

          if (profileData?.google_calendar_token) {
            const selectedCustomer = customers.find(c => c.id === newAppointment.customer_id);
            
            const eventPayload = {
              summary: newAppointment.title.trim(),
              description: `Cliente: ${selectedCustomer?.business_name || selectedCustomer?.name || 'N/A'}\n\n${newAppointment.description || ''}`,
              location: newAppointment.location?.trim() || '',
              start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
              },
              end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
              },
              attendees: selectedCustomer?.email ? [{ email: selectedCustomer.email }] : [],
            };

            let token = profileData.google_calendar_token;
            let response = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingAppointment.google_event_id}`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventPayload),
              }
            );

            // Se token expirou, tentar refresh
            if (response.status === 401 && profileData.google_calendar_refresh_token) {
              const newToken = await refreshGoogleToken(profileData.google_calendar_refresh_token);
              if (newToken) {
                response = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingAppointment.google_event_id}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${newToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventPayload),
                  }
                );
              }
            }

            if (response.ok) {
              toast.success('🎉 Agendamento atualizado e sincronizado com Google Calendar!');
            } else {
              toast.success('Agendamento atualizado! (Erro na sincronização com Google Calendar)');
            }
          } else {
            toast.success('Agendamento atualizado com sucesso!');
          }
        } else {
          toast.success('Agendamento atualizado com sucesso!');
        }
      } catch (syncError) {
        console.warn('Erro na sincronização com Google Calendar:', syncError);
        toast.success('Agendamento atualizado com sucesso!');
      }

      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
      setNewAppointment({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        duration: 60,
        location: "",
        customer_id: "",
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      // Buscar informações do agendamento antes de excluir
      const { data: appointment } = await supabase
        .from('appointments')
        .select('google_event_id')
        .eq('id', appointmentId)
        .single();

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      // Tentar excluir do Google Calendar se existir
      try {
        if (appointment?.google_event_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('google_calendar_token, google_calendar_refresh_token')
            .eq('id', user?.id)
            .single();

          if (profileData?.google_calendar_token) {
            let token = profileData.google_calendar_token;
            let response = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.google_event_id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            // Se token expirou, tentar refresh
            if (response.status === 401 && profileData.google_calendar_refresh_token) {
              const newToken = await refreshGoogleToken(profileData.google_calendar_refresh_token);
              if (newToken) {
                response = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.google_event_id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${newToken}`,
                    },
                  }
                );
              }
            }

            if (response.ok) {
              toast.success('🎉 Agendamento excluído e removido do Google Calendar!');
            } else {
              toast.success('Agendamento excluído! (Erro ao remover do Google Calendar)');
            }
          } else {
            toast.success('Agendamento excluído com sucesso!');
          }
        } else {
          toast.success('Agendamento excluído com sucesso!');
        }
      } catch (syncError) {
        console.warn('Erro na sincronização com Google Calendar:', syncError);
        toast.success('Agendamento excluído com sucesso!');
      }

      await loadData();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Agendamento marcado como concluído!');
      await loadData();
    } catch (error) {
      console.error('Erro ao completar agendamento:', error);
      toast.error('Erro ao completar agendamento');
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
    <DashboardLayout title="Agenda">
      <div className="space-y-6">
        {/* Header com botões */}
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
              <Button
                variant="outline"
                onClick={() => setShowGoogleAuth(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Conectar Google Calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Google Conectado
              </Button>
            )}
            
            <Button onClick={() => setIsAppointmentModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

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
              <CardTitle className="text-lg">Agendamentos do Dia</CardTitle>
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
                  <p className="text-sm">Clique em "Novo Agendamento" para criar um</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Eventos do Google Calendar */}
                  {googleEvents.map((event) => (
                    <div key={`google-${event.id}`} className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <Calendar className="w-4 h-4 mt-2 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate text-blue-800">{event.summary || 'Evento sem título'}</h4>
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            Google Calendar
                          </Badge>
                        </div>
                        <div className="text-sm text-blue-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {event.start?.dateTime ? 
                                `${format(new Date(event.start.dateTime), "HH:mm")} - ${format(new Date(event.end?.dateTime || event.start.dateTime), "HH:mm")}` :
                                'Dia inteiro'
                              }
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-blue-600 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Agendamentos do sistema */}
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
                            <span>{appointment.customer?.business_name || appointment.customer?.name}</span>
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
                      <div className="flex items-center gap-1">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              title="Marcar como concluído"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditAppointment(appointment)}
                              title="Editar agendamento"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          title="Excluir agendamento"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                        {appointment.google_event_id && (
                          <Button variant="ghost" size="sm" title="Ver no Google Calendar">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
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

      {/* Modal para novo agendamento */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Atualize as informações do agendamento' : 'Crie um novo agendamento para seus clientes'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select value={newAppointment.customer_id} onValueChange={(value) => 
                setNewAppointment(prev => ({ ...prev, customer_id: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_name || customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Reunião de apresentação"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select value={newAppointment.duration.toString()} onValueChange={(value) => 
                setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local (opcional)</Label>
              <Input
                id="location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Escritório, Online, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do agendamento..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setEditingAppointment(null);
                setNewAppointment({
                  title: "",
                  description: "",
                  date: format(new Date(), "yyyy-MM-dd"),
                  time: "09:00",
                  duration: 60,
                  location: "",
                  customer_id: "",
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}>
              {editingAppointment ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de autenticação Google simples */}
      <Dialog open={showGoogleAuth} onOpenChange={setShowGoogleAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Google Calendar</DialogTitle>
            <DialogDescription>
              Conecte SEU Google Calendar para sincronizar agendamentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong className="text-blue-800">Como funciona:</strong><br />
                1. Clique no link abaixo para autorizar<br />
                2. Copie o código que aparecer<br />
                3. Cole aqui e conecte
              </AlertDescription>
            </Alert>

            <div className="text-center py-4">
              <Button 
                onClick={handleGoogleCalendarAuth}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Abrir Autorização Google
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-code">Cole o código de autorização:</Label>
              <div className="flex gap-2">
                <Input
                  id="auth-code"
                  placeholder="Cole aqui o código do Google..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        handleAuthCodeSubmit(target.value);
                      }
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('auth-code') as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleAuthCodeSubmit(input.value);
                    } else {
                      toast.error('Cole o código de autorização primeiro');
                    }
                  }}
                >
                  Conectar
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoogleAuth(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para configuração do Google Calendar - REMOVIDO */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Google Calendar</DialogTitle>
            <DialogDescription>
              Configure a integração com Google Calendar para seus clientes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong className="text-blue-800">Como funciona a integração:</strong><br />
                • Você seleciona um cliente abaixo<br />
                • O cliente autoriza o Google Calendar dele<br />
                • Quando você criar agendamentos, eles aparecerão automaticamente no Google Calendar do cliente
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="google-customer-select">Selecione o Cliente</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha qual cliente conectar ao Google Calendar" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_name || customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <div className="text-center py-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Conectar Google Calendar</h4>
                <p className="text-sm text-blue-700 mb-4 max-w-sm mx-auto">
                  Este cliente precisa autorizar uma única vez. Depois, todos os agendamentos aparecerão automaticamente no Google Calendar dele.
                </p>
                <Button onClick={handleGoogleCalendarAuth} className="bg-blue-600 hover:bg-blue-700 px-8">
                  <Calendar className="w-4 h-4 mr-2" />
                  Iniciar Autorização Google
                </Button>
                <p className="text-xs text-blue-600 mt-3">
                  🔒 Seguro • Uma nova janela será aberta para o cliente autorizar
                </p>
              </div>
            )}
            
          </div>

          <DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}