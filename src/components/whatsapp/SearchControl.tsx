
import { Input } from "@/components/ui/input";

interface SearchControlProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchControl({ searchTerm, onSearchChange }: SearchControlProps) {
  return (
    <div className="relative w-full sm:w-auto">
      <Input
        type="search"
        placeholder="Buscar conexões..."
        className="w-full sm:w-[250px]"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
