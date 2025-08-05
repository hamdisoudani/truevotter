import { Home, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { Button } from '../ui/button';

export function AppSidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      isActive: false,
    },
    {
      title: 'Settings',
      icon: Settings,
      isActive: false,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">TrueVotter</span>
            <span className="text-xs text-muted-foreground">Vote Tracker</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.isActive}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          {user?.redditAvatarUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.redditAvatarUrl} alt="Reddit Avatar" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.redditUsername ? (
                <span>u/{user.redditUsername} {user.redditKarma && `• ${user.redditKarma} karma`}</span>
              ) : (
                'No Reddit account'
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
