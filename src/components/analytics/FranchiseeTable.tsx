
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Franchisee {
  name: string;
  agents: number;
  revenue: string;
}

interface FranchiseeTableProps {
  franchisees: Franchisee[];
}

export function FranchiseeTable({ franchisees }: FranchiseeTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Dados por Franqueado</CardTitle>
        <CardDescription>
          Informações básicas por franqueado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3">Franqueado</th>
                <th scope="col" className="px-6 py-3">Nº Agentes</th>
                <th scope="col" className="px-6 py-3">Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {franchisees.map((franchisee, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{franchisee.name}</td>
                  <td className="px-6 py-4">{franchisee.agents}</td>
                  <td className="px-6 py-4">{franchisee.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
