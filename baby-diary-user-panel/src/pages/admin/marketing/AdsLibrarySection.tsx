import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus, Sparkles, Edit, Trash2 } from 'lucide-react';

interface AdsLibrarySectionProps {
  ads: any[];
  onEdit: (ad: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onGenerateAI: () => void;
  loading?: boolean;
}

export const AdsLibrarySection: React.FC<AdsLibrarySectionProps> = ({
  ads,
  onEdit,
  onDelete,
  onCreate,
  onGenerateAI,
  loading
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Anúncios</h3>
        <div className="flex gap-2">
          <Button onClick={onGenerateAI} variant="secondary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Gerar com IA
          </Button>
          <Button onClick={onCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Anúncio
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">Carregando anúncios...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">Nenhum anúncio cadastrado.</div>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id} className="relative group hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="truncate">{ad.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-2 truncate">{ad.headline || ad.copyShort}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{ad.platform}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{ad.adType}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(ad)} className="flex-1 flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(ad.id)} className="flex-1 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </section>
  );
}; 