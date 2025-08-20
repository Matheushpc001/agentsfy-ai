// src/pages/admin/Franchisees.tsx

import { useState, useEffect, FormEvent } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Building2 } from "lucide-react";
import FranchiseeCard from "@/components/franchisees/FranchiseeCard";
import { Franchisee } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Usando Switch para consistência de UI
import { toast } from "sonner";
import { franchiseeService } from "@/services/franchiseeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Franchisees() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback de UI durante chamadas de API
  const [error, setError] = useState<string | null>(null);
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [viewingFranchisee, setViewingFranchisee] = useState<Franchisee | null>(null);
  
  // Estado unificado para os formulários de adição e edição
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isActive: true
  });

  const fetchFranchisees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await franchiseeService.getFranchisees();
      setFranchisees(data);
    } catch (e: any) {
      setError(`Falha ao carregar dados dos franqueados. ${e.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
    setViewingFranchisee(franchisee);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteFranchisee = async (franchisee: Franchisee) => {
    if (!confirm(`Tem certeza que deseja excluir o franqueado "${franchisee.name}"? Esta é uma ação crítica e irreversível.`)) {
      return;
    }
    // A lógica de exclusão segura deve ser implementada em uma Edge Function
    await franchiseeService.deleteFranchisee(franchisee.id);
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
  
  const resetForm = () => {
    setFormData({ name: "", email: "", isActive: true });
  };
  
  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await franchiseeService.createFranchisee({ name: formData.name, email: formData.email });
      toast.success(`Convite enviado com sucesso para ${formData.email}!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchFranchisees(); // Recarrega a lista para mostrar o novo franqueado
    } catch (error: any) {
      console.error('Erro ao adicionar franqueado:', error);
      toast.error(`Erro ao adicionar franqueado: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingFranchisee) {
      toast.error('Erro interno: Franqueado não selecionado para edição.');
      return;
    }

    setIsSubmitting(true);
    try {
      await franchiseeService.updateFranchisee(editingFranchisee.id, {
        name: formData.name,
        isActive: formData.isActive
      });
      toast.success(`Franqueado ${formData.name} atualizado com sucesso!`);
      setIsEditModalOpen(false);
      fetchFranchisees(); // Recarrega a lista para refletir as mudanças
    } catch (error: any) {
      console.error('Erro ao atualizar franqueado:', error);
      toast.error(`Erro ao atualizar franqueado: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
          <Button variant="outline" onClick={fetchFranchisees} className="mt-4">
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
              onDelete={handleDeleteFranchisee}
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
          <Button onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }} className="w-full sm:w-auto">
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
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome</Label>
              <Input id="add-name" name="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" name="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} required />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar Convite"}</Button>
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
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (não pode ser alterado)</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} disabled />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="edit-isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(p => ({...p, isActive: checked}))} />
              <Label htmlFor="edit-isActive">Ativo</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Alterações"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Detalhes do Franqueado</DialogTitle>
          </DialogHeader>
          {viewingFranchisee && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <p className="font-medium">{viewingFranchisee.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewingFranchisee.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={viewingFranchisee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {viewingFranchisee.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Cadastro</Label>
                  <p className="font-medium">
                    {new Date(viewingFranchisee.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Agentes</Label>
                  <p className="font-medium">{viewingFranchisee.agentCount}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Clientes</Label>
                  <p className="font-medium">{viewingFranchisee.customerCount}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Receita Estimada</Label>
                  <p className="font-medium text-lg text-green-600">
                    R$ {viewingFranchisee.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}