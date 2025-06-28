import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const TagLoja: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get('/admin/tags');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTags(data);
    } catch (err: any) {
      setError('Erro ao buscar tags.');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNovaTag = () => {
    setEditingTag(null);
    setShowModal(true);
  };

  const handleEditarTag = (tag: Tag) => {
    setEditingTag(tag);
    setShowModal(true);
  };

  const handleSalvarTag = async (tag: Tag) => {
    setLoading(true);
    setError(null);
    try {
      if (tag.id) {
        await adminApi.put(`/admin/tags/${tag.id}`, tag);
      } else {
        await adminApi.post('/admin/tags', tag);
      }
      setShowModal(false);
      fetchTags();
    } catch (err: any) {
      setError('Erro ao salvar tag.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarTag = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tag?')) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.delete(`/admin/tags/${id}`);
      fetchTags();
    } catch (err: any) {
      setError('Erro ao deletar tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tags da Loja</h1>
        <button onClick={handleNovaTag} className="px-4 py-2 bg-blue-600 text-white rounded">Nova Tag</button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Renderize a lista de tags e modal de edição/criação aqui */}
      <ul className="divide-y">
        {tags.map((tag) => (
          <li key={tag.id} className="flex items-center justify-between py-2">
            <span>{tag.name}</span>
            <div className="flex gap-2">
              <button onClick={() => handleEditarTag(tag)} className="text-blue-600">Editar</button>
              <button onClick={() => handleDeletarTag(tag.id)} className="text-red-600">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      {/* Modal de edição/criação (simples) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingTag ? 'Editar Tag' : 'Nova Tag'}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSalvarTag(editingTag || { id: '', name: '', isActive: true }); }}>
              <input
                className="border p-2 w-full rounded mb-2"
                placeholder="Nome"
                value={editingTag?.name || ''}
                onChange={e => setEditingTag({ ...(editingTag || { id: '', name: '', isActive: true }), name: e.target.value })}
                required
              />
              <input
                className="border p-2 w-full rounded mb-2"
                placeholder="Descrição"
                value={editingTag?.description || ''}
                onChange={e => setEditingTag({ ...(editingTag || { id: '', name: '', isActive: true }), description: e.target.value })}
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

export default TagLoja; 