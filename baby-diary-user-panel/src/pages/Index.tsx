import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Baby, Image, User, FileImage, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Image,
      title: "Memórias Especiais",
      description: "Capture e preserve os momentos mais preciosos do seu bebê com fotos e descrições detalhadas"
    },
    {
      icon: Baby,
      title: "Marcos do Desenvolvimento",
      description: "Acompanhe e registre cada conquista importante no crescimento do seu pequeno"
    },
    {
      icon: User,
      title: "Rotina Diária",
      description: "Registre atividades como sono, alimentação, brincadeiras e muito mais"
    },
    {
      icon: FileImage,
      title: "Linha do Tempo",
      description: "Visualize o crescimento do seu bebê em uma linha do tempo interativa e organizada"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
      <Header showAuth={true} />
      
      {/* Admin Link */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 hover:bg-white/20 backdrop-blur-sm"
          onClick={() => navigate('/admin/login')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </div>
      
      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 baby-gradient-pink rounded-full flex items-center justify-center animate-bounce-gentle">
            <Baby className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Baby Diary
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            O aplicativo completo para acompanhar o desenvolvimento do seu bebê. 
            Capture memórias, registre marcos e organize a rotina de forma simples e carinhosa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="baby-gradient-pink text-white text-lg px-8 py-4 hover:shadow-xl transition-all duration-300 border-0"
              onClick={() => navigate('/register')}
            >
              Começar Gratuitamente
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/login')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 baby-gradient-blue rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <Card className="glass-card border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Comece a documentar hoje mesmo
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Crie sua conta gratuita e adicione seu primeiro bebê. 
                Você pode começar imediatamente a capturar esses momentos únicos que passam tão rápido.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="baby-gradient-lavender text-white text-lg px-8 py-4 hover:shadow-xl transition-all duration-300 border-0"
                  onClick={() => navigate('/register')}
                >
                  Criar Conta Grátis
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>✨ 1 bebê grátis</span>
                  <span>•</span>
                  <span>📱 Memórias ilimitadas</span>
                  <span>•</span>
                  <span>🎯 Marcos importantes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
