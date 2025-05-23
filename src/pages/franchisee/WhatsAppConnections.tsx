
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { WhatsAppConnection, Customer } from "@/types/whatsapp";
import StatisticsSection from "@/components/whatsapp/StatisticsSection";
import SearchControl from "@/components/whatsapp/SearchControl";
import CustomerFilter from "@/components/whatsapp/CustomerFilter";
import ConnectionsList from "@/components/whatsapp/ConnectionsList";
import NewConnectionModal from "@/components/whatsapp/NewConnectionModal";
import QRCodeModal from "@/components/whatsapp/QRCodeModal";
import ConnectionSettings from "@/components/whatsapp/ConnectionSettings";

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
const MOCK_CUSTOMERS: Customer[] = [
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
  const handleCreateConnection = (newConnectionData: { name: string; phoneNumber: string; customerId: string }) => {
    if (!newConnectionData.name || !newConnectionData.customerId) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const customer = MOCK_CUSTOMERS.find(c => c.id === newConnectionData.customerId);
    
    if (!customer) {
      toast.error("Cliente não encontrado.");
      return;
    }

    const newConn: WhatsAppConnection = {
      id: `conn-${Date.now()}`,
      name: newConnectionData.name,
      phoneNumber: newConnectionData.phoneNumber || "Pendente",
      customerId: newConnectionData.customerId,
      customerName: customer.name,
      status: "pending",
      lastActive: new Date().toISOString(),
      messageCount: 0
    };

    setConnections(prev => [...prev, newConn]);
    setIsNewConnectionModalOpen(false);
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

  // Acessar chat/mensagens de uma conexão
  const handleViewMessages = (connection: WhatsAppConnection) => {
    toast.info(`Visualizando mensagens de ${connection.name}. Esta funcionalidade estará disponível em breve.`);
  };

  return (
    <DashboardLayout title="Conexões WhatsApp">
      <div className="space-y-6">
        {/* Estatísticas e controles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <StatisticsSection connections={connections} />
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <SearchControl 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <Button onClick={() => setIsNewConnectionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conexão
            </Button>
          </div>
        </div>

        {/* Filtro de cliente */}
        <CustomerFilter 
          customers={MOCK_CUSTOMERS}
          selectedCustomerId={customerFilter}
          onSelectCustomer={setCustomerFilter}
        />

        {/* Lista de conexões */}
        <ConnectionsList
          connections={filteredConnections}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm("")}
          onGenerateQrCode={handleGenerateQrCode}
          onViewMessages={handleViewMessages}
          onOpenSettings={(connection) => {
            setCurrentConnection(connection);
            setIsSettingsOpen(true);
          }}
          onDeleteConnection={handleDeleteConnection}
        />

        {/* Modais */}
        <NewConnectionModal
          isOpen={isNewConnectionModalOpen}
          onClose={() => setIsNewConnectionModalOpen(false)}
          onCreateConnection={handleCreateConnection}
          customers={MOCK_CUSTOMERS}
        />

        <QRCodeModal 
          isOpen={isQrCodeModalOpen}
          onClose={() => setIsQrCodeModalOpen(false)}
          onConnect={handleSimulateConnection}
        />

        <ConnectionSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          connection={currentConnection}
          onDeleteConnection={handleDeleteConnection}
        />
      </div>
    </DashboardLayout>
  );
}
