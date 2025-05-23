
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot } from "lucide-react";

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
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Franqueado</TableHead>
                <TableHead className="text-center">Nº Agentes</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((franchisee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{franchisee.name}</TableCell>
                  <TableCell className="text-center">{franchisee.agents}</TableCell>
                  <TableCell className="text-right font-medium">{franchisee.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {franchisees.map((franchisee, index) => (
            <div 
              key={index} 
              className="flex items-center p-4 rounded-lg border bg-gray-50 dark:bg-gray-800"
            >
              <div className="mr-3 h-10 w-10 rounded-full bg-sky-600/10 flex items-center justify-center">
                <Bot size={20} className="text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{franchisee.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {franchisee.agents} agentes
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {franchisee.revenue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
