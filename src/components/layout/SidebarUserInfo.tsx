
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SidebarUserInfo() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'franchisee':
        return 'default';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'franchisee':
        return 'Franqueado';
      case 'customer':
        return 'Cliente';
      default:
        return role;
    }
  };

  return (
    <Card className="mt-auto">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <Badge 
                variant={getRoleBadgeVariant(user.role)} 
                className="text-xs mt-1"
              >
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0 flex-shrink-0 ml-2"
            title="Sair"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
