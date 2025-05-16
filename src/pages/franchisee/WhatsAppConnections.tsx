
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Plus, 
  QrCode, 
  MoreVertical, 
  RefreshCw, 
  Smartphone, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Check, 
  X, 
  Settings 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tipo para as conexões WhatsApp
interface WhatsAppConnection {
  id: string;
  name: string;
  phoneNumber: string;
  customerId: string;
  customerName: string;
  status: "connected" | "disconnected" | "pending";
  lastActive: string;
  messageCount: number;
}

// Dados simulados de conexões
const MOCK_CONNECTIONS: WhatsAppConnection[] = [
  {
    id: "conn-1",
    name: "Atendimento Principal",
    phoneNumber: "+5511999991111",
    customerId: "customer-1",
    customerName: "Padaria São José",
    status: "connected",
    lastActive: "2023-05-16T14:32:00Z",
    messageCount: 2456
  },
  {
    id: "conn-2",
    name: "Vendas",
    phoneNumber: "+5511999992222",
    customerId: "customer-1",
    customerName: "Padaria São José",
    status: "connected",
    lastActive: "2023-05-16T10:15:00Z",
    messageCount: 1280
  },
  {
    id: "conn-3",
    name: "Suporte",
    phoneNumber: "+5511999993333",
    customerId: "customer-2",
    customerName: "Farmácia Bem Estar",
    status: "disconnected",
    lastActive: "2023-05-15T18:45:00Z",
    messageCount: 5670
  },
  {
    id: "conn-4",
    name: "Agendamentos",
    phoneNumber: "+5511999994444",
    customerId: "customer-3",
    customerName: "Clínica Saúde Total",
    status: "pending",
    lastActive: "2023-05-16T09:00:00Z",
    messageCount: 834
  }
];

// Lista mockada de clientes para selecionar
const MOCK_CUSTOMERS = [
  { id: "customer-1", name: "Padaria São José" },
  { id: "customer-2", name: "Farmácia Bem Estar" },
  { id: "customer-3", name: "Clínica Saúde Total" },
  { id: "customer-4", name: "Restaurante Sabor Caseiro" },
];

