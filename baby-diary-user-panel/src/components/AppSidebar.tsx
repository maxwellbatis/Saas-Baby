import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Camera, 
  Trophy, 
  Activity, 
  Settings, 
  Baby,
  Palette,
  LogOut,
  ShoppingBag,
  BookOpen
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, getGradientClass } = useTheme();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Memórias",
      url: "/memories",
      icon: Camera,
    },
    {
      title: "Marcos",
      url: "/milestones",
      icon: Trophy,
    },
    {
      title: "Atividades",
      url: "/activities",
      icon: Activity,
    },
    {
      title: "Saúde",
      url: "/health",
      icon: Activity,
    },
    {
      title: "Cursos",
      url: "/courses",
      icon: BookOpen,
    },
    {
      title: "Loja",
      url: "/loja",
      icon: ShoppingBag,
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('baby');
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 ${getGradientClass()} rounded-full flex items-center justify-center`}>
            <Baby className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg bg-gradient-to-r ${theme === 'blue' ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-500'} bg-clip-text text-transparent`}>
            Baby Diary
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={
                      item.url === '/loja'
                        ? location.pathname.startsWith('/loja')
                        : location.pathname === item.url
                    }
                  >
                    <button onClick={() => navigate(item.url)} className="w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tema</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex gap-2 px-2">
              <Button
                variant={theme === 'blue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('blue')}
                className="flex-1"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                Azul
              </Button>
              <Button
                variant={theme === 'pink' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('pink')}
                className="flex-1"
              >
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2" />
                Rosa
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
