
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    positive: boolean;
    label: string;
  };
  chartData: { [key: string]: any }[];
  chartColor?: string;
  className?: string;
}

export function DashboardStatCard({ 
  title, 
  value, 
  change, 
  chartData, 
  chartColor = "hsl(var(--primary))", 
  className 
}: DashboardStatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            
            {change && (
              <div 
                className={cn(
                  "text-xs font-medium",
                  change.positive ? "text-emerald-500" : "text-rose-500"
                )}
              >
                <span className="mr-1">{change.positive ? "↑" : "↓"}</span>
                {change.value}%
              </div>
            )}
          </div>
          
          {change && (
            <p className="text-xs text-muted-foreground">
              {change.label}
            </p>
          )}
          
          <div className="h-[60px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
