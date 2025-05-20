
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

interface RevenueChartProps {
  data: Array<{
    month: string;
    value: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Faturamento</CardTitle>
        <CardDescription>
          Total faturado por mês (R$)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ChartContainer 
            config={{
              revenue: {
                color: "hsl(var(--chart-green))"
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data} 
                margin={{
                  top: 20,
                  right: 10,
                  left: isMobile ? 10 : 20,
                  bottom: 20
                }}
              >
                <XAxis 
                  dataKey="month" 
                  tick={{
                    fontSize: 12
                  }} 
                  tickLine={false} 
                  axisLine={false}
                  height={30}
                />
                <YAxis 
                  hide={isMobile} 
                  tickLine={false} 
                  axisLine={false}
                  width={30}
                />
                <Tooltip 
                  cursor={false} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p className="text-xs font-semibold">{`${payload[0].payload.month}`}</p>
                          <p className="text-sm">{`R$ ${payload[0].value.toLocaleString()}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  wrapperStyle={{ zIndex: 100 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#fff"
                  }} 
                  activeDot={{
                    r: 6,
                    strokeWidth: 2
                  }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
