import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AcceptFamilyInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = searchParams.get('inviteId');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Verifica se o e-mail já está cadastrado
      const checkRes = await fetch(`${API_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      // Aceita o convite normalmente
      const res = await fetch(`${API_URL}/api/user/family/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, userId: email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (checkData.exists) {
            navigate(`/login?email=${encodeURIComponent(email)}`);
          } else {
            navigate(`/register?email=${encodeURIComponent(email)}`);
          }
        }, 2000);
      } else {
        setError(data.error || 'Erro ao aceitar convite');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (!inviteId) {
    return <div className="p-8 text-center text-red-600">Convite inválido.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Aceitar Convite de Família</h1>
        {success ? (
          <div className="text-green-600 text-center">
            Convite aceito com sucesso! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleAccept} className="space-y-4">
            <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            <Input placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required type="email" />
            <Button type="submit" className="w-full" disabled={loading || !name || !email}>
              {loading ? 'Aceitando...' : 'Aceitar Convite'}
            </Button>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default AcceptFamilyInvite; 