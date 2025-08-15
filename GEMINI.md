# Análise do Projeto: agentsfy-ai

Este documento resume a análise do projeto `agentsfy-ai`, com base nos arquivos de configuração, código-fonte e estrutura de diretórios.

## 1. Visão Geral do Projeto

O projeto é uma aplicação web moderna, construída como uma plataforma SaaS (Software as a Service) multi-tenant. A aplicação parece ser focada no gerenciamento de agentes de IA, possivelmente para vendas e atendimento ao cliente, com uma forte integração com WhatsApp.

A arquitetura é bem definida com uma clara separação de papéis de usuário:
- **Admin:** Gerencia franqueados, visualiza análises globais e configura o sistema.
- **Franchisee (Franqueado):** Gerencia seus próprios clientes, agentes de IA, prompts, planos e conexões com o WhatsApp.
- **Customer (Cliente):** Utiliza os agentes de IA configurados pelo franqueado.

## 2. Tecnologias Utilizadas

- **Frontend Framework:** React
- **Linguagem:** TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn-ui, utilizando Radix UI para primitivos de componentes acessíveis.
- **Estilização:** Tailwind CSS
- **Roteamento:** React Router DOM
- **Gerenciamento de Estado e Dados:** TanStack React Query para data fetching e caching.
- **Formulários:** React Hook Form com Zod para validação de schemas.
- **Backend e Banco de Dados:** Supabase (incluindo Autenticação, Banco de Dados Postgres e Funções Serverless).

## 3. Estrutura do Código

- **Ponto de Entrada:** `src/main.tsx` renderiza o componente principal `App.tsx`.
- **Componente Principal (`App.tsx`):** Configura os providers essenciais (React Query, AuthContext, TooltipProvider) e o sistema de roteamento.
- **Roteamento:** O roteamento é baseado em arquivos e papéis de usuário, protegido por um componente `ProtectedRoute` que verifica a autenticação e a role do usuário (`admin`, `franchisee`, `customer`).
- **Componentes:** A pasta `src/components` é organizada por funcionalidade (ex: `agents`, `analytics`, `dashboard`) e contém uma subpasta `ui` para os componentes do shadcn-ui.
- **Hooks:** A pasta `src/hooks` contém hooks customizados para encapsular lógica de negócio e de estado, como `useAgentManagement` e `useAuthCheck`.
- **Serviços:** A pasta `src/services` provavelmente contém a lógica de comunicação com a API do Supabase.
- **Backend (Supabase):** A pasta `supabase` na raiz do projeto contém migrações de banco de dados e código para as funções serverless, indicando uma integração profunda com a plataforma Supabase.

## 4. Funcionalidades Principais Identificadas

- **Gerenciamento de Agentes:** Criação, configuração e monitoramento de agentes de IA.
- **Biblioteca de Prompts:** Um sistema para criar e gerenciar prompts para os agentes.
- **Multi-tenancy:** Sistema hierárquico de Admin > Franqueado > Cliente.
- **Integração com WhatsApp:** Funcionalidades para conectar e gerenciar instâncias do WhatsApp.
- **Analytics:** Dashboards com gráficos para visualização de métricas de uso e faturamento.
- **Sistema de Aulas/Treinamento:** Uma seção de "Lessons" para os usuários.
- **Autenticação e Autorização:** Controle de acesso robusto baseado em papéis.
