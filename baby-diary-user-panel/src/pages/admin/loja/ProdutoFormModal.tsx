import React, { useEffect, useState } from 'react';
import { Produto } from './AdminProdutos';
import { adminShop } from '../../../lib/adminApi';
import ImageGalleryUpload from './ImageGalleryUpload';
import CategoriaLoja from './CategoriaLoja';
import { adminApi } from '../../../lib/adminApi';
import { Switch } from '../../../components/ui/switch';

interface ProdutoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (produto: Produto) => void;
  produto: Produto | null;
}

interface Categoria {
  id: string;
  name: string;
}
interface Tag {
  id: string;
  name: string;
}

type VariationOption = { label: string; price?: number };
type Variation = { type: string; required?: boolean; priceMode?: 'adicional' | 'combinacao'; options: VariationOption[] };

const ProdutoFormModal: React.FC<ProdutoFormModalProps> = ({ open, onClose, onSave, produto }) => {
  const [form, setForm] = useState<Produto & { categoryId?: string; tagsIds?: string[]; promoPrice?: number; coupon?: string; promoStart?: string; promoEnd?: string; gallery?: string[]; mainImage?: string; type?: string; sku?: string; variations?: Variation[] }>(
    produto || { id: '', name: '', description: '', price: 0, isActive: true, isPromo: false, stock: 0, mainImage: '', gallery: [], type: 'produto' }
  );
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [variations, setVariations] = useState<Variation[]>(form.variations as Variation[] || []);
  const [combinationPrices, setCombinationPrices] = useState<Array<{ combination: Record<string, string>, price: number }>>([]);

  useEffect(() => {
    if (open) {
      adminShop.getCategories().then((res) => setCategorias(res.data || res)).catch(() => setCategorias([]));
      adminShop.getTags().then((res) => setTags(res.data || res)).catch(() => setTags([]));
      setForm(
        produto || { id: '', name: '', description: '', price: 0, isActive: true, isPromo: false, stock: 0, mainImage: '', gallery: [], type: 'produto' }
      );
      setError(null);
    }
  }, [open, produto]);

  useEffect(() => {
    recarregarCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === 'checkbox' && 'checked' in e.target) {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setForm((prev) => ({ ...prev, tagsIds: selected }));
  };

  const handleGalleryChange = (gallery: string[]) => {
    setForm((prev) => ({ ...prev, gallery }));
  };

  const validate = () => {
    if (!form.name || !form.price || !form.categoryId) {
      setError('Preencha nome, preço e categoria.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      let categoryName = 'basic';
      if (form.categoryId) {
        const categoriaSelecionada = categorias.find(cat => cat.id === form.categoryId);
        if (categoriaSelecionada) categoryName = categoriaSelecionada.name;
      }

      const produtoFinal: any = {
        id: form.id,
        name: form.name,
        price: Number(form.price),
        isActive: !!form.isActive,
        isPromo: !!form.isPromo,
        type: form.type || 'produto',
        category: categoryName,
        sku: form.sku,
        variations,
      };
      if (form.categoryId) produtoFinal.categoryId = form.categoryId;
      if (form.description) produtoFinal.description = form.description;
      if (form.stock) produtoFinal.stock = Number(form.stock);
      if (form.gallery && form.gallery.length > 0) {
        produtoFinal.gallery = form.gallery;
        produtoFinal.mainImage = form.mainImage || form.gallery[0];
      } else if (form.mainImage) {
        produtoFinal.mainImage = form.mainImage;
      }
      onSave(produtoFinal);
    } catch (err: any) {
      setError('Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCategoria = () => {
    setShowCategoriaModal(true);
  };

  const recarregarCategorias = async (novaCategoria?: Categoria) => {
    const res = await adminApi.get('/admin/categories');
    const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
    setCategorias(data);
    if (novaCategoria) {
      setForm((prev) => ({ ...prev, categoryId: novaCategoria.id }));
    }
  };

  const handleVariationTypeChange = (idx: number, value: string) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? { ...v, type: value } : v));
  };

  const handleVariationOptionChange = (idx: number, optIdx: number, value: string) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? {
      ...v,
      options: v.options.map((o, oi) => oi === optIdx ? { ...o, label: value } : o)
    } : v));
  };

  const handleOptionPriceChange = (idx: number, optIdx: number, value: number) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? {
      ...v,
      options: v.options.map((o, oi) => oi === optIdx ? { ...o, price: value } : o)
    } : v));
  };

  const handleAddVariation = () => {
    setVariations((prev) => [
      ...prev,
      { type: '', options: [{ label: '' }], required: false, priceMode: 'adicional' as 'adicional' | 'combinacao' }
    ]);
  };

  const handleRemoveVariation = (idx: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddOption = (idx: number) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? { ...v, options: [...v.options, { label: '' }] } : v));
  };

  const handleRemoveOption = (idx: number, optIdx: number) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? { ...v, options: v.options.filter((_, oi) => oi !== optIdx) } : v));
  };

  const handleVariationRequiredChange = (idx: number, value: boolean) => {
    setVariations((prev) => prev.map((v, i) => i === idx ? { ...v, required: value } : v));
  };

  const handleVariationPriceModeChange = (idx: number, value: 'adicional' | 'combinacao') => {
    setVariations((prev) => prev.map((v, i) => i === idx ? { ...v, priceMode: value } : v));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">{produto ? 'Editar Produto' : 'Novo Produto'}</h2>
        {form.id && (
          <div className="mb-2 text-xs text-gray-500 font-mono select-all">ID do Produto: {form.id}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <div className="flex items-center gap-2">
              <select name="categoryId" value={form.categoryId || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1">
                <option value="">Selecione...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="button" onClick={abrirModalCategoria} className="px-2 py-1 bg-gray-200 text-blue-700 rounded text-xs">+ Nova</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full rounded mt-1 min-h-[60px]" />
          </div>
          <div>
            <label className="text-sm font-medium">Preço (centavos)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Preço Promocional (centavos)</label>
            <input name="promoPrice" type="number" value={form.promoPrice || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Cupom</label>
            <input name="coupon" value={form.coupon || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Promoção de</label>
            <input name="promoStart" type="date" value={form.promoStart || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Promoção até</label>
            <input name="promoEnd" type="date" value={form.promoEnd || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Tags</label>
            <select name="tags" multiple value={form.tagsIds || []} onChange={handleTagsChange} className="border p-2 w-full rounded mt-1 h-24">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Estoque</label>
            <input name="stock" type="number" value={form.stock || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Imagem Principal (URL)</label>
            <input name="mainImage" value={form.mainImage || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Galeria de Imagens</label>
            <ImageGalleryUpload value={form.gallery || []} onChange={handleGalleryChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Código do Produto (SKU)</label>
            <input name="sku" value={form.sku || ''} onChange={handleChange} className="border p-2 w-full rounded mt-1" />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium">Variações do Produto</label>
            {variations.map((variation, idx) => (
              <div key={idx} className="border rounded p-2 mb-2 bg-gray-50">
                <div className="flex gap-2 mb-1">
                  <input
                    placeholder="Tipo (ex: Cor, Tamanho, Peso)"
                    value={variation.type}
                    onChange={e => handleVariationTypeChange(idx, e.target.value)}
                    className="border p-1 rounded flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={!!variation.required} onChange={e => handleVariationRequiredChange(idx, e.target.checked)} /> Obrigatório
                  </label>
                  <select
                    value={variation.priceMode || 'adicional'}
                    onChange={e => handleVariationPriceModeChange(idx, e.target.value as 'adicional' | 'combinacao')}
                    className="text-xs border rounded px-1"
                  >
                    <option value="adicional">Preço adicional</option>
                    <option value="combinacao">Preço por combinação</option>
                  </select>
                  <button type="button" onClick={() => handleRemoveVariation(idx)} className="text-red-500 text-xs">Remover</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variation.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-1">
                      <input
                        placeholder="Opção"
                        value={opt.label}
                        onChange={e => handleVariationOptionChange(idx, optIdx, e.target.value)}
                        className="border p-1 rounded"
                      />
                      {variation.priceMode !== 'combinacao' && (
                        <input
                          type="number"
                          placeholder="Preço (centavos)"
                          value={opt.price !== undefined ? opt.price : ''}
                          onChange={e => handleOptionPriceChange(idx, optIdx, Number(e.target.value))}
                          className="border p-1 rounded w-24 text-xs"
                        />
                      )}
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={!!opt.isFixedPrice}
                          onChange={e => setVariations(prev => prev.map((v, i) => i === idx ? {
                            ...v,
                            options: v.options.map((o, oi) => oi === optIdx ? { ...o, isFixedPrice: e.target.checked } : o)
                          } : v))}
                        /> Preço fixo
                      </label>
                      <button type="button" onClick={() => handleRemoveOption(idx, optIdx)} className="text-xs text-red-400">x</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddOption(idx)} className="text-xs text-blue-500">+ Opção</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddVariation} className="mt-2 text-xs text-blue-600">+ Adicionar Variação</button>
          </div>
          {variations.some(v => v.priceMode === 'combinacao') && (
            <div className="mb-4 border rounded p-2 bg-gray-50">
              <label className="text-sm font-medium">Tabela de Preço por Combinação</label>
              {/* UI para adicionar/remover combinações e definir preço */}
              {/* ... (implementar UI para combinations) ... */}
              {/* Exemplo: para cada combinação possível, campos para selecionar opções e definir preço */}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Switch name="isActive" checked={!!form.isActive} onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked }))} />
            <label className="text-sm">Ativo</label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input name="isPromo" type="checkbox" checked={!!form.isPromo} onChange={handleChange} />
            <label className="text-sm">Produto em Promoção</label>
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select name="type" value={form.type || 'produto'} onChange={handleChange} className="border p-2 w-full rounded mt-1">
              <option value="produto">Produto</option>
              <option value="produto digital">Produto Digital</option>
              <option value="service">Serviço</option>
            </select>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <CategoriaLoja onCategoriaCriada={recarregarCategorias} />
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowCategoriaModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutoFormModal; 