export default function WhatsAppConnections() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>(MOCK_CONNECTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewConnectionModalOpen, setIsNewConnectionModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<WhatsAppConnection | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // Novo estado para formulário de nova conexão
  const [newConnection, setNewConnection] = useState({
    name: "",
    phoneNumber: "",
    customerId: ""
  });

  // Filtrar conexões com base na busca e filtro de cliente
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = searchTerm === "" || 
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.phoneNumber.includes(searchTerm) ||
      connection.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = !customerFilter || connection.customerId === customerFilter;
    
    return matchesSearch && matchesCustomer;
  });

  // Função para gerar um QR Code para conexão
  const handleGenerateQrCode = (connection: WhatsAppConnection) => {
    setCurrentConnection(connection);
    setIsQrCodeModalOpen(true);
  };

  // Simulação de conexão via QR Code
  const handleSimulateConnection = () => {
    if (!currentConnection) return;
    
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === currentConnection.id 
          ? { ...conn, status: "connected" } 
          : conn
      ));
      
      setIsQrCodeModalOpen(false);
      setCurrentConnection(null);
      toast.success("Conexão estabelecida com sucesso!");
    }, 2000);
  };

  // Criação de nova conexão
  const handleCreateConnection = () => {
    if (!newConnection.name || !newConnection.customerId) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const customer = MOCK_CUSTOMERS.find(c => c.id === newConnection.customerId);
    
    if (!customer) {
      toast.error("Cliente não encontrado.");
      return;
    }

    const newConn: WhatsAppConnection = {
      id: `conn-${Date.now()}`,
      name: newConnection.name,
      phoneNumber: newConnection.phoneNumber || "Pendente",
      customerId: newConnection.customerId,
      customerName: customer.name,
      status: "pending",
      lastActive: new Date().toISOString(),
      messageCount: 0
    };

    setConnections(prev => [...prev, newConn]);
    setIsNewConnectionModalOpen(false);
    setNewConnection({ name: "", phoneNumber: "", customerId: "" });
    toast.success("Nova conexão WhatsApp criada! Escaneie o QR Code para conectar.");
    
    // Imediatamente abrir QR Code para a nova conexão
    setTimeout(() => {
      setCurrentConnection(newConn);
      setIsQrCodeModalOpen(true);
    }, 500);
  };

  // Remover conexão
  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    toast.success("Conexão removida com sucesso.");
  };

  // Reconectar WhatsApp desconectado
  const handleReconnect = (connection: WhatsAppConnection) => {
    handleGenerateQrCode(connection);
  };

  // Acessar configurações da conexão
  const handleOpenSettings = (connection: WhatsAppConnection) => {
    setCurrentConnection(connection);
    setIsSettingsOpen(true);
  };

  // Acessar chat/mensagens de uma conexão
  const handleViewMessages = (connection: WhatsAppConnection) => {
    toast.info(`Visualizando mensagens de ${connection.name}. Esta funcionalidade estará disponível em breve.`);
    // Aqui redirecionaria para página de mensagens
  };

  return (
    <DashboardLayout title="Conexões WhatsApp">
      <div className="space-y-6">
        {/* Estatísticas e controles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <Phone className="text-green-500 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Conexões</p>
                <p className="font-medium">
                  {connections.filter(c => c.status === "connected").length} <span className="text-xs text-muted-foreground">/ {connections.length} total</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <MessageSquare className="text-blue-500 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Mensagens</p>
                <p className="font-medium">
                  {connections.reduce((acc, conn) => acc + conn.messageCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Buscar conexões..."
                className="w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsNewConnectionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conexão
            </Button>
          </div>
        </div>

        {/* Filtro de cliente */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={!customerFilter ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setCustomerFilter(null)}
          >
            Todos os clientes
          </Button>
          
          {MOCK_CUSTOMERS.map(customer => (
            <Button
              key={customer.id}
              variant={customerFilter === customer.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCustomerFilter(customer.id)}
            >
              {customer.name}
            </Button>
          ))}
        </div>

        {/* Grid de conexões */}
        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map(connection => (
              <Card key={connection.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <CardDescription>{connection.customerName}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Mais opções</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewMessages(connection)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Ver mensagens
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenSettings(connection)}>
                          <Settings className="mr-2 h-4 w-4" /> Configurações
                        </DropdownMenuItem>
                        {connection.status !== "connected" && (
                          <DropdownMenuItem onClick={() => handleReconnect(connection)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Reconectar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteConnection(connection.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{connection.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        {connection.status === "connected" ? (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500 px-2 py-1 rounded-full flex items-center">
                            <Check className="h-3 w-3 mr-1" /> Conectado
                          </span>
                        ) : connection.status === "pending" ? (
                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500 px-2 py-1 rounded-full flex items-center">
                            <QrCode className="h-3 w-3 mr-1" /> Pendente
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500 px-2 py-1 rounded-full flex items-center">
                            <X className="h-3 w-3 mr-1" /> Desconectado
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mensagens:</span>
                      <span className="font-medium">{connection.messageCount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Última atividade:</span>
                      <span className="font-medium">
                        {new Date(connection.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3">
                  {connection.status === "connected" ? (
                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={() => handleViewMessages(connection)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ver conversas
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => handleGenerateQrCode(connection)}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      {connection.status === "pending" ? "Conectar WhatsApp" : "Reconectar WhatsApp"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Smartphone size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma conexão encontrada.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal para nova conexão */}
      <Dialog open={isNewConnectionModalOpen} onOpenChange={setIsNewConnectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Crie uma nova conexão WhatsApp para um cliente. Depois de criar, será necessário conectar via QR Code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome da conexão
              </label>
              <Input
                id="name"
                placeholder="Ex: Atendimento Principal"
                value={newConnection.name}
                onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="customer" className="text-sm font-medium">
                Cliente
              </label>
              <select
                id="customer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newConnection.customerId}
                onChange={(e) => setNewConnection({...newConnection, customerId: e.target.value})}
              >
                <option value="">Selecione um cliente</option>
                {MOCK_CUSTOMERS.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Número de telefone (opcional)
              </label>
              <Input
                id="phone"
                placeholder="Ex: +55 11 99999-9999"
                value={newConnection.phoneNumber}
                onChange={(e) => setNewConnection({...newConnection, phoneNumber: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                O número será confirmado após conexão com WhatsApp.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConnectionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateConnection}>
              Criar Conexão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para QR Code */}
      <Dialog open={isQrCodeModalOpen} onOpenChange={setIsQrCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar ao WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR abaixo com seu WhatsApp para estabelecer a conexão.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            {/* Placeholder para QR code */}
            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <QrCode size={80} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground animate-pulse">Gerando código QR...</p>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              Abra o WhatsApp no seu celular, acesse Configurações &gt; WhatsApp Web e escaneie o código QR.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQrCodeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSimulateConnection}>
              Simular Conexão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Painel lateral de configurações */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configurações da Conexão</SheetTitle>
            <SheetDescription>
              {currentConnection?.name} - {currentConnection?.customerName}
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informações da Conexão</h3>
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium">
                    {currentConnection?.status === "connected" ? (
                      <span className="text-green-600">Conectado</span>
                    ) : currentConnection?.status === "pending" ? (
                      <span className="text-yellow-600">Pendente</span>
                    ) : (
                      <span className="text-red-600">Desconectado</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Número:</span>
                  <span className="text-sm font-medium">{currentConnection?.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mensagens:</span>
                  <span className="text-sm font-medium">{currentConnection?.messageCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Última atividade:</span>
                  <span className="text-sm font-medium">
                    {currentConnection?.lastActive ? new Date(currentConnection.lastActive).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configurações</h3>
              <div className="space-y-2">
                <label htmlFor="conn-name" className="text-sm">Nome da conexão</label>
                <Input 
                  id="conn-name"
                  defaultValue={currentConnection?.name}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Receber notificações</span>
                  <span className="text-xs text-muted-foreground">Alertas sobre desconexões</span>
                </div>
                <div>
                  {/* Aqui seria implementado um switch/toggle */}
                  <button className="bg-primary h-5 w-10 rounded-full relative">
                    <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white"></span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Resposta automática</span>
                  <span className="text-xs text-muted-foreground">Usar IA para responder mensagens</span>
                </div>
                <div>
                  {/* Aqui seria implementado um switch/toggle */}
                  <button className="bg-muted h-5 w-10 rounded-full relative">
                    <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white"></span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => setIsSettingsOpen(false)}>
                Salvar Configurações
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  if (currentConnection) {
                    handleDeleteConnection(currentConnection.id);
                    setIsSettingsOpen(false);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Conexão
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
