import React, { useState, useRef } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../../lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setError('');
    setSuccess('');
    if (tab === 'login' || tab === 'register' || tab === 'forgot') {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [tab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => EMAIL_REGEX.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateEmail(form.email)) {
      setError('Digite um e-mail válido.');
      setLoading(false);
      return;
    }
    try {
      const res = await login({ email: form.email, password: form.password });
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/courses'), 1200);
      } else {
        setError(res.error || 'Erro ao fazer login');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.name.trim()) {
      setError('Digite seu nome completo.');
      setLoading(false);
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Digite um e-mail válido.');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setSuccess('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/courses'), 1200);
      } else {
        setError(res.error || 'Erro ao cadastrar');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateEmail(form.email)) {
      setError('Digite um e-mail válido.');
      setLoading(false);
      return;
    }
    try {
      // Endpoint real de recuperação de senha
      const res = await fetch(`/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Se o e-mail existir, você receberá instruções para redefinir a senha.');
        setTimeout(() => setTab('login'), 2000);
      } else {
        setError(data.error || 'Erro ao enviar e-mail de recuperação.');
      }
    } catch {
      setError('Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-red-900 to-black">
      <Card className="w-full max-w-md shadow-2xl bg-black/80 border border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">Acesso aos Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
              <TabsTrigger value="forgot">Recuperar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input ref={emailInputRef} name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required autoFocus />
                <Input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
                {error && <div className="text-red-400 text-sm animate-pulse">{error}</div>}
                {success && <div className="text-green-400 text-sm animate-pulse">{success}</div>}
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
                <div className="text-center mt-2">
                  <button type="button" className="text-xs underline text-gray-300" onClick={() => setTab('forgot')}>Esqueceu a senha?</button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input ref={emailInputRef} name="name" placeholder="Nome completo" value={form.name} onChange={handleChange} required autoFocus />
                <Input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
                <Input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" value={form.password} onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="Confirmar senha" value={form.confirmPassword} onChange={handleChange} required />
                {error && <div className="text-red-400 text-sm animate-pulse">{error}</div>}
                {success && <div className="text-green-400 text-sm animate-pulse">{success}</div>}
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
              </form>
            </TabsContent>
            <TabsContent value="forgot">
              <form onSubmit={handleForgot} className="space-y-4">
                <Input ref={emailInputRef} name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required autoFocus />
                {error && <div className="text-red-400 text-sm animate-pulse">{error}</div>}
                {success && <div className="text-green-400 text-sm animate-pulse">{success}</div>}
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link de recuperação'}</Button>
                <div className="text-center mt-2">
                  <button type="button" className="text-xs underline text-gray-300" onClick={() => setTab('login')}>Voltar para login</button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage; 