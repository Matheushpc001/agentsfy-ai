
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  niche: string;
  address: string;
  phone: string;
  email: string | null;
  selected: boolean;
}

// Mock niches
const NICHES = [
  "Clínicas de Estética",
  "Pet Shops",
  "Dentistas",
  "Advogados",
  "Autoescolas",
  "Restaurantes",
  "Barbearias",
  "Lojas de Roupas",
  "Academias",
  "Outros"
];

// Mock leads function to simulate API call
const fetchLeadsByNicheAndCity = async (niche: string, city: string): Promise<Lead[]> => {
  // In a real implementation, this would call an API
  console.log(`Fetching leads for niche: ${niche} in city: ${city}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return Array.from({ length: 10 }, (_, i) => ({
    id: `lead-${i}-${Date.now()}`,
    name: `${niche} ${i+1} em ${city}`,
    niche,
    address: `Rua Principal, ${i*123}, ${city}`,
    phone: `+5511${Math.floor(90000000 + Math.random() * 9999999)}`,
    email: Math.random() > 0.3 ? `contato${i}@empresa${i}.com` : null,
    selected: false
  }));
};

export default function Prospecting() {
  const [city, setCity] = useState("");
  const [niche, setNiche] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim() || !niche) {
      toast.error("Preencha a cidade e o nicho para continuar.");
      return;
    }
    
    setIsLoading(true);
    try {
      const fetchedLeads = await fetchLeadsByNicheAndCity(niche, city);
      setLeads(fetchedLeads);
      toast.success(`${fetchedLeads.length} empresas encontradas!`);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao buscar empresas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLeadSelection = (id: string) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, selected: !lead.selected } : lead
    ));
  };

  const toggleAllLeads = (selected: boolean) => {
    setLeads(leads.map(lead => ({ ...lead, selected })));
  };

  const exportLeads = () => {
    const selectedLeads = leads.filter(lead => lead.selected);
    
    if (selectedLeads.length === 0) {
      toast.error("Selecione pelo menos uma empresa para exportar.");
      return;
    }
    
    // Create CSV content
    const headers = ["Nome", "Nicho", "Endereço", "Telefone", "Email"];
    const csvRows = [
      headers.join(','),
      ...selectedLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.niche}"`,
        `"${lead.address}"`,
        `"${lead.phone}"`,
        `"${lead.email || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${city}_${niche.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${selectedLeads.length} leads exportados com sucesso!`);
  };

  // Check if any leads are selected
  const selectedCount = leads.filter(lead => lead.selected).length;

  return (
    <DashboardLayout title="Prospecção de Clientes">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Empresas Locais</CardTitle>
            <CardDescription>
              Encontre empresas locais por cidade e nicho para prospecção automatizada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Cidade</label>
                <Input 
                  placeholder="Digite o nome da cidade" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Nicho de negócio</label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((nicheOption) => (
                      <SelectItem key={nicheOption} value={nicheOption}>
                        {nicheOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> 
                      Buscar empresas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {leads.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resultados da Busca</CardTitle>
                <CardDescription>
                  {leads.length} empresas encontradas
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all" 
                    checked={leads.every(lead => lead.selected)}
                    onCheckedChange={(checked) => toggleAllLeads(!!checked)}
                  />
                  <label 
                    htmlFor="select-all" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Selecionar todos
                  </label>
                </div>
                <Button 
                  variant="outline" 
                  onClick={exportLeads}
                  disabled={selectedCount === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar ({selectedCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 w-10"></th>
                      <th className="text-left py-3 px-4">Nome</th>
                      <th className="text-left py-3 px-4">Nicho</th>
                      <th className="text-left py-3 px-4 hidden md:table-cell">Endereço</th>
                      <th className="text-left py-3 px-4">Telefone</th>
                      <th className="text-left py-3 px-4 hidden md:table-cell">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Checkbox 
                            checked={lead.selected} 
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                            id={`lead-${lead.id}`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <label 
                            htmlFor={`lead-${lead.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {lead.name}
                          </label>
                        </td>
                        <td className="py-3 px-4">{lead.niche}</td>
                        <td className="py-3 px-4 hidden md:table-cell">{lead.address}</td>
                        <td className="py-3 px-4">{lead.phone}</td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {lead.email || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
