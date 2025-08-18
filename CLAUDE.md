# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Linting**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture Overview

This is a React-TypeScript SaaS application for managing AI agents and WhatsApp integrations, built on a franchisee-customer hierarchy model.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: React Query (@tanstack/react-query) + React Context
- **Routing**: React Router v6 with role-based protection
- **External Integrations**: Evolution API (WhatsApp), OpenAI, Anthropic AI

### User Role System
Three distinct user roles with separate dashboards and permissions:
- **Admin**: System-wide management (franchisees, analytics, lessons, Evolution config)
- **Franchisee**: Customer management, agent creation, WhatsApp connections, campaigns
- **Customer**: AI agent configuration, scheduling, portal access

### Key Architectural Patterns

#### Authentication & Authorization
- Supabase Auth with custom role-based access control
- User profiles stored in `profiles` table with roles in `user_roles` table
- Role-based route protection via `ProtectedRoute` component
- Auth context manages user state and role resolution

#### Component Structure
- **Pages**: Role-specific pages in `/pages/{role}/`
- **Layout**: `DashboardLayout` with responsive sidebar navigation
- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Business Components**: Feature-specific components grouped by domain

#### Data Management
- React Query for server state management with 5-minute stale time
- Custom hooks for data fetching (e.g., `useDashboardData`, `useAgentManagement`)
- Supabase client configured with auto-refresh and persistent sessions

#### WhatsApp Integration (Evolution API)
- Supabase Edge Functions handle Evolution API communication
- QR code generation and connection management
- Webhook processing for message handling
- Instance management for multiple WhatsApp connections

### Key Directories

- `/src/pages/`: Role-based page components
- `/src/components/`: Reusable UI and business components
- `/src/hooks/`: Custom React hooks for data and state management
- `/src/types/`: TypeScript interfaces and type definitions
- `/src/integrations/supabase/`: Supabase client and type definitions
- `/src/services/`: API service layers
- `/supabase/functions/`: Edge Functions for external API integrations
- `/supabase/migrations/`: Database schema migrations

### Database Integration
- Supabase project: `kzxiqdakyfxtyyuybwtl`
- Row Level Security (RLS) policies for data access control
- Real-time subscriptions for live updates
- Edge Functions for secure API key handling and external integrations

### Development Notes
- No test framework is currently configured
- Uses Vite with React SWC for fast development
- Path aliases configured with `@/` pointing to `src/`
- Mobile-responsive design with viewport meta tag injection
- Development tools: ESLint for code quality
- pensar em ingles sempre mas responder sempre em pt-br portugues brasil
- ao tetnar instalar uma lib, biblioteca ou dependencias, analisar antes se ela ja nao esta instalada, se estiver instalada nao reinstale