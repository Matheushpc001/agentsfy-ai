
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface SidebarUserInfoProps {
  isCollapsed: boolean;
  isMobile: boolean;
}

export function SidebarUserInfo({ isCollapsed, isMobile }: SidebarUserInfoProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between">
        <h2 className={`mb-2 text-sm font-semibold tracking-tight transition-all duration-300 ease-in-out ${isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          Painel
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
