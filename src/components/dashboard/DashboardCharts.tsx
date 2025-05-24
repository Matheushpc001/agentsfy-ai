
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BillingChart } from "@/components/analytics/BillingChart";
import { TopFranchiseesCard, TopFranchisee } from "@/components/analytics/TopFranchiseesCard";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Agent, UserRole } from "@/types";

interface DashboardChartsProps {
  userRole: UserRole;
  topAgents: Agent[];
  topFranchisees: TopFranchisee[];
  weeklyMessages: { day: string; count: number }[];
  isLoadingResults: boolean;
}

export function DashboardCharts({ userRole, topAgents, topFranchisees, weeklyMessages, isLoadingResults }: DashboardChartsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Billing Chart - only show for admin and franchisee */}
      {(userRole === "admin" || userRole === "franchisee") && (
        isLoadingResults ? (
          <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
        ) : (
          <BillingChart userRole={userRole} />
        )
      )}
      
      {/* Customer still gets the original messages chart */}
      {userRole === "customer" && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Mensagens Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingResults ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyMessages}
                    margin={{ top: 20, right: 20, left: isMobile ? 0 : 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      width={isMobile ? 30 : 40}
                      tickFormatter={(value) => value.toString()}
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
                      formatter={(value) => [`${value} mensagens`, 'Quantidade']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMessages)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Stats/Charts - Replaced with TopFranchiseesCard for admin */}
      {userRole === "admin" ? (
        isLoadingResults ? (
          <Skeleton className="lg:col-span-1 h-80 rounded-lg" />
        ) : (
          <TopFranchiseesCard franchisees={topFranchisees} className="lg:col-span-1" />
        )
      ) : userRole === "franchisee" ? (
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Principais Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={isMobile ? 16 / 12 : 16 / 9} className="overflow-hidden">
              {isLoadingResults ? (
                <div className="space-y-3 h-full">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : (
                <div className="space-y-3 h-full">
                  {topAgents.map(agent => (
                    <div key={agent.id} className="flex items-center p-2 rounded-lg border bg-gray-50 dark:bg-gray-800">
                      <div className="mr-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.messageCount} mensagens</p>
                      </div>
                      <div className={cn("h-2.5 w-2.5 rounded-full", agent.isActive ? "bg-green-500" : "bg-gray-300")}></div>
                    </div>
                  ))}

                  {topAgents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Bot className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p>Nenhum agente cadastrado</p>
                    </div>
                  )}
                </div>
              )}
            </AspectRatio>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Análise de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={isMobile ? 16 / 12 : 16 / 9} className="overflow-hidden">
              {isLoadingResults ? (
                <div className="space-y-4 h-full">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-6" />
                  <Skeleton className="h-6" />
                  <Skeleton className="h-6" />
                  <Skeleton className="h-2.5" />
                  <Skeleton className="h-24" />
                </div>
              ) : (
                <div className="space-y-4 h-full">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-sm">Conversas Hoje</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-sm">Tempo Médio</span>
                    <span className="text-sm font-medium">2:45 min</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-sm">Horário de Pico</span>
                    <span className="text-sm font-medium">14h - 16h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tokens Restantes</span>
                    <span className="text-sm font-medium">41%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{
                      width: '41%'
                    }}></div>
                  </div>
                  
                  <div className="mt-2 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyMessages}>
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#0EA5E9" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                          }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value) => [`${value} msgs`, '']}
                          labelFormatter={(label) => `${label}`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </AspectRatio>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
