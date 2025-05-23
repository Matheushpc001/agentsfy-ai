import { useState } from "react";
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

// Mock data for billing charts
const MOCK_BILLING_DATA = {
  "7days": [{
    period: "Seg",
    revenue: 1250.50
  }, {
    period: "Ter",
    revenue: 1876.25
  }, {
    period: "Qua",
    revenue: 2145.75
  }, {
    period: "Qui",
    revenue: 1987.30
  }, {
    period: "Sex",
    revenue: 2234.80
  }, {
    period: "Sáb",
    revenue: 1456.90
  }, {
    period: "Dom",
    revenue: 1123.45
  }],
  "30days": [{
    period: "Sem 1",
    revenue: 8750.30
  }, {
    period: "Sem 2",
    revenue: 12340.75
  }, {
    period: "Sem 3",
    revenue: 15670.20
  }, {
    period: "Sem 4",
    revenue: 18945.50
  }],
  "90days": [{
    period: "Mês 1",
    revenue: 45600.75
  }, {
    period: "Mês 2",
    revenue: 52340.20
  }, {
    period: "Mês 3",
    revenue: 48970.35
  }],
  "12months": [{
    period: "Jan",
    revenue: 35200.50
  }, {
    period: "Fev",
    revenue: 42300.75
  }, {
    period: "Mar",
    revenue: 48970.35
  }, {
    period: "Abr",
    revenue: 45600.75
  }, {
    period: "Mai",
    revenue: 52340.20
  }, {
    period: "Jun",
    revenue: 49850.60
  }, {
    period: "Jul",
    revenue: 55670.40
  }, {
    period: "Ago",
    revenue: 58920.15
  }, {
    period: "Set",
    revenue: 62145.80
  }, {
    period: "Out",
    revenue: 59340.25
  }, {
    period: "Nov",
    revenue: 61875.90
  }, {
    period: "Dez",
    revenue: 64320.50
  }]
};
const FRANCHISEE_BILLING_DATA = {
  "7days": [{
    period: "Seg",
    revenue: 156.30
  }, {
    period: "Ter",
    revenue: 234.50
  }, {
    period: "Qua",
    revenue: 287.75
  }, {
    period: "Qui",
    revenue: 198.40
  }, {
    period: "Sex",
    revenue: 345.20
  }, {
    period: "Sáb",
    revenue: 189.60
  }, {
    period: "Dom",
    revenue: 123.80
  }],
  "30days": [{
    period: "Sem 1",
    revenue: 1250.30
  }, {
    period: "Sem 2",
    revenue: 1540.75
  }, {
    period: "Sem 3",
    revenue: 1870.20
  }, {
    period: "Sem 4",
    revenue: 2145.50
  }],
  "90days": [{
    period: "Mês 1",
    revenue: 4800.50
  }, {
    period: "Mês 2",
    revenue: 5234.20
  }, {
    period: "Mês 3",
    revenue: 4970.35
  }],
  "12months": [{
    period: "Jan",
    revenue: 3520.50
  }, {
    period: "Fev",
    revenue: 4230.75
  }, {
    period: "Mar",
    revenue: 4897.35
  }, {
    period: "Abr",
    revenue: 4560.75
  }, {
    period: "Mai",
    revenue: 5234.20
  }, {
    period: "Jun",
    revenue: 4985.60
  }, {
    period: "Jul",
    revenue: 5567.40
  }, {
    period: "Ago",
    revenue: 5892.15
  }, {
    period: "Set",
    revenue: 6214.80
  }, {
    period: "Out",
    revenue: 5934.25
  }, {
    period: "Nov",
    revenue: 6187.90
  }, {
    period: "Dez",
    revenue: 6432.50
  }]
};
interface BillingChartProps {
  userRole: UserRole;
}
export function BillingChart({
  userRole
}: BillingChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30days");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const isMobile = useIsMobile();
  const isAdmin = userRole === "admin";
  const currentData = isAdmin ? MOCK_BILLING_DATA : FRANCHISEE_BILLING_DATA;
  const chartData = currentData[selectedPeriod as keyof typeof currentData] || currentData["30days"];
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };
  const periodOptions = [{
    value: "7days",
    label: "Últimos 7 dias"
  }, {
    value: "30days",
    label: "Último mês"
  }, {
    value: "90days",
    label: "Últimos 3 meses"
  }, {
    value: "12months",
    label: "Último ano"
  }, {
    value: "custom",
    label: "Período personalizado"
  }];
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setIsCustomPeriod(value === "custom");
  };
  return <Card className="lg:col-span-2">
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
                {periodOptions.map(option => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            
            {isCustomPeriod && <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !customStartDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !customEndDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{
            top: 20,
            right: 20,
            left: isMobile ? 0 : 20,
            bottom: 20
          }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="period" tick={{
              fontSize: 12
            }} tickLine={false} axisLine={{
              stroke: 'rgba(255,255,255,0.2)'
            }} />
              <YAxis width={isMobile ? 50 : 70} tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`} tick={{
              fontSize: 12
            }} tickLine={false} axisLine={{
              stroke: 'rgba(255,255,255,0.2)'
            }} />
              <Tooltip contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }} itemStyle={{
              color: '#fff'
            }} formatter={(value: number) => [formatCurrency(value), 'Faturamento']} labelFormatter={label => `${label}`} />
              <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>;
}
