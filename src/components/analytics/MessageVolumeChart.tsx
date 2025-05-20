
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageVolumeChartProps {
  data: Array<{
    day: string;
    value: number;
  }>;
}

export function MessageVolumeChart({ data }: MessageVolumeChartProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Volume de Mensagens</CardTitle>
        <CardDescription>
          Total de mensagens trocadas por dia
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ChartContainer 
            config={{
              messages: {
                color: "hsl(var(--chart-blue))"
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{
                  top: 20,
                  right: 10,
                  left: isMobile ? 10 : 20,
                  bottom: 20
                }}
              >
                <XAxis 
                  dataKey="day" 
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
                  cursor={{
                    fill: 'rgba(0, 0, 0, 0.1)'
                  }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p className="text-xs font-semibold">{`${payload[0].payload.day}`}</p>
                          <p className="text-sm">{`${payload[0].value.toLocaleString()} mensagens`}</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                  wrapperStyle={{ zIndex: 100 }}
                />
                <Bar 
                  dataKey="value" 
                  fill="currentColor" 
                  radius={[4, 4, 0, 0]} 
                  className="fill-[#0EA5E9] hover:fill-[#0284C7]" 
                  barSize={isMobile ? 25 : 40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
