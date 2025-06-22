import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import EditProfileModal from "@/components/EditProfileModal";
import EditBabyModal from "@/components/EditBabyModal";
import AddBabyModal from "@/components/AddBabyModal";
import { User, Baby, LogOut, Palette, Plus, Edit, Trash2, Camera, Settings as SettingsIcon, Users, Shield, CheckCircle, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { logout, getPublicPlans, createCheckoutSession, cancelUserSubscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import AIUsageStatsCard from '../components/AIUsageStatsCard';
import UpgradePrompt from "@/components/UpgradePrompt";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, getBgClass, getGradientClass } = useTheme();
  const { user, babies, isLoading, refetch, userPlan } = useAuth();
  const { toast } = useToast();
  
  // Estados dos modais
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditBabyOpen, setIsEditBabyOpen] = useState(false);
  const [isAddBabyOpen, setIsAddBabyOpen] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "profile");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await getPublicPlans();
        if (response.success) {
          setPlans(response.plans);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível buscar os planos de assinatura.",
          variant: "destructive",
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubscription = async (planId: string) => {
    setIsSubscribing(planId);
    try {
      const successUrl = `${window.location.origin}/dashboard?subscription=success`;
      const cancelUrl = window.location.href;

      const response = await createCheckoutSession({ planId, successUrl, cancelUrl });

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error || 'Não foi possível iniciar o checkout.');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar assinatura",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const result = await cancelUserSubscription();
      if (result.success) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura será cancelada ao final do período vigente.",
        });
        await refetch();
      } else {
        throw new Error(result.error || "Erro ao cancelar assinatura");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleEditBaby = (baby: any) => {
    setSelectedBaby(baby);
    setIsEditBabyOpen(true);
  };

  const handleDeleteBaby = async (babyId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/user/babies/${babyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Bebê removido com sucesso",
          description: "O bebê foi removido da sua conta",
        });
        await refetch(); // Atualiza o estado global
      } else {
        throw new Error("Erro ao remover bebê");
      }
    } catch (error) {
      toast({
        title: "Erro ao remover bebê",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    await refetch();
    setIsEditProfileOpen(false);
  };

  const handleBabyUpdate = async () => {
    await refetch();
    setIsEditBabyOpen(false);
    setSelectedBaby(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddBaby = async () => {
    await refetch();
    setIsAddBabyOpen(false);
  };

  // Mostra loading enquanto carrega os dados
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não renderiza nada (será redirecionado pelo ProtectedRoute)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
      <Header />
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/dashboard" />
          <div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme === 'blue' ? 'from-blue-600 to-cyan-600' : 'from-pink-600 to-rose-600'} bg-clip-text text-transparent`}>
              Configurações
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie sua conta, bebês e preferências
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="babies" className="flex items-center gap-2">
              <Baby className="w-4 h-4" />
              Bebês ({babies?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Planos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Meu Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src={`${user.avatarUrl || "/placeholder.svg"}?t=${Date.now()}`}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome</label>
                        <p className="font-semibold text-lg">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                        <p className="font-semibold text-lg">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Plano Atual</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {userPlan?.name || 'Não disponível'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
                        <p className="font-semibold">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsEditProfileOpen(true)}
                    className={`${getGradientClass()} text-white border-0`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>
                {/* Formulário de troca de senha */}
                <div className="mt-8 max-w-md">
                  <h3 className="text-lg font-semibold mb-2">Alterar senha</h3>
                  <ChangePasswordForm />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Bebês */}
          <TabsContent value="babies" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Meus Bebês</h2>
                <p className="text-muted-foreground">
                  Gerencie os bebês da sua família
                </p>
              </div>
              <Button 
                onClick={() => setIsAddBabyOpen(true)}
                className={`${getGradientClass()} text-white border-0`}
                disabled={babies && babies.length >= 5}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bebê
              </Button>
            </div>

            {babies && babies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {babies.map((baby: any) => (
                  <Card key={baby.id} className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <img 
                            src={baby.photoUrl || "/placeholder.svg"} 
                            alt={baby.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0"
                            onClick={() => handleEditBaby(baby)}
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{baby.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {baby.gender === 'male' ? 'Menino' : baby.gender === 'female' ? 'Menina' : 'Outro'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(baby.birthDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditBaby(baby)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover bebê</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover {baby.name}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBaby(baby.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum bebê cadastrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Adicione seu primeiro bebê para começar a usar o Baby Diary
                  </p>
                  <Button 
                    onClick={() => setIsAddBabyOpen(true)}
                    className={`${getGradientClass()} text-white border-0`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Bebê
                  </Button>
                </CardContent>
              </Card>
            )}

            {babies && babies.length >= 5 && (
              <div className="mb-6">
                <UpgradePrompt
                  title="Limite de bebês atingido! 🍼"
                  description="Você atingiu o limite de bebês do plano gratuito. Faça upgrade para adicionar mais bebês à sua família."
                  limit="5 bebês (plano gratuito)"
                  variant="family"
                />
              </div>
            )}
          </TabsContent>

          {/* Tab: Aparência */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Tema do App
                </CardTitle>
                <CardDescription>
                  Escolha a cor principal do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={theme === 'blue' ? 'default' : 'outline'}
                    onClick={() => setTheme('blue')}
                    className={`h-24 flex flex-col items-center justify-center gap-3 ${
                      theme === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full" />
                    <span className={theme === 'blue' ? 'text-white' : ''}>Azul</span>
                  </Button>
                  <Button
                    variant={theme === 'pink' ? 'default' : 'outline'}
                    onClick={() => setTheme('pink')}
                    className={`h-24 flex flex-col items-center justify-center gap-3 ${
                      theme === 'pink' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-pink-500 rounded-full" />
                    <span className={theme === 'pink' ? 'text-white' : ''}>Rosa</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Planos */}
          <TabsContent value="plans" className="space-y-6">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Nossos Planos
                </CardTitle>
                <CardDescription>
                  Escolha o plano que melhor se adapta às suas necessidades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlans ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando planos...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`rounded-2xl p-6 flex flex-col border-2 shadow-lg transition-all ${
                          userPlan?.id === plan.id ? 'border-blue-500 scale-105 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <h3 className="text-xl font-bold text-center mb-2">{plan.name}</h3>
                        <div className="text-center mb-4">
                          <span className="text-3xl font-extrabold">R$ {plan.price.toFixed(2)}</span>
                          <span className="text-muted-foreground">/mês</span>
                        </div>
                        <ul className="space-y-3 mb-6 flex-grow">
                          {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.name !== 'Básico' && (
                            <li className="flex items-start gap-2 text-blue-600 font-medium">
                              <Shield className="w-5 h-5 mt-1 flex-shrink-0" />
                              Cancele quando quiser, sem burocracia
                            </li>
                          )}
                        </ul>
                        <Button
                          onClick={() => handleSubscription(plan.id)}
                          disabled={userPlan?.id === plan.id || isSubscribing !== null}
                          className={`w-full font-bold ${getGradientClass()} text-white`}
                        >
                          {userPlan?.id === plan.id ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Plano Atual
                            </>
                          ) : isSubscribing === plan.id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Redirecionando...
                            </>
                          ) : (
                            <>
                              <Star className="w-5 h-5 mr-2" />
                              Fazer Upgrade
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Seção de Analytics de IA */}
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Configurações</h1>
          <div className="mb-8 animate-fade-in">
            <AIUsageStatsCard />
          </div>
        </div>

        {/* Botão de cancelar assinatura no rodapé */}
        {userPlan && userPlan.name !== 'Básico' && (
          <div className="container max-w-lg mx-auto py-8 flex flex-col items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full max-w-xs">
                  Cancelar assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso ao plano até o fim do período já pago.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                    Cancelar assinatura
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />

      <EditBabyModal
        isOpen={isEditBabyOpen}
        onClose={() => setIsEditBabyOpen(false)}
        baby={selectedBaby}
        onUpdate={handleBabyUpdate}
      />

      <AddBabyModal
        isOpen={isAddBabyOpen}
        onClose={() => setIsAddBabyOpen(false)}
        onAdd={handleAddBaby}
      />
    </div>
  );
};

export default Settings;
