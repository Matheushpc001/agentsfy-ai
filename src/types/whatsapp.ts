
export interface WhatsAppConnection {
  id: string;
  name: string;
  phoneNumber: string;
  customerId: string;
  customerName: string;
  status: "connected" | "disconnected" | "pending";
  lastActive: string;
  messageCount: number;
}

export interface Customer {
  id: string;
  name: string;
}
