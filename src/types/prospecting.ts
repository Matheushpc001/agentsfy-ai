
export interface ProspectingHistory {
  franchiseeId: string;
  niche: string;
  city: string;
  state: string;
  usedLeadIds: string[];
  lastSearchAt: string;
}

export interface SearchFilters {
  city: string;
  state: string;
  niche: string;
  quantity: number;
}

export interface Lead {
  id: string;
  name: string;
  niche: string;
  address: string;
  phone: string;
  email: string | null;
  selected: boolean;
}

// Estados brasileiros com siglas
export const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" }
];

// Mapeamento de cidades para estados (exemplo com principais cidades)
export const CITY_TO_STATE_MAP: Record<string, string> = {
  // São Paulo
  "são paulo": "SP",
  "campinas": "SP",
  "santos": "SP",
  "ribeirão preto": "SP",
  "sorocaba": "SP",
  "são josé dos campos": "SP",
  "osasco": "SP",
  "santo andré": "SP",
  "são bernardo do campo": "SP",
  
  // Rio de Janeiro
  "rio de janeiro": "RJ",
  "niterói": "RJ",
  "nova iguaçu": "RJ",
  "duque de caxias": "RJ",
  "campos dos goytacazes": "RJ",
  "petrópolis": "RJ",
  "volta redonda": "RJ",
  
  // Minas Gerais
  "belo horizonte": "MG",
  "uberlândia": "MG",
  "contagem": "MG",
  "juiz de fora": "MG",
  "betim": "MG",
  "montes claros": "MG",
  "ribeirão das neves": "MG",
  
  // Bahia
  "salvador": "BA",
  "feira de santana": "BA",
  "vitória da conquista": "BA",
  "camaçari": "BA",
  "juazeiro": "BA",
  "ilhéus": "BA",
  
  // Paraná
  "curitiba": "PR",
  "londrina": "PR",
  "maringá": "PR",
  "ponta grossa": "PR",
  "cascavel": "PR",
  "são josé dos pinhais": "PR",
  
  // Rio Grande do Sul
  "porto alegre": "RS",
  "caxias do sul": "RS",
  "pelotas": "RS",
  "canoas": "RS",
  "santa maria": "RS",
  "gravataí": "RS",
  
  // Goiás
  "goiânia": "GO",
  "aparecida de goiânia": "GO",
  "anápolis": "GO",
  "rio verde": "GO",
  
  // Ceará
  "fortaleza": "CE",
  "caucaia": "CE",
  "juazeiro do norte": "CE",
  "maracanaú": "CE",
  
  // Distrito Federal
  "brasília": "DF",
  
  // Espírito Santo
  "vitória": "ES",
  "vila velha": "ES",
  "cariacica": "ES",
  "serra": "ES",
  
  // Amazonas
  "manaus": "AM",
  
  // Pará
  "belém": "PA",
  "ananindeua": "PA",
  "santarém": "PA",
  
  // Maranhão
  "são luís": "MA",
  "imperatriz": "MA",
  
  // Pernambuco
  "recife": "PE",
  "jaboatão dos guararapes": "PE",
  "olinda": "PE",
  "caruaru": "PE",
  
  // Santa Catarina
  "florianópolis": "SC",
  "joinville": "SC",
  "blumenau": "SC",
  "são josé": "SC"
};
