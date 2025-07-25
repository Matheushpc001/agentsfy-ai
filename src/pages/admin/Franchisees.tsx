// src/pages/admin/Franchisees.tsx

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Building2 } from "lucide-react";
import FranchiseeCard from "@/components/franchisees/FranchiseeCard";
import { Franchisee } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { franchiseeService } from "@/services/franchiseeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Franchisees() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isActive: true
  });

  useEffect(() => {
    const fetchFranchisees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await franchiseeService.getFranchisees();
        setFranchisees(data);
      } catch (e) {
        setError("Falha ao carregar dados dos franqueados. Verifique se você tem permissão de administrador.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFranchisees();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredFranchisees = franchisees.filter(franchisee => 
    franchisee.name.toLowerCase().includes(searchTerm) ||
    franchisee.email.toLowerCase().includes(searchTerm)
  );

  const handleViewFranchisee = (franchisee: Franchisee) => {
    toast.info(`Visualizando detalhes de ${franchisee.name}`);
    // Futuramente, isso navegaria para /admin/franchisees/${franchisee.id}
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
    // TODO: Implementar a chamada ao serviço para criar um franqueado no Supabase
    // Exemplo: await franchiseeService.createFranchisee(formData);
    toast.success(`Funcionalidade de adicionar franqueado a ser implementada.`);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar a chamada ao serviço para atualizar um franqueado no Supabase
    // Exemplo: await franchiseeService.updateFranchisee(editingFranchisee.id, formData);
    toast.success(`Funcionalidade de editar franqueado a ser implementada.`);
    setIsEditModalOpen(false);
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardHeader className="p-4 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[120px]" />
                </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex space-x-2 pt-2">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 flex-1 rounded-md" />
            </div>
        </CardContent>
      </Card>
    ))
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {renderSkeleton()}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="font-semibold">Erro ao carregar dados</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (filteredFranchisees.length > 0) {
      return (
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
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <Building2 size={48} className="text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-2 font-semibold">
          {searchTerm ? "Nenhum franqueado encontrado." : "Nenhum franqueado cadastrado."}
        </p>
        {searchTerm && (
          <Button variant="link" onClick={() => setSearchTerm("")}>
            Limpar busca
          </Button>
        )}
      </div>
    );
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
              disabled={isLoading}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Franqueado
          </Button>
        </div>

        {renderContent()}
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