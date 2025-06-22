import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Baby } from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiLogin({ email, password });
      
      // Atualiza o estado global
      await refetch();
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vinda de volta ao Baby Diary",
      });
      
      // O redirecionamento será feito automaticamente pelo ProtectedRoute
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: "Erro no login",
        description: err.message || "Por favor, verifique suas credenciais",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
      <Header showAuth={false} />
      
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 baby-gradient-pink rounded-full flex items-center justify-center mb-4 animate-bounce-gentle">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Bem-vinda de volta!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre na sua conta para acompanhar o desenvolvimento do seu bebê
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-muted-foreground/20 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-muted-foreground/20 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full baby-gradient-pink text-white font-medium py-3 hover:shadow-lg transition-all duration-300 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Esqueci minha senha?
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Ainda não tem uma conta?{" "}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-pink-600 hover:text-pink-700 font-medium underline"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
