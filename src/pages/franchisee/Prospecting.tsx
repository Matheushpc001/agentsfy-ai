
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Download, MapPin, Building } from "lucide-react";
import { toast } from "sonner";
import { Lead, BRAZILIAN_STATES, CITY_TO_STATE_MAP } from "@/types/prospecting";
import ProspectingService from "@/services/prospectingService";

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
  "Personalizado"
];

export default function Prospecting() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock franchisee ID - In real app, this would come from auth context
  const franchiseeId = "franchisee-123";

  // Detectar estado automaticamente quando a cidade for digitada
  useEffect(() => {
    if (city.trim() && !state) {
      const cityLower = city.toLowerCase().trim();
      const detectedState = CITY_TO_STATE_MAP[cityLower];
      if (detectedState) {
        setState(detectedState);
        console.log(`Estado detectado automaticamente: ${detectedState} para cidade: ${city}`);
      }
    }
  }, [city, state]);

  // Reset custom niche when changing from "Personalizado" to another option
  useEffect(() => {
    if (niche !== "Personalizado") {
      setCustomNiche("");
    }
  }, [niche]);

  const handleSearch = async () => {
    if (!city.trim()) {
      toast.error("Digite o nome da cidade para continuar.");
      return;
    }
    
    if (!niche) {
      toast.error("Selecione um nicho para continuar.");
      return;
    }

    if (niche === "Personalizado" && !customNiche.trim()) {
      toast.error("Digite o nicho personalizado para continuar.");
      return;
    }

    if (!state) {
      toast.error("Selecione um estado ou digite uma cidade conhecida para detecção automática.");
      return;
    }
    
    // Use custom niche if "Personalizado" is selected, otherwise use the selected niche
    const searchNiche = niche === "Personalizado" ? customNiche.trim() : niche;
    
    setIsLoading(true);
    try {
      const fetchedLeads = await ProspectingService.fetchUniqueLeads(
        franchiseeId,
        searchNiche,
        city.trim(),
        state,
        quantity
      );
      
      setLeads(fetchedLeads);
      toast.success(`${fetchedLeads.length} empresas encontradas! (${quantity} solicitadas)`);
      
      if (fetchedLeads.length < quantity) {
        toast.warning(`Apenas ${fetchedLeads.length} empresas disponíveis para este nicho nesta cidade.`);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao buscar empresas. Tente novamente.");
      }
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
    const searchNiche = niche === "Personalizado" ? customNiche.trim() : niche;
    link.setAttribute('download', `leads_${city}_${searchNiche.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
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
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Empresas Locais
            </CardTitle>
            <CardDescription>
              Encontre empresas locais por cidade, estado e nicho para prospecção automatizada. 
              O sistema evita duplicatas automaticamente e busca no Google Meus Negócios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Campo Cidade */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Cidade
                </Label>
                <Input 
                  id="city"
                  placeholder="Ex: São Paulo" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              {/* Campo Estado */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Estado (UF)
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {BRAZILIAN_STATES.map((stateOption) => (
                      <SelectItem key={stateOption.code} value={stateOption.code}>
                        {stateOption.code} - {stateOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo Nicho */}
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-sm font-medium">Nicho de negócio</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger id="niche">
                    <SelectValue placeholder="Selecione um nicho" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {NICHES.map((nicheOption) => (
                      <SelectItem key={nicheOption} value={nicheOption}>
                        {nicheOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campo Nicho Personalizado - aparece entre nicho e quantidade */}
            {niche === "Personalizado" && (
              <div className="mb-4">
                <Label htmlFor="customNiche" className="text-sm font-medium">
                  Digite o nicho personalizado
                </Label>
                <Input 
                  id="customNiche"
                  placeholder="Ex: Clínicas de Fisioterapia, Lojas de Móveis, etc." 
                  value={customNiche} 
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Este nicho será usado para buscar empresas no Google Meus Negócios
                </p>
              </div>
            )}

            {/* Campo Quantidade */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantidade</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger id="quantity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {Array.from({ length: 10 }, (_, i) => (i + 1) * 5).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} empresas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botão de busca */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                    Buscando {quantity} empresas...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> 
                    Buscar {quantity} empresas
                  </>
                )}
              </Button>
            </div>

            {/* Informação sobre detecção automática de estado */}
            {city && state && CITY_TO_STATE_MAP[city.toLowerCase().trim()] === state && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ Estado detectado automaticamente: <strong>{state}</strong> para a cidade <strong>{city}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {leads.length > 0 && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <CardTitle>Resultados da Busca</CardTitle>
                <CardDescription>
                  {leads.length} empresas encontradas em {city} - {state}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
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
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar ({selectedCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile view - Cards */}
              <div className="block md:hidden space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={lead.selected} 
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                        id={`lead-mobile-${lead.id}`}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <label 
                          htmlFor={`lead-mobile-${lead.id}`} 
                          className="font-medium text-base cursor-pointer block"
                        >
                          {lead.name}
                        </label>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Nicho:</span> {lead.niche}
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Telefone:</span> {lead.phone}
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Endereço:</span> {lead.address}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Email:</span> {lead.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 w-10"></th>
                      <th className="text-left py-3 px-4">Nome</th>
                      <th className="text-left py-3 px-4">Nicho</th>
                      <th className="text-left py-3 px-4">Endereço</th>
                      <th className="text-left py-3 px-4">Telefone</th>
                      <th className="text-left py-3 px-4">Email</th>
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
                        <td className="py-3 px-4">{lead.address}</td>
                        <td className="py-3 px-4">{lead.phone}</td>
                        <td className="py-3 px-4">
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
