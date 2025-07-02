import { Button } from "@/components/ui/button";
import { User, Baby, LogOut, Shield, Package, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/api";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  showAuth?: boolean;
}

const Header = ({ showAuth = true }: HeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 netflix-transition">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer netflix-hover"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 netflix-gradient rounded-full flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl netflix-text-gradient">
            Baby Diary
          </span>
        </div>

        {showAuth && (
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground netflix-transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/meus-pedidos')}
                  className="text-muted-foreground hover:text-foreground netflix-transition"
                >
                  <Package className="w-4 h-4 mr-1.5" />
                  Meus Pedidos
                </Button>
                <div 
                  className="flex items-center space-x-2 bg-primary/10 rounded-full px-3 py-2 cursor-pointer netflix-hover netflix-transition" 
                  onClick={() => navigate('/settings')}
                >
                  {user.avatarUrl ? (
                    <img 
                      src={`${user.avatarUrl}?t=${Date.now()}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground netflix-transition"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin/login')}
                  className="text-muted-foreground hover:text-foreground netflix-transition"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-muted-foreground hover:text-foreground netflix-transition"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/register')} 
                  className="netflix-button"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
