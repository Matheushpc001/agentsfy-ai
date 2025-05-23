
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/whatsapp";

interface CustomerFilterProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string | null) => void;
}

export default function CustomerFilter({
  customers,
  selectedCustomerId,
  onSelectCustomer
}: CustomerFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={!selectedCustomerId ? "secondary" : "outline"} 
        size="sm"
        onClick={() => onSelectCustomer(null)}
      >
        Todos os clientes
      </Button>
      
      {customers.map(customer => (
        <Button
          key={customer.id}
          variant={selectedCustomerId === customer.id ? "secondary" : "outline"}
          size="sm"
          onClick={() => onSelectCustomer(customer.id)}
        >
          {customer.name}
        </Button>
      ))}
    </div>
  );
}
