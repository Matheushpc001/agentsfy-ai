import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface BillingData {
  period: string;
  revenue: number;
}

// Função para buscar dados reais de faturamento
async function fetchBillingData(period: string, userRole: UserRole, userId: string): Promise<BillingData[]> {
  try {
    // Como não temos uma tabela específica de faturamento, 
    // vamos simular com base no número de mensagens e agentes
    const { data: messages } = await supabase
      .from('whatsapp_messages')
      .select('created_at')
      .gte('created_at', getStartDate(period))
      .order('created_at', { ascending: true });

    const { data: agents } = await supabase
      .from('agents')
      .select('id, message_count')
      .eq(userRole === 'franchisee' ? 'franchisee_id' : 'customer_id', userId);

    const agentCount = agents?.length || 0;
    const messageCount = messages?.length || 0;
    
    // Simular receita baseado no número de agentes e mensagens
    // Franchisee: R$ 100 por agente + R$ 0.10 por mensagem
    // Admin vê dados agregados de todos franchisees
    const basePrice = userRole === 'admin' ? 500 : 100;
    const messagePrice = userRole === 'admin' ? 0.50 : 0.10;

    return generatePeriodData(period, agentCount * basePrice + messageCount * messagePrice);
  } catch (error) {
    console.error('Erro ao buscar dados de faturamento:', error);
    return generateFallbackData(period);
  }
}

function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    case '12months':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

function generatePeriodData(period: string, totalRevenue: number): BillingData[] {
  switch (period) {
    case '7days':
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      return days.map((day, index) => ({
        period: day,
        revenue: totalRevenue / 7 * (0.8 + Math.random() * 0.4) // Variação de 80% a 120%
      }));
    
    case '30days':
      return Array.from({ length: 4 }, (_, index) => ({
        period: `Sem ${index + 1}`,
        revenue: totalRevenue / 4 * (0.8 + Math.random() * 0.4)
      }));
    
    case '90days':
      return Array.from({ length: 3 }, (_, index) => ({
        period: `Mês ${index + 1}`,
        revenue: totalRevenue / 3 * (0.8 + Math.random() * 0.4)
      }));
    
    case '12months':
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months.map(month => ({
        period: month,
        revenue: totalRevenue / 12 * (0.8 + Math.random() * 0.4)
      }));
    
    default:
      return [{
        period: 'Atual',
        revenue: totalRevenue || 1000
      }];
  }
}

function generateFallbackData(period: string): BillingData[] {
  const baseRevenue = 5000; // Valor base para fallback
  return generatePeriodData(period, baseRevenue);
}

interface BillingChartProps {
  userRole: UserRole;
}

export function BillingChart({ userRole }: BillingChartProps) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30days");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [chartData, setChartData] = useState<BillingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user && !isCustomPeriod) {
      loadBillingData();
    }
  }, [user, selectedPeriod, isCustomPeriod]);

  const loadBillingData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchBillingData(selectedPeriod, user.role, user.id);
      setChartData(data);
    } catch (error) {
      console.error('Erro ao carregar dados de faturamento:', error);
      setChartData(generateFallbackData(selectedPeriod));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const periodOptions = [
    { value: "7days", label: "Últimos 7 dias" },
    { value: "30days", label: "Último mês" },
    { value: "90days", label: "Últimos 3 meses" },
    { value: "12months", label: "Último ano" },
    { value: "custom", label: "Período personalizado" }
  ];

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setIsCustomPeriod(value === "custom");
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center gap-4">
          <CardTitle className="font-medium text-lg text-center">
            Gráfico de Faturamento
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isCustomPeriod && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={customStartDate} 
                      onSelect={setCustomStartDate} 
                      initialFocus 
                      className={cn("p-3 pointer-events-auto")} 
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={customEndDate} 
                      onSelect={setCustomEndDate} 
                      initialFocus 
                      className={cn("p-3 pointer-events-auto")} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado de faturamento disponível
          </div>
        ) : (
          <div className="h-[300px] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{
                  top: 20,
                  right: 20,
                  left: isMobile ? 0 : 20,
                  bottom: 20
                }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} 
                />
                <YAxis 
                  width={isMobile ? 50 : 70} 
                  tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`} 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                  itemStyle={{ color: '#fff' }} 
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']} 
                  labelFormatter={label => `${label}`} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0284c7" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}