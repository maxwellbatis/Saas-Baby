import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
  Baby, 
  Heart, 
  Camera, 
  Trophy, 
  Activity, 
  Users, 
  Star,
  ArrowRight,
  Play,
  BookOpen
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Baby className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Baby Diary</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Registre Cada Momento Especial do Seu Bebê
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            O Baby Diary é o seu companheiro perfeito para registrar, acompanhar e celebrar 
            cada marco do desenvolvimento do seu bebê. De memórias a marcos, tudo em um só lugar.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/business">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Para Empresas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa para acompanhar o desenvolvimento do seu bebê
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Camera className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Memórias</CardTitle>
                <CardDescription>
                  Registre fotos, vídeos e momentos especiais do seu bebê
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Marcos</CardTitle>
                <CardDescription>
                  Acompanhe cada conquista e marco do desenvolvimento
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Atividades</CardTitle>
                <CardDescription>
                  Sugestões de atividades personalizadas para cada idade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-12 h-12 text-red-600 mb-4" />
                <CardTitle>Saúde</CardTitle>
                <CardDescription>
                  Acompanhe consultas, vacinas e crescimento do bebê
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-600 mb-4" />
                <CardTitle>Gamificação</CardTitle>
                <CardDescription>
                  Sistema de recompensas e conquistas para motivar o uso
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-indigo-600 mb-4" />
                <CardTitle>Família</CardTitle>
                <CardDescription>
                  Compartilhe momentos com familiares e amigos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Cursos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cursos Exclusivos para Pais
            </h2>
            <p className="text-xl text-gray-600">
              Aprenda com especialistas sobre desenvolvimento infantil, amamentação, 
              introdução alimentar e muito mais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-blue-600">
                  Gratuito
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <Badge variant="outline">Desenvolvimento</Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Primeiros Passos do Bebê
                </h3>
                <p className="text-gray-600 mb-4">
                  Aprenda sobre os marcos do desenvolvimento motor e como estimular seu bebê.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">45 min • 8 aulas</span>
                  <Button variant="outline" size="sm">
                    Assistir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-green-600">
                  Premium
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <Badge variant="outline">Amamentação</Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Guia Completo da Amamentação
                </h3>
                <p className="text-gray-600 mb-4">
                  Tudo sobre amamentação, posições, dificuldades e soluções.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">2h 30min • 12 aulas</span>
                  <Button variant="outline" size="sm">
                    Assistir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-purple-600">
                  Premium
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <Badge variant="outline">Alimentação</Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Introdução Alimentar
                </h3>
                <p className="text-gray-600 mb-4">
                  Como introduzir alimentos sólidos de forma segura e nutritiva.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">1h 45min • 10 aulas</span>
                  <Button variant="outline" size="sm">
                    Assistir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button size="lg" variant="outline">
                Ver Todos os Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Baby className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">Baby Diary</span>
              </div>
              <p className="text-gray-400">
                Acompanhe cada momento especial do desenvolvimento do seu bebê.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Cursos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Baby Diary. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;