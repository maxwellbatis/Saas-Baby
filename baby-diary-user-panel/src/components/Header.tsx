import { Button } from "@/components/ui/button";
import { User, Baby, LogOut } from "lucide-react";
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
  const { getGradientClass, getColorClass } = useTheme();
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className={`w-8 h-8 ${getGradientClass()} rounded-full flex items-center justify-center`}>
            <Baby className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-xl bg-gradient-to-r ${getColorClass()} bg-clip-text text-transparent`}>
            Baby Diary
          </span>
        </div>

        {showAuth && (
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="flex items-center space-x-2 bg-baby-pink rounded-full px-3 py-2 cursor-pointer" onClick={() => navigate('/settings')}>
                  {user.avatarUrl ? (
                    <img 
                      src={`${user.avatarUrl}?t=${Date.now()}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-pink-600" />
                  )}
                  <span className="text-sm font-medium text-pink-800">{user.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/register')} 
                  className={`${getGradientClass()} text-white border-0 hover:shadow-lg transition-all duration-300`}
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
