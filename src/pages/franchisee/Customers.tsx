import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Copy, Check, BriefcaseBusiness } from "lucide-react";
import CustomerCard from "@/components/customers/CustomerCard";
import { Customer } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import ManageCustomerModal from "@/components/customers/ManageCustomerModal"; // Importa o novo modal

// Função para buscar customers reais
async function fetchRealCustomers(franchiseeId: string): Promise<Customer[]> {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return customers?.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      businessName: customer.business_name, // <-- CORRIGIDO
      role: customer.role,
      franchiseeId: customer.franchisee_id,
      status: customer.status,
      agentCount: customer.agent_count || 0,
      createdAt: customer.created_at, // <-- CORRIGIDO
      logo: customer.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.business_name || customer.name)}&background=0D8ABC&color=fff`,
      document: customer.document,
      contactPhone: customer.contact_phone,
      portalUrl: customer.portal_url
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar customers:', error);
    return [];
  }
}

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false); // Estado para o modal de gerenciamento
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && user.role === 'franchisee') {
      loadCustomers();
    }
  }, [user]);

  const loadCustomers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const realCustomers = await fetchRealCustomers(user.id);
      setCustomers(realCustomers.length > 0 ? realCustomers : []);
    } catch (error) {
      console.error('Erro ao carregar customers:', error);
      toast.error('Erro ao carregar lista de clientes');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCustomers = (customers || []).filter(customer =>
    customer && (
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.business_name?.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm)
    )
  );

  const handleActionSuccess = () => {
    loadCustomers(); 
  };

  const handleViewCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsShareModalOpen(true);
  };

  const handleManageCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsManageModalOpen(true);
  };

  const handleCopyLink = () => {
    if (!currentCustomer) return;
    
    const portalUrl = `https://agentsfy-ai.lovable.app/a/${currentCustomer.id}`;
    
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <BriefcaseBusiness className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="font-medium">{customers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onView={handleViewCustomer} 
                onManage={handleManageCustomer} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <BriefcaseBusiness size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchTerm ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado.'}
            </p>
            {searchTerm ? (
              <Button variant="link" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            ) : (
              <Button onClick={() => setIsAddModalOpen(true)} className="mt-2">
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar primeiro cliente
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateCustomerModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <ManageCustomerModal
        open={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        customer={currentCustomer}
        onSuccess={handleActionSuccess}
      />

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Portal do Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compartilhe este link para que o cliente possa acessar seu portal personalizado:
            </p>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`https://agentsfy-ai.lovable.app/a/${currentCustomer?.id}`}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className={cn(copied && "bg-green-600")}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">Link copiado!</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsShareModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}