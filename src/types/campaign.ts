
export interface Campaign {
  id: string;
  name: string;
  totalContacts: number;
  sentMessages: number;
  failedMessages: number;
  status: "running" | "paused" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}
