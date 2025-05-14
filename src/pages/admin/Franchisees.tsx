
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import FranchiseeCard from "@/components/franchisees/FranchiseeCard";
import { Franchisee } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mock franchisees data
const MOCK_FRANCHISEES: Franchisee[] = [
  {
    id: "franchisee1",
    name: "João Silva",
    email: "joao@example.com",
    role: "franchisee",
    agentCount: 8,
    revenue: 1497.00,
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    customerCount: 5,
  },
  {
    id: "franchisee2",
    name: "Ana Souza",
    email: "ana@example.com",
    role: "franchisee",
    agentCount: 12,
    revenue: 2992.50,
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    customerCount: 7,
  },
  {
    id: "franchisee3",
    name: "Carlos Mendes",
    email: "carlos@example.com",
    role: "franchisee",
    agentCount: 5,
    revenue: 1048.70,
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    customerCount: 3,
  },
  {
    id: "franchisee4",
    name: "Patricia Lima",
    email: "patricia@example.com",
    role: "franchisee",
    agentCount: 15,
    revenue: 3745.20,
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    customerCount: 9,
  },
  {
    id: "franchisee5",
    name: "Roberto Alves",
    email: "roberto@example.com",
    role: "franchisee",
    agentCount: 0,
    revenue: 297.00,
    isActive: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    customerCount: 0,
  }
];

export default function Franchisees() {
  const [franchisees, setFranchisees] = useState<Franchisee[]>(MOCK_FRANCHISEES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isActive: true
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredFranchisees = franchisees.filter(franchisee => 
    franchisee.name.toLowerCase().includes(searchTerm) ||
    franchisee.email.toLowerCase().includes(searchTerm)
  );

  const handleViewFranchisee = (franchisee: Franchisee) => {
    // In a real app, navigate to franchisee details page or show details modal
    toast.info(`Visualizando detalhes de ${franchisee.name}`);
  };

  const handleEditFranchisee = (franchisee: Franchisee) => {
    setEditingFranchisee(franchisee);
    setFormData({
      name: franchisee.name,
      email: franchisee.email,
      isActive: franchisee.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFranchisee: Franchisee = {
      id: `franchisee${franchisees.length + 1}`,
      name: formData.name,
      email: formData.email,
      role: "franchisee",
      agentCount: 0,
      revenue: 297.00,
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
      customerCount: 0
    };
    
    setFranchisees([...franchisees, newFranchisee]);
    setIsAddModalOpen(false);
    setFormData({ name: "", email: "", isActive: true });
    toast.success(`Franqueado ${formData.name} adicionado com sucesso!`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFranchisee) return;
    
    const updatedFranchisees = franchisees.map(f => 
      f.id === editingFranchisee.id 
        ? { 
            ...f, 
            name: formData.name, 
            email: formData.email, 
            isActive: formData.isActive 
          } 
        : f
    );
    
    setFranchisees(updatedFranchisees);
    setIsEditModalOpen(false);
    setEditingFranchisee(null);
    toast.success(`Franqueado ${formData.name} atualizado com sucesso!`);
  };

  return (
    <DashboardLayout title="Franqueados">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar franqueados..."
              className="w-full sm:w-[250px] md:w-[300px] pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Franqueado
          </Button>
        </div>

        {filteredFranchisees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredFranchisees.map(franchisee => (
              <FranchiseeCard 
                key={franchisee.id} 
                franchisee={franchisee} 
                onView={handleViewFranchisee}
                onEdit={handleEditFranchisee}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-2">Nenhum franqueado encontrado.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Franchisee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Franqueado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome do franqueado"
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
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Franchisee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Editar Franqueado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Nome do franqueado"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="edit-isActive" 
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive">Ativo</Label>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
