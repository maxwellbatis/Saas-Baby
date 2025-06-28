import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { MediaUpload } from '../../../components/MediaUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Link,
  Image,
  Palette
} from 'lucide-react';
import { adminBanners } from '../../../lib/adminApi';
import { useToast } from '../../../hooks/use-toast';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  bgGradient?: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  targetType?: string;
  targetId?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export const BannersLoja: React.FC = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    bgGradient: 'bg-gradient-to-r from-pink-400 to-purple-500',
    ctaText: '',
    ctaLink: '',
    badge: '',
    isActive: true,
    sortOrder: 0,
    startDate: '',
    endDate: '',
    targetUrl: '',
    targetType: 'external',
    targetId: '',
    location: 'loja'
  });

  const gradientOptions = [
    { value: 'bg-gradient-to-r from-pink-400 to-purple-500', label: 'Rosa para Roxo' },
    { value: 'bg-gradient-to-r from-blue-400 to-indigo-500', label: 'Azul para Índigo' },
    { value: 'bg-gradient-to-r from-green-400 to-teal-500', label: 'Verde para Teal' },
    { value: 'bg-gradient-to-r from-yellow-400 to-orange-500', label: 'Amarelo para Laranja' },
    { value: 'bg-gradient-to-r from-red-400 to-pink-500', label: 'Vermelho para Rosa' },
    { value: 'bg-gradient-to-r from-purple-400 to-pink-500', label: 'Roxo para Rosa' },
    { value: 'bg-gradient-to-r from-indigo-400 to-purple-500', label: 'Índigo para Roxo' },
    { value: 'bg-gradient-to-r from-teal-400 to-blue-500', label: 'Teal para Azul' }
  ];

  const targetTypeOptions = [
    { value: 'external', label: 'Link Externo' },
    { value: 'product', label: 'Produto' },
    { value: 'category', label: 'Categoria' }
  ];

  const locationOptions = [
    { value: 'loja', label: 'Loja' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'ambos', label: 'Ambos' }
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await adminBanners.getAll();
      if (response.success) {
        setBanners(response.data);
      } else {
        toast({ title: 'Erro', description: response.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar banners', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditing(true);
      setEditingId(banner.id);
      setForm({
        title: banner.title,
        subtitle: banner.subtitle || '',
        description: banner.description,
        imageUrl: banner.imageUrl,
        bgGradient: banner.bgGradient || 'bg-gradient-to-r from-pink-400 to-purple-500',
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        badge: banner.badge || '',
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
        targetUrl: banner.targetUrl || '',
        targetType: banner.targetType || 'external',
        targetId: banner.targetId || '',
        location: banner.location || 'loja'
      });
    } else {
      setEditing(false);
      setEditingId('');
      setForm({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        bgGradient: 'bg-gradient-to-r from-pink-400 to-purple-500',
        ctaText: '',
        ctaLink: '',
        badge: '',
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
        targetUrl: '',
        targetType: 'external',
        targetId: '',
        location: 'loja'
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing && editingId) {
        const response = await adminBanners.update(editingId, form);
        if (response.success) {
          toast({ title: 'Sucesso', description: 'Banner atualizado com sucesso!' });
          setShowModal(false);
          fetchBanners();
        } else {
          toast({ title: 'Erro', description: response.error, variant: 'destructive' });
        }
      } else {
        const response = await adminBanners.create(form);
        if (response.success) {
          toast({ title: 'Sucesso', description: 'Banner criado com sucesso!' });
          setShowModal(false);
          fetchBanners();
        } else {
          toast({ title: 'Erro', description: response.error, variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar banner', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;
    
    try {
      const response = await adminBanners.delete(id);
      if (response.success) {
        toast({ title: 'Sucesso', description: 'Banner excluído com sucesso!' });
        fetchBanners();
      } else {
        toast({ title: 'Erro', description: response.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir banner', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await adminBanners.update(banner.id, { isActive: !banner.isActive });
      if (response.success) {
        toast({ title: 'Sucesso', description: `Banner ${banner.isActive ? 'desativado' : 'ativado'} com sucesso!` });
        fetchBanners();
      } else {
        toast({ title: 'Erro', description: response.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao alterar status do banner', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getGradientPreview = (gradient: string) => {
    return (
      <div 
        className={`w-8 h-8 rounded ${gradient}`}
        title={gradientOptions.find(g => g.value === gradient)?.label || gradient}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banners da Loja</h2>
          <p className="text-gray-600">Gerencie os banners exibidos na página inicial da loja</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                      {getGradientPreview(banner.bgGradient || '')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-sm text-gray-500">{banner.subtitle}</div>
                      )}
                      {banner.badge && (
                        <Badge variant="secondary" className="mt-1">{banner.badge}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(banner)}
                      >
                        {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{banner.sortOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {banner.startDate && (
                        <div>Início: {formatDate(banner.startDate)}</div>
                      )}
                      {banner.endDate && (
                        <div>Fim: {formatDate(banner.endDate)}</div>
                      )}
                      {!banner.startDate && !banner.endDate && (
                        <div className="text-gray-500">Sem período definido</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {banner.location === 'loja' ? '🏪 Loja' : 
                         banner.location === 'dashboard' ? '📊 Dashboard' : 
                         '🌐 Ambos'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleOpenModal(banner)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Banner */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
            <DialogDescription>
              Configure o banner que será exibido na página inicial da loja.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Título <span className="text-red-500">*</span></label>
              <Input
                placeholder="Título do banner"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subtítulo</label>
              <Input
                placeholder="Subtítulo (opcional)"
                value={form.subtitle}
                onChange={(e) => setForm({...form, subtitle: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descrição <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="Descrição do banner"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Texto do Botão <span className="text-red-500">*</span></label>
              <Input
                placeholder="Ex: Ver Produtos"
                value={form.ctaText}
                onChange={(e) => setForm({...form, ctaText: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Link do Botão <span className="text-red-500">*</span></label>
              <Input
                placeholder="Ex: /loja"
                value={form.ctaLink}
                onChange={(e) => setForm({...form, ctaLink: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Badge</label>
              <Input
                placeholder="Ex: Novo, Promoção"
                value={form.badge}
                onChange={(e) => setForm({...form, badge: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ordem</label>
              <Input
                type="number"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) => setForm({...form, sortOrder: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Início</label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({...form, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Fim</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({...form, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Destino</label>
              <Select value={form.targetType} onValueChange={(value) => setForm({...form, targetType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">URL de Destino</label>
              <Input
                placeholder="URL de destino"
                value={form.targetUrl}
                onChange={(e) => setForm({...form, targetUrl: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Localização</label>
              <Select value={form.location} onValueChange={(value) => setForm({...form, location: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Gradiente de Fundo</label>
              <Select value={form.bgGradient} onValueChange={(value) => setForm({...form, bgGradient: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${option.value}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({...form, isActive: e.target.checked})}
              />
              <label htmlFor="isActive" className="text-sm font-medium">Banner Ativo</label>
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="mt-4">
            <label className="text-sm font-medium">Imagem do Banner <span className="text-red-500">*</span></label>
            <MediaUpload
              onUploadSuccess={(mediaData) => {
                setForm({...form, imageUrl: mediaData.url});
              }}
              onUploadError={(error) => {
                console.error('Erro no upload:', error);
                toast({ title: 'Erro no upload', description: error, variant: 'destructive' });
              }}
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              showPreview={true}
              className="mt-2"
            />
            
            {/* Preview da imagem atual */}
            {form.imageUrl && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Imagem Atual:</h4>
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({...form, imageUrl: ''})}
                  >
                    Remover Imagem
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview do Banner */}
          {form.title && form.imageUrl && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium mb-4">Preview do Banner:</h4>
              <div className={`relative overflow-hidden rounded-lg ${form.bgGradient}`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {form.badge && (
                        <Badge variant="secondary" className="mb-2">{form.badge}</Badge>
                      )}
                      <h3 className="text-xl font-bold mb-2">{form.title}</h3>
                      {form.subtitle && (
                        <p className="text-lg mb-2">{form.subtitle}</p>
                      )}
                      <p className="text-sm mb-4 opacity-90">{form.description}</p>
                      <Button variant="secondary" size="sm">
                        {form.ctaText || 'Ver Mais'}
                      </Button>
                    </div>
                    <div className="ml-4">
                      <img
                        src={form.imageUrl}
                        alt={form.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="flex-1">
              {editing ? 'Atualizar' : 'Criar'} Banner
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 