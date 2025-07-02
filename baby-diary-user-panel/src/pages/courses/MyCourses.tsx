import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import NetflixStoryCard from '../../components/NetflixStoryCard';
import Header from '../../components/Header';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Award,
  Target,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CourseCard } from '../../components/courses/CourseCard';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  thumbnail: string;
  isActive: boolean;
  modules: CourseModule[];
  rating?: number;
  enrolledCount?: number;
  isEnrolled?: boolean;
  progress?: number;
  lastAccessed?: string;
  enrolledAt?: string;
}

interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  videoUrl: string;
  order: number;
  duration: number;
  isCompleted?: boolean;
}

const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando meus cursos...');
      const response = await apiFetch('user/my-courses');
      console.log('📚 Resposta dos meus cursos:', response);
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar meus cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'in-progress') {
      matchesFilter = (course.progress || 0) > 0 && (course.progress || 0) < 100;
    } else if (filterStatus === 'completed') {
      matchesFilter = (course.progress || 0) === 100;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (progress: number) => {
    if (progress === 0) return { text: 'Não iniciado', color: 'bg-muted text-muted-foreground' };
    if (progress === 100) return { text: 'Concluído', color: 'bg-green-100 text-green-800' };
    return { text: 'Em andamento', color: 'bg-primary/20 text-primary' };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalLessons = (course: Course) => {
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  const getCompletedLessons = (course: Course) => {
    return course.modules.reduce((total, module) => 
      total + module.lessons.filter(lesson => lesson.isCompleted).length, 0
    );
  };

  const StoriesCarousel: React.FC<{ title: string; courses: Course[] }> = ({ title, courses }) => {
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerView = 6;
    const maxIndex = Math.max(0, courses.length - itemsPerView);

    const next = () => setStartIndex(prev => Math.min(prev + 1, maxIndex));
    const prev = () => setStartIndex(prev => Math.max(prev - 1, 0));

    if (courses.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="netflix-subtitle text-foreground">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={startIndex === 0}
              className="netflix-transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={next}
              disabled={startIndex >= maxIndex}
              className="netflix-transition"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-4 transition-transform duration-300" style={{
            transform: `translateX(-${startIndex * (100 / itemsPerView)}%)`
          }}>
            {courses.map(course => (
              <div key={course.id} className="flex-shrink-0">
                <NetflixStoryCard
                  image={course.thumbnail || 'https://via.placeholder.com/200x350/8A2BE2/FFFFFF?text=Curso'}
                  title={course.title}
                  onClick={() => window.location.href = `/courses/${course.id}`}
                  className="mx-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seus cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-[#b91c1c]">
      <Header />

      {/* Seção de Busca e Filtros */}
      <div className="bg-transparent shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-500 via-red-400 to-white bg-clip-text text-transparent netflix-title">Meus Cursos</h1>
              <p className="text-gray-200 mt-1">
                Continue de onde parou e acompanhe seu progresso
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="netflix-transition border border-white text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar Cursos
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar nos seus cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent w-full bg-black text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={`netflix-transition ${filterStatus === 'all' ? 'bg-red-600 text-white border border-white' : 'border border-white text-white bg-transparent'}`}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in-progress')}
                className={`netflix-transition ${filterStatus === 'in-progress' ? 'bg-red-600 text-white border border-white' : 'border border-white text-white bg-transparent'}`}
              >
                Em Andamento
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
                className={`netflix-transition ${filterStatus === 'completed' ? 'bg-red-600 text-white border border-white' : 'border border-white text-white bg-transparent'}`}
              >
                Concluídos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/80 border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Cursos</p>
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Em Andamento</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.filter(c => (c.progress || 0) === 100).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Progresso Médio</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.length > 0 
                      ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
                      : 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stories dos Cursos */}
        {filteredCourses.length > 0 && (
          <StoriesCarousel
            title="Seus Cursos"
            courses={filteredCourses}
          />
        )}

        {/* Lista de Cursos */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'Nenhum curso encontrado' 
                : 'Você ainda não está inscrito em nenhum curso'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros ou a busca'
                : 'Explore nossa biblioteca de cursos e comece sua jornada de aprendizado'
              }
            </p>
            <Link to="/courses">
              <Button className="netflix-button">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar Cursos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={{
                  ...course,
                  progress: getTotalLessons(course) > 0 
                    ? Math.floor((getCompletedLessons(course) / getTotalLessons(course)) * 100)
                    : 0
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses; 