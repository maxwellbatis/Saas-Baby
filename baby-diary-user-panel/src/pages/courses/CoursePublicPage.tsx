import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { apiFetch } from '../../config/api';

const CoursePublicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/public/courses/${id}`);
        if (res.success) {
          setCourse(res.data);
          setIsEnrolled(res.data.isEnrolled || false);
        } else {
          setError(res.error || 'Curso não encontrado');
        }
      } catch {
        setError('Erro ao carregar curso');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowAuth(true);
        return;
      }
      const res = await apiFetch(`/user/courses/${id}/enroll`, { method: 'POST' });
      if (res.success) {
        setIsEnrolled(true);
      } else {
        alert(res.error || 'Erro ao se inscrever');
      }
    } catch {
      alert('Erro ao se inscrever');
    }
  };

  const handleBuy = async () => {
    // Redirecionar para checkout Stripe (implementar integração)
    alert('Integração Stripe não implementada neste exemplo.');
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-white">Carregando...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-400">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900 to-black p-4">
      <Card className="w-full max-w-2xl bg-black/80 border border-white/20 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">{course.title}</CardTitle>
          <div className="flex gap-4 items-center mb-2">
            {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-32 h-32 object-cover rounded-lg border border-white/20" />}
            <div>
              <div className="text-lg font-semibold">{course.author}</div>
              <div className="text-sm text-gray-300">Categoria: {course.category}</div>
              {course.price && !course.isFree && (
                <div className="text-xl font-bold text-red-400 mt-2">R$ {course.price.toFixed(2)}</div>
              )}
              {course.isFree && <div className="text-green-400 font-bold mt-2">Curso Gratuito</div>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-gray-200">{course.description}</div>
          <div className="mb-4">
            <div className="font-bold mb-2">Conteúdo do Curso:</div>
            {course.modules?.map((mod: any) => (
              <div key={mod.id} className="mb-2">
                <div className="font-semibold text-red-300">{mod.title}</div>
                <ul className="ml-4 list-disc text-gray-300">
                  {mod.lessons?.map((les: any) => (
                    <li key={les.id}>{les.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {!isEnrolled && (
            <div className="flex flex-col gap-2">
              {course.isFree ? (
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleEnroll}>Inscrever-se gratuitamente</Button>
              ) : (
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleBuy}>Comprar com Stripe</Button>
              )}
              <div className="text-xs text-gray-400 text-center">
                {course.isFree ? 'Acesse todo o conteúdo após se inscrever.' : 'Pagamento seguro via Stripe.'}
              </div>
            </div>
          )}
          {isEnrolled && (
            <div className="mt-4 text-green-400 font-bold">Você está inscrito neste curso!</div>
          )}
          {showAuth && (
            <div className="mt-4">
              <div className="text-center text-sm mb-2">Faça login ou cadastre-se para acessar o curso:</div>
              <Button className="w-full bg-white text-red-700 font-bold" onClick={() => navigate('/courses/auth')}>Entrar ou Cadastrar</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursePublicPage; 