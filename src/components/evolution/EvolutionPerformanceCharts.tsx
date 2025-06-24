
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PerformanceChartsProps {
  franchiseeId: string;
}

interface ChartData {
  messagesOverTime: Array<{ time: string; messages: number; responses: number }>;
  responseTimeData: Array<{ time: string; avgTime: number; maxTime: number }>;
  modelUsage: Array<{ model: string; count: number; percentage: number }>;
  hourlyActivity: Array<{ hour: string; messages: number; conversations: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EvolutionPerformanceCharts({ franchiseeId }: PerformanceChartsProps) {
  const [chartData, setChartData] = useState<ChartData>({
    messagesOverTime: [],
    responseTimeData: [],
    modelUsage: [],
    hourlyActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  useEffect(() => {
    if (!franchiseeId) return;
    loadChartData();
  }, [franchiseeId, selectedPeriod]);

  const loadChartData = async () => {
    setIsLoading(true);
    try {
      // Simular dados de performance por enquanto
      // Na implementação real, estes dados viriam do banco
      
      // Mensagens ao longo do tempo
      const messagesOverTime = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        messages: Math.floor(Math.random() * 50) + 10,
        responses: Math.floor(Math.random() * 40) + 5
      }));

      // Tempo de resposta
      const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        avgTime: Math.random() * 3 + 1,
        maxTime: Math.random() * 5 + 2
      }));

      // Uso de modelos
      const modelUsage = [
        { model: 'gpt-4o-mini', count: 450, percentage: 65 },
        { model: 'gpt-4o', count: 180, percentage: 26 },
        { model: 'gpt-3.5-turbo', count: 62, percentage: 9 }
      ];

      // Atividade por hora
      const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        messages: Math.floor(Math.random() * 30) + 5,
        conversations: Math.floor(Math.random() * 15) + 2
      }));

      setChartData({
        messagesOverTime,
        responseTimeData,
        modelUsage,
        hourlyActivity
      });

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={loadChartData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume de Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Volume de Mensagens
            </CardTitle>
            <CardDescription>
              Mensagens e respostas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.messagesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="messages" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="responses" 
                    stackId="2"
                    stroke="#82ca9d" 
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tempo de Resposta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tempo de Resposta
            </CardTitle>
            <CardDescription>
              Performance de resposta dos agentes IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}s`, '']} />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Tempo Médio"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxTime" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Tempo Máximo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Uso de Modelos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Uso de Modelos IA
            </CardTitle>
            <CardDescription>
              Distribuição de uso dos modelos de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.modelUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model, percentage }) => `${model}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Atividade por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade por Hora
            </CardTitle>
            <CardDescription>
              Picos de atividade ao longo do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#8884d8" name="Mensagens" />
                  <Bar dataKey="conversations" fill="#82ca9d" name="Conversas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Throughput Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(chartData.messagesOverTime.reduce((acc, curr) => acc + curr.messages, 0) / chartData.messagesOverTime.length)}
              </div>
              <div className="text-sm text-muted-foreground">msg/h</div>
              <Badge variant="secondary" className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.2%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Resposta Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                {(chartData.responseTimeData.reduce((acc, curr) => acc + curr.avgTime, 0) / chartData.responseTimeData.length).toFixed(1)}s
              </div>
              <Badge variant="secondary" className="ml-auto">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                99.8%
              </div>
              <Badge variant="secondary" className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.3%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
