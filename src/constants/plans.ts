
import { Plan } from "@/types";

export const MONTHLY_PLANS: Plan[] = [
  {
    id: "starter-monthly",
    name: "Plano Iniciante",
    description: "Ideal para começar sua jornada com IA",
    price: 149.9,
    billingCycle: "monthly",
    agentLimit: 3,
    features: [
      "Até 3 agentes",
      "Suporte por email",
      "Painel administrativo básico",
      "Integração com WhatsApp"
    ]
  },
  {
    id: "intermediate-monthly",
    name: "Plano Intermediário",
    description: "Para negócios em crescimento",
    price: 347,
    billingCycle: "monthly",
    agentLimit: 6,
    recommended: true,
    features: [
      "Até 6 agentes",
      "Suporte prioritário",
      "Relatórios avançados",
      "Personalização de agentes",
      "Integração com WhatsApp"
    ]
  },
  {
    id: "professional-monthly",
    name: "Plano Profissional",
    description: "Solução completa para grandes operações",
    price: 997,
    billingCycle: "monthly",
    agentLimit: 20,
    features: [
      "Até 20 agentes",
      "Suporte prioritário 24/7",
      "Relatórios personalizados",
      "API avançada",
      "Integração com WhatsApp",
      "Treinamento da equipe"
    ]
  },
  {
    id: "custom-monthly",
    name: "Plano Personalizado",
    description: "Sob medida para grandes organizações com necessidades exclusivas de IA conversacional",
    price: 0,
    billingCycle: "monthly",
    agentLimit: 50,
    isCustom: true,
    features: [
      "50+ agentes",
      "Atendimento dedicado",
      "Funcionalidades customizadas",
      "API exclusiva",
      "Integração com sistemas empresariais",
      "Treinamento especializado",
      "Personalização de marca completa"
    ]
  }
];

export const ANNUAL_PLANS: Plan[] = [
  {
    id: "starter-annual",
    name: "Plano Iniciante Anual",
    description: "Ideal para começar sua jornada com IA",
    price: 1497,
    billingCycle: "annual",
    agentLimit: 3,
    features: [
      "Até 3 agentes",
      "Suporte por email",
      "Painel administrativo básico",
      "Integração com WhatsApp",
      "Economia de ~20% em relação ao mensal"
    ]
  },
  {
    id: "intermediate-annual",
    name: "Plano Intermediário Anual",
    description: "Para negócios em crescimento",
    price: 3497,
    billingCycle: "annual",
    agentLimit: 6,
    recommended: true,
    features: [
      "Até 6 agentes",
      "Suporte prioritário",
      "Relatórios avançados",
      "Personalização de agentes",
      "Integração com WhatsApp",
      "Economia de ~20% em relação ao mensal"
    ]
  },
  {
    id: "professional-annual",
    name: "Plano Profissional Anual",
    description: "Solução completa para grandes operações",
    price: 9997,
    billingCycle: "annual",
    agentLimit: 20,
    features: [
      "Até 20 agentes",
      "Suporte prioritário 24/7",
      "Relatórios personalizados",
      "API avançada",
      "Integração com WhatsApp",
      "Treinamento da equipe",
      "Economia de ~20% em relação ao mensal"
    ]
  },
  {
    id: "custom-annual",
    name: "Plano Personalizado Anual",
    description: "Sob medida para grandes organizações com necessidades exclusivas de IA conversacional",
    price: 0,
    billingCycle: "annual",
    agentLimit: 50,
    isCustom: true,
    features: [
      "50+ agentes",
      "Atendimento dedicado",
      "Funcionalidades customizadas",
      "API exclusiva",
      "Integração com sistemas empresariais",
      "Treinamento especializado",
      "Personalização de marca completa",
      "Economia de ~20% em relação ao mensal"
    ]
  }
];

export const ALL_PLANS = [...MONTHLY_PLANS, ...ANNUAL_PLANS];

export const getPlanById = (id: string): Plan | undefined => {
  return ALL_PLANS.find(plan => plan.id === id);
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};
