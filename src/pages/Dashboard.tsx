import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Bot,
  Clock,
  Phone,
  CheckCircle,
  Store,
  DollarSign,
  UserCheck
} from "lucide-react";

// Mock data for admin dashboard
const ADMIN_STATS = {
  totalFranchisees: 24,
  activeFranchisees: 22,
  totalCustomers: 156,
  totalAgents: 189,
  totalMessages: 45678,
  averageResponseTime: 8.2,
  revenueMonth: 24500,
  revenueGrowth: 12.5,
};

// Mock data for franchisee dashboard
const FRANCHISEE_STATS = {
  totalCustomers: 12,
  activeCustomers: 10,
  totalAgents: 15,
  activeAgents: 14,
  totalMessages: 5678,
  averageResponseTime: 7.5,
  revenueMonth: 4500,
  revenueGrowth: 8.5,
  whatsappConnections: 8,
  activeConnections: 7,
};

// Mock data for customer dashboard
const CUSTOMER_STATS = {
  totalAgents: 1,
  activeAgents: 1,
  totalMessages: 1245,
  averageResponseTime: 6.8,
  whatsappConnections: 1,
  activeConnections: 1,
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon, loading = false }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect based on user role
  const renderDashboardByRole = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return renderAdminDashboard();
      case "franchisee":
        return renderFranchiseeDashboard();
      case "customer":
        return renderCustomerDashboard();
      default:
        return <div>Acesso não autorizado</div>;
    }
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Franqueados"
          value={loading ? "" : ADMIN_STATS.totalFranchisees}
          icon={<Store size={18} />}
          loading={loading}
        />
        <StatCard
          title="Franqueados Ativos"
          value={loading ? "" : ADMIN_STATS.activeFranchisees}
          description={`${Math.round((ADMIN_STATS.activeFranchisees / ADMIN_STATS.totalFranchisees) * 100)}% do total`}
          icon={<UserCheck size={18} />}
          loading={loading}
        />
        <StatCard
          title="Total de Clientes"
          value={loading ? "" : ADMIN_STATS.totalCustomers}
          icon={<Users size={18} />}
          loading={loading}
        />
        <StatCard
          title="Total de Agentes"
          value={loading ? "" : ADMIN_STATS.totalAgents}
          icon={<Bot size={18} />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mensagens Processadas"
          value={loading ? "" : new Intl.NumberFormat().format(ADMIN_STATS.totalMessages)}
          icon={<MessageSquare size={18} />}
          loading={loading}
        />
        <StatCard
          title="Tempo Médio de Resposta"
          value={loading ? "" : `${ADMIN_STATS.averageResponseTime}s`}
          icon={<Clock size={18} />}
          loading={loading}
        />
        <StatCard
          title="Receita Mensal"
          value={loading ? "" : `R$ ${new Intl.NumberFormat().format(ADMIN_STATS.revenueMonth)}`}
          icon={<DollarSign size={18} />}
          loading={loading}
        />
        <StatCard
          title="Crescimento"
          value={loading ? "" : `+${ADMIN_STATS.revenueGrowth}%`}
          description="Em relação ao mês anterior"
          icon={<TrendingUp size={18} />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Franqueados Recentes</CardTitle>
            <CardDescription>Últimos franqueados cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Carlos Oliveira</p>
                    <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                  </div>
                  <Badge>Novo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ana Souza</p>
                    <p className="text-sm text-muted-foreground">Rio de Janeiro, RJ</p>
                  </div>
                  <Badge>Novo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marcos Silva</p>
                    <p className="text-sm text-muted-foreground">Belo Horizonte, MG</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas atividades na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo franqueado cadastrado</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">10 novos agentes criados</p>
                    <p className="text-xs text-muted-foreground">Há 5 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento recebido</p>
                    <p className="text-xs text-muted-foreground">Há 1 dia</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFranchiseeDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Clientes"
          value={loading ? "" : FRANCHISEE_STATS.totalCustomers}
          icon={<Users size={18} />}
          loading={loading}
        />
        <StatCard
          title="Clientes Ativos"
          value={loading ? "" : FRANCHISEE_STATS.activeCustomers}
          description={`${Math.round((FRANCHISEE_STATS.activeCustomers / FRANCHISEE_STATS.totalCustomers) * 100)}% do total`}
          icon={<UserCheck size={18} />}
          loading={loading}
        />
        <StatCard
          title="Total de Agentes"
          value={loading ? "" : FRANCHISEE_STATS.totalAgents}
          icon={<Bot size={18} />}
          loading={loading}
        />
        <StatCard
          title="Agentes Ativos"
          value={loading ? "" : FRANCHISEE_STATS.activeAgents}
          description={`${Math.round((FRANCHISEE_STATS.activeAgents / FRANCHISEE_STATS.totalAgents) * 100)}% do total`}
          icon={<CheckCircle size={18} />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conexões WhatsApp"
          value={loading ? "" : FRANCHISEE_STATS.whatsappConnections}
          icon={<Phone size={18} />}
          loading={loading}
        />
        <StatCard
          title="Conexões Ativas"
          value={loading ? "" : FRANCHISEE_STATS.activeConnections}
          description={`${Math.round((FRANCHISEE_STATS.activeConnections / FRANCHISEE_STATS.whatsappConnections) * 100)}% do total`}
          icon={<CheckCircle size={18} />}
          loading={loading}
        />
        <StatCard
          title="Receita Mensal"
          value={loading ? "" : `R$ ${new Intl.NumberFormat().format(FRANCHISEE_STATS.revenueMonth)}`}
          icon={<DollarSign size={18} />}
          loading={loading}
        />
        <StatCard
          title="Crescimento"
          value={loading ? "" : `+${FRANCHISEE_STATS.revenueGrowth}%`}
          description="Em relação ao mês anterior"
          icon={<TrendingUp size={18} />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Clientes Recentes</CardTitle>
            <CardDescription>Últimos clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Padaria São José</p>
                    <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                  </div>
                  <Badge>Novo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Farmácia Bem Estar</p>
                    <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Restaurante Sabor Caseiro</p>
                    <p className="text-sm text-muted-foreground">Campinas, SP</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-1" />
                <span>Novo Cliente</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Bot className="h-5 w-5 mb-1" />
                <span>Novo Agente</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Phone className="h-5 w-5 mb-1" />
                <span>Conectar WhatsApp</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <BarChart3 className="h-5 w-5 mb-1" />
                <span>Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Agentes"
          value={loading ? "" : CUSTOMER_STATS.totalAgents}
          icon={<Bot size={18} />}
          loading={loading}
        />
        <StatCard
          title="Agentes Ativos"
          value={loading ? "" : CUSTOMER_STATS.activeAgents}
          icon={<CheckCircle size={18} />}
          loading={loading}
        />
        <StatCard
          title="Mensagens Processadas"
          value={loading ? "" : new Intl.NumberFormat().format(CUSTOMER_STATS.totalMessages)}
          icon={<MessageSquare size={18} />}
          loading={loading}
        />
        <StatCard
          title="Tempo Médio de Resposta"
          value={loading ? "" : `${CUSTOMER_STATS.averageResponseTime}s`}
          icon={<Clock size={18} />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status do WhatsApp</CardTitle>
            <CardDescription>Status da sua conexão com WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-medium text-green-600 dark:text-green-400">WhatsApp Conectado</h3>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                  Seu agente está respondendo mensagens
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Bot className="h-5 w-5 mb-1" />
                <span>Configurar IA</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <MessageSquare className="h-5 w-5 mb-1" />
                <span>Ver Mensagens</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Phone className="h-5 w-5 mb-1" />
                <span>Status WhatsApp</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-1" />
                <span>Suporte</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Dashboard">
      {renderDashboardByRole()}
    </DashboardLayout>
  );
}
