# Project Context for Qwen Code

## Project Overview

This project is a web application built with modern web technologies, specifically designed for managing AI agents and related services. It's a multi-role platform catering to administrators, franchisees, and customers.

### Main Technologies

*   **Frontend Framework:** React with TypeScript
*   **Build Tool:** Vite
*   **Routing:** React Router DOM
*   **UI Components:** shadcn/ui, Tailwind CSS
*   **State Management & Data Fetching:** TanStack Query (React Query)
*   **Authentication & Backend:** Supabase (Authentication, Database)
*   **Additional Libraries:** Various UI component libraries from Radix UI, utility libraries like `uuid`, `zod`, `react-hook-form`, charting with `recharts`, etc.

### Architecture

*   **Structure:** The application follows a standard React/Vite project structure with `src` containing the main application code.
*   **Routing:** Uses React Router DOM for client-side routing with protected routes based on user roles (admin, franchisee, customer).
*   **Authentication:** Centralized authentication logic using Supabase and a React Context (`AuthContext`) to manage user state and session.
*   **Data:** Interacts with a Supabase backend for user profiles, roles, agents, customers, franchisees, plans, WhatsApp connections, and other application data.
*   **UI:** Leverages shadcn/ui components styled with Tailwind CSS. Custom theming is configured in `tailwind.config.ts`.

### Key Features

*   **Role-Based Access Control:** Different dashboards and functionalities for admins, franchisees, and customers.
*   **AI Agent Management:** Allows customers to configure and manage their AI agents.
*   **WhatsApp Integration:** Manages WhatsApp connections for agents.
*   **Scheduling:** Provides scheduling capabilities for franchisees and customers.
*   **Analytics:** Displays analytics data for admins and potentially franchisees.
*   **User Management:** Handles authentication, login, logout, and password updates.

## Building and Running

### Prerequisites

*   Node.js & npm (or bun, as `bun.lockb` is present)

### Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

### Development

*   Start the development server with hot reloading:
    ```bash
    npm run dev
    # or
    bun run dev
    ```
    This uses Vite to serve the application, typically on `http://localhost:8080`.

### Building

*   Create a production build:
    ```bash
    npm run build
    # or
    bun run build
    ```
*   Create a development build:
    ```bash
    npm run build:dev
    # or
    bun run build:dev
    ```

### Linting

*   Run ESLint to check for code issues:
    ```bash
    npm run lint
    # or
    bun run lint
    ```

### Previewing Build

*   Preview the production build locally:
    ```bash
    npm run preview
    # or
    bun run preview
    ```

## Development Conventions

*   **Language:** TypeScript is used throughout the project for type safety.
*   **Component Structure:** Components are primarily located in `src/components` and follow a pattern compatible with shadcn/ui.
*   **Pages:** Application pages are located in `src/pages`, organized by role (admin, franchisee, customer) where applicable.
*   **Context:** React Context (`AuthContext`) is used for managing global state like authentication.
*   **Data Fetching:** TanStack Query is used for server state management, providing caching, background updates, and other features.
*   **Styling:** Tailwind CSS is used for styling, with custom configurations in `tailwind.config.ts`.
*   **Aliases:** The `@` alias is configured to point to the `src` directory for cleaner imports.
*   **Routing:** Routes are defined in `App.tsx` with protection logic implemented via the `ProtectedRoute` component.
