
import DashboardLayout from "@/components/layout/DashboardLayout";
import AgentsContainer from "@/components/agents/AgentsContainer";
import { MOCK_AGENTS, MOCK_CUSTOMERS } from "@/mocks/franchiseeMockData";

// We'll need the uuid package for prompt IDs
import { v4 as uuidv4 } from 'uuid';

export default function Agents() {
  return (
    <DashboardLayout title="Agentes">
      <AgentsContainer 
        initialAgents={MOCK_AGENTS}
        initialCustomers={MOCK_CUSTOMERS}
      />
    </DashboardLayout>
  );
}
