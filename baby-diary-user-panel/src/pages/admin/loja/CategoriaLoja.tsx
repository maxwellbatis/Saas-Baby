import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';
import Picker from '@emoji-mart/react';

export interface Categoria {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
}

interface CategoriaLojaProps {
  onCategoriaCriada?: (categoria?: Categoria) => void;
}

const CategoriaLoja: React.FC<CategoriaLojaProps> = ({ onCategoriaCriada }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get('/admin/categories');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setCategorias(data);
    } catch (err: any) {
      setError('Erro ao buscar categorias.');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleNovaCategoria = () => {
    setEditingCategoria({ id: '', name: '', description: '', isActive: true });
    setEmoji('');
    setShowModal(true);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    const match = categoria.description?.match(/([\p{Emoji}\u2600-\u27BF])/gu);
    setEmoji(match ? match[0] : '');
    setShowModal(true);
  };

  const handleSalvarCategoria = async (categoria: Categoria) => {
    setLoading(true);
    setError(null);
    try {
      const desc = emoji ? `${emoji} ${categoria.description?.replace(emoji, '').trim() || ''}`.trim() : categoria.description || '';
      const categoriaFinal = { ...categoria, description: desc };
      if (categoria.id) {
        await adminApi.put(`/admin/categories/${categoria.id}`, categoriaFinal);
      } else {
        const res = await adminApi.post('/admin/categories', categoriaFinal);
        const novaCategoria = res.data || res;
        if (onCategoriaCriada) onCategoriaCriada(novaCategoria);
      }
      setShowModal(false);
      fetchCategorias();
    } catch (err: any) {
      setError('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarCategoria = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta categoria?')) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.delete(`/admin/categories/${id}`);
      fetchCategorias();
    } catch (err: any) {
      setError('Erro ao deletar categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias da Loja</h1>
        <button onClick={handleNovaCategoria} className="px-4 py-2 bg-blue-600 text-white rounded">Nova Categoria</button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Renderize a lista de categorias e modal de edição/criação aqui */}
      {/* Exemplo de lista simples: */}
      <ul className="divide-y">
        {categorias.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-2">
            <span>
              <span className="text-2xl mr-2">{cat.description?.match(/([\p{Emoji}\u2600-\u27BF])/gu)?.[0] || '🍼'}</span>
              {cat.name}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleEditarCategoria(cat)} className="text-blue-600">Editar</button>
              <button onClick={() => handleDeletarCategoria(cat.id)} className="text-red-600">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      {/* Modal de edição/criação (simples) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h2 className="text-lg font-bold mb-4">{editingCategoria?.id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSalvarCategoria(editingCategoria!); }}>
              <div className="flex gap-2 mb-2 items-center">
                <button
                  type="button"
                  className="border p-2 w-16 rounded text-2xl text-center bg-white hover:bg-gray-100"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  title="Escolher emoji"
                >
                  {emoji || '🍼'}
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-50 top-20 left-0">
                    <Picker
                      onEmojiSelect={e => {
                        setEmoji(e.native || e.emoji);
                        setShowEmojiPicker(false);
                      }}
                      locale="pt"
                      theme="light"
                    />
                  </div>
                )}
                <input
                  className="border p-2 flex-1 rounded"
                  placeholder="Nome"
                  value={editingCategoria?.name || ''}
                  onChange={e => setEditingCategoria({ ...(editingCategoria || { id: '', name: '', isActive: true }), name: e.target.value })}
                  required
                />
              </div>
              <input
                className="border p-2 w-full rounded mb-2"
                placeholder="Descrição (opcional)"
                value={editingCategoria?.description?.replace(emoji, '').trim() || ''}
                onChange={e => setEditingCategoria({ ...(editingCategoria || { id: '', name: '', isActive: true }), description: e.target.value })}
              />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
                <button type="button" className="flex-1 bg-gray-200 px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriaLoja; 