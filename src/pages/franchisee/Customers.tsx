
import { useState } from "react";
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

// Mock customers data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "customer1",
    name: "Cliente Empresa A",
    email: "contato@empresaa.com",
    businessName: "Empresa A",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 2,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    logo: "https://ui-avatars.com/api/?name=Empresa+A&background=0D8ABC&color=fff"
  },
  {
    id: "customer2",
    name: "Cliente Empresa B",
    email: "contato@empresab.com",
    businessName: "Empresa B",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "customer3",
    name: "Cliente Empresa C",
    email: "contato@empresac.com",
    businessName: "Empresa C",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 1,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    logo: "https://ui-avatars.com/api/?name=Empresa+C&background=2E8B57&color=fff"
  },
  {
    id: "customer4",
    name: "Cliente Empresa D",
    email: "contato@empresad.com",
    businessName: "Empresa D",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: ""
  });
  const [copied, setCopied] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm) ||
    customer.businessName.toLowerCase().includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm)
  );

  const handleViewCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsShareModalOpen(true);
  };

  const handleManageCustomer = (customer: Customer) => {
    // In a real app, navigate to customer management page
    toast.info(`Gerenciando ${customer.businessName}`);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCustomer: Customer = {
      id: `customer${customers.length + 1}`,
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName,
      role: "customer",
      franchiseeId: "franchisee1", // Would come from current user
      agentCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setCustomers([...customers, newCustomer]);
    setIsAddModalOpen(false);
    setFormData({ name: "", email: "", businessName: "" });
    toast.success(`Cliente ${formData.businessName} adicionado com sucesso!`);
  };

  const handleCopyLink = () => {
    if (!currentCustomer) return;
    
    // Generate customer portal URL
    const portalUrl = `https://cliente.plataforma.com/${currentCustomer.id}`;
    
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      
      // Reset copy status after 2 seconds
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
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
                className="w-full sm:w-[250px] pl-8"
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

        {filteredCustomers.length > 0 ? (
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
            <p className="text-muted-foreground mb-2">Nenhum cliente encontrado.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome da Empresa</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Empresa ABC"
                value={formData.businessName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Contato</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome do responsável"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Customer Portal Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Portal do Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link do Portal</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentCustomer ? `https://cliente.plataforma.com/${currentCustomer.id}` : ""}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className={cn(
                    copied ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200" : ""
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe este link com o cliente para acessar o portal.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Acesso</Label>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">
                      {currentCustomer?.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentCustomer?.email}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Redefinir senha
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                O cliente também pode acessar o portal usando seu email e senha.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast.success("Email com instruções enviado ao cliente!");
              setIsShareModalOpen(false);
            }}>
              Enviar por Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
