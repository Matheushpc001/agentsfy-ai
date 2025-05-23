
import { Lead, ProspectingHistory } from "@/types/prospecting";

class ProspectingService {
  private static STORAGE_KEY = 'prospecting_history';

  // Obter histórico de prospecção do localStorage
  static getProspectingHistory(): ProspectingHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading prospecting history:', error);
      return [];
    }
  }

  // Salvar histórico de prospecção
  static saveProspectingHistory(history: ProspectingHistory[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving prospecting history:', error);
    }
  }

  // Obter IDs de leads já utilizados para um franqueado/nicho/cidade/estado específico
  static getUsedLeadIds(franchiseeId: string, niche: string, city: string, state: string): string[] {
    const history = this.getProspectingHistory();
    const entry = history.find(h => 
      h.franchiseeId === franchiseeId && 
      h.niche === niche && 
      h.city.toLowerCase() === city.toLowerCase() && 
      h.state === state
    );
    return entry ? entry.usedLeadIds : [];
  }

  // Adicionar novos IDs de leads utilizados
  static addUsedLeadIds(franchiseeId: string, niche: string, city: string, state: string, newLeadIds: string[]): void {
    const history = this.getProspectingHistory();
    const existingIndex = history.findIndex(h => 
      h.franchiseeId === franchiseeId && 
      h.niche === niche && 
      h.city.toLowerCase() === city.toLowerCase() && 
      h.state === state
    );

    if (existingIndex >= 0) {
      // Atualizar entrada existente
      history[existingIndex].usedLeadIds = [...new Set([...history[existingIndex].usedLeadIds, ...newLeadIds])];
      history[existingIndex].lastSearchAt = new Date().toISOString();
    } else {
      // Criar nova entrada
      history.push({
        franchiseeId,
        niche,
        city: city.toLowerCase(),
        state,
        usedLeadIds: newLeadIds,
        lastSearchAt: new Date().toISOString()
      });
    }

    this.saveProspectingHistory(history);
  }

  // Simular busca de leads com exclusão de duplicatas
  static async fetchUniqueLeads(
    franchiseeId: string, 
    niche: string, 
    city: string, 
    state: string, 
    quantity: number
  ): Promise<Lead[]> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Obter IDs já utilizados
    const usedIds = this.getUsedLeadIds(franchiseeId, niche, city, state);
    
    // Gerar leads simulados
    const allPossibleLeads = Array.from({ length: 100 }, (_, i) => ({
      id: `lead-${niche.replace(/\s/g, '')}-${city.replace(/\s/g, '')}-${state}-${i}`,
      name: `${niche} ${i + 1} em ${city}`,
      niche,
      address: `Rua Principal, ${i * 123}, ${city} - ${state}`,
      phone: `+5511${Math.floor(90000000 + Math.random() * 9999999)}`,
      email: Math.random() > 0.3 ? `contato${i}@empresa${i}.com` : null,
      selected: false
    }));

    // Filtrar leads não utilizados
    const availableLeads = allPossibleLeads.filter(lead => !usedIds.includes(lead.id));
    
    // Verificar se há leads suficientes disponíveis
    if (availableLeads.length === 0) {
      throw new Error('Não há mais empresas disponíveis para este nicho nesta cidade. Tente outra cidade ou nicho.');
    }

    // Retornar a quantidade solicitada (ou o que estiver disponível)
    const selectedLeads = availableLeads.slice(0, Math.min(quantity, availableLeads.length));
    
    // Registrar os IDs utilizados
    this.addUsedLeadIds(franchiseeId, niche, city, state, selectedLeads.map(lead => lead.id));
    
    return selectedLeads;
  }
}

export default ProspectingService;
