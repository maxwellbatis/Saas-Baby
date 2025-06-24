import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Share2, Copy, Mail, MessageCircle, Link, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: any;
  type?: 'activity' | 'memory' | 'milestone';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  activity,
  type = 'activity'
}) => {
  const [shareLink, setShareLink] = useState('');
  const [includePhoto, setIncludePhoto] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Simular geração de link (implementar com backend)
      const link = `https://babydiary.shop/share/${type}/${activity?.id || 'demo'}`;
      setShareLink(link);
      
      toast({
        title: "Link gerado!",
        description: "Link de compartilhamento criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link de compartilhamento.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `${customMessage}\n\n${activity?.title || 'Confira esta atividade do meu bebê!'}\n\n${shareLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Atividade do meu bebê - Baby Diary');
    const body = encodeURIComponent(
      `${customMessage}\n\n${activity?.title || 'Confira esta atividade do meu bebê!'}\n\n${shareLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const downloadImage = () => {
    // Implementar download da imagem da atividade/memória
    toast({
      title: "Download",
      description: "Funcionalidade de download em desenvolvimento.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar {type === 'activity' ? 'Atividade' : type === 'memory' ? 'Memória' : 'Marco'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview da atividade */}
          {activity && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{activity.title}</h4>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(activity.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          {/* Opções de compartilhamento */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-photo"
                checked={includePhoto}
                onCheckedChange={setIncludePhoto}
              />
              <Label htmlFor="include-photo">Incluir foto</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem personalizada..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Gerar link */}
            <div className="space-y-2">
              <Button 
                onClick={generateShareLink} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
              </Button>
            </div>

            {/* Link gerado */}
            {shareLink && (
              <div className="space-y-2">
                <Label>Link de compartilhamento</Label>
                <div className="flex space-x-2">
                  <Input value={shareLink} readOnly />
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Botões de compartilhamento */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={shareViaWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={shareViaEmail}>
                <Mail className="w-4 h-4 mr-2" />
                E-mail
              </Button>
            </div>

            <Button variant="outline" onClick={downloadImage} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar Imagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 