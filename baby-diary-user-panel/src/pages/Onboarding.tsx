import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { Baby } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import GrowthMeasurements from '@/components/GrowthMeasurements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_CONFIG } from '../config/api';

const Onboarding = () => {
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [babyImage, setBabyImage] = useState<File | null>(null);
  const [babyImageUrl, setBabyImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, getBgClass, getGradientClass } = useTheme();
  const { user, refetch } = useAuth();
  const [createdBabyId, setCreatedBabyId] = useState<string | null>(null);
  const [showGrowthModal, setShowGrowthModal] = useState(false);

  const handleImageSelect = (file: File | null) => {
    setBabyImage(file);
    if (file) {
      setBabyImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let photoUrl = "";
      
      if (babyImage) {
        const formData = new FormData();
        formData.append("image", babyImage);
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Erro ao fazer upload da foto");
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.data?.url || "";
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/user/babies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: babyName,
          birthDate,
          gender,
          photoUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar bebê");
      
      const data = await res.json();
      const babyId = data.data?.id;
      setCreatedBabyId(babyId);
      setShowGrowthModal(true);
      await refetch();
      
      toast({
        title: "Bebê adicionado com sucesso!",
        description: `Bem-vindo(a) ${babyName} ao Baby Diary! 🎉`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao adicionar bebê",
        description: err.message || "Erro ao processar requisição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
      <Header />
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="w-full max-w-lg animate-fade-in">
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className={`mx-auto w-20 h-20 ${getGradientClass()} rounded-full flex items-center justify-center mb-4 animate-bounce-gentle`}>
                <Baby className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`text-3xl font-bold bg-gradient-to-r ${theme === 'blue' ? 'from-blue-600 to-cyan-600' : 'from-pink-600 to-rose-600'} bg-clip-text text-transparent`}>
                Vamos conhecer seu bebê!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Adicione as informações do seu pequeno para começar a jornada.<br />
                <span className="text-sm text-gray-500">Se preferir, você pode pular esta etapa e adicionar o bebê depois nas configurações.<br />O app pode ser usado desde a gestação!</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-500 hover:text-primary border-0 px-2 py-1 text-sm"
                    onClick={() => navigate('/dashboard', { replace: true })}
                  >
                    Pular e adicionar depois
                  </Button>
                </div>
                <div className="flex justify-center">
                  <ImageUpload
                    currentImage={babyImageUrl}
                    onImageSelect={handleImageSelect}
                    size="lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="babyName" className="text-sm font-medium">
                    Nome do bebê *
                  </Label>
                  <Input
                    id="babyName"
                    type="text"
                    placeholder="Nome do seu bebê"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    required
                    className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium">
                    Data de nascimento *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20`}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sexo *</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "Menino", gradient: "baby-gradient-blue" },
                      { value: "female", label: "Menina", gradient: "baby-gradient-pink" },
                      { value: "other", label: "Outro", gradient: "baby-gradient-lavender" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                          gender === option.value
                            ? `${option.gradient} text-white border-transparent shadow-lg`
                            : `bg-white/50 border-muted text-muted-foreground hover:border-${theme === 'blue' ? 'blue' : 'pink'}-300`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  className={`w-full ${getGradientClass()} text-white font-medium py-4 text-lg hover:shadow-lg transition-all duration-300 border-0`}
                  disabled={isLoading}
                >
                  {isLoading ? "Adicionando bebê..." : "Adicionar meu bebê"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de medidas de crescimento após cadastro do bebê */}
      <Dialog open={showGrowthModal && !!createdBabyId} onOpenChange={setShowGrowthModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar medidas de crescimento</DialogTitle>
          </DialogHeader>
          {createdBabyId && (
            <GrowthMeasurements babyId={createdBabyId} canEdit={true} />
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => { setShowGrowthModal(false); navigate('/dashboard', { replace: true }); }}>
              Pular e adicionar depois
            </Button>
            <Button className="ml-2" onClick={() => { setShowGrowthModal(false); navigate('/dashboard', { replace: true }); }}>
              Ir para o dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
