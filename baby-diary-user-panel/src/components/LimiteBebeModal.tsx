import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface LimiteBebeModalProps {
  open: boolean;
  onClose: () => void;
}

export function LimiteBebeModal({ open, onClose }: LimiteBebeModalProps) {
  const navigate = useNavigate();

  const handleNavigateToPlans = () => {
    onClose();
    // Navega para a página de configurações e passa o estado para abrir a aba de planos
    navigate('/settings', { state: { defaultTab: 'plans' } });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-0 rounded-2xl">
          <div className="text-center p-8">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold text-pink-600 justify-center leading-relaxed">Limite de bebê atingido 🍼</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 leading-7">
                Você já adicionou o seu anjinho, mas o plano atual permite apenas 1 bebê.
                <br />
                Para registrar o crescimento de todos os seus filhos com carinho e segurança,
                considere fazer o upgrade para o plano <strong>Premium</strong> ou <strong>Família</strong> 💖
            </p>

            <div className="mt-8 flex justify-center gap-4">
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-6 py-2.5"
                  onClick={handleNavigateToPlans}
                >
                  Ver Planos
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl px-6 py-2.5 border-gray-300 text-gray-600"
                  onClick={onClose}
                >
                  Agora não
                </Button>
            </div>
          </div>
        </DialogContent>
    </Dialog>
  );
} 