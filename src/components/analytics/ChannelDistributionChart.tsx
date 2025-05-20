
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

interface ChannelDistributionProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function ChannelDistributionChart({ data }: ChannelDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Distribuição por Canal</CardTitle>
        <CardDescription>
          Porcentagem de uso por canal de comunicação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={data} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  outerRadius={100} 
                  innerRadius={60} 
                  paddingAngle={3} 
                  dataKey="value" 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p 
                            className="text-xs font-semibold" 
                            style={{
                              color: payload[0].payload.color
                            }}
                          >
                            {payload[0].name}
                          </p>
                          <p className="text-sm">{`${payload[0].value}%`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  wrapperStyle={{ zIndex: 100 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
