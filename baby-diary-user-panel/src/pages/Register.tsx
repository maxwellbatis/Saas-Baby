import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Baby } from "lucide-react";
import { register as apiRegister } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
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
      const response = await apiRegister({ name, email, password });
      
      // Verificar se o registro foi bem-sucedido
      if (response.success) {
        // Verificar se o token foi salvo no localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Aguardar um pouco para garantir que o token foi salvo
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Atualiza o estado global
          await refetch();
          
          toast({
            title: "Conta criada com sucesso!",
            description: "Agora vamos adicionar seu bebê",
          });
          
          // Redirecionar para onboarding
          navigate('/onboarding');
        } else {
          throw new Error('Token não foi salvo');
        }
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (err: any) {
      // Extrair mensagem de erro específica do backend
      let errorMessage = 'Erro no cadastro';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-lavender via-baby-mint to-baby-peach">
      <Header showAuth={false} />
      
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 baby-gradient-lavender rounded-full flex items-center justify-center mb-4 animate-bounce-gentle">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Crie sua conta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Comece a documentar os momentos especiais do seu bebê
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-muted-foreground/20 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

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
                    className="border-muted-foreground/20 focus:border-purple-400 focus:ring-purple-400/20"
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
                    className="border-muted-foreground/20 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full baby-gradient-lavender text-white font-medium py-3 hover:shadow-lg transition-all duration-300 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta grátis"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-purple-600 hover:text-purple-700 font-medium underline"
                  >
                    Faça login
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

export default Register;
