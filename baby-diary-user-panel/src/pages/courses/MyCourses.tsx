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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Seção de Busca e Filtros */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="netflix-title text-foreground">Meus Cursos</h1>
              <p className="text-muted-foreground mt-1">
                Continue de onde parou e acompanhe seu progresso
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="netflix-transition">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar Cursos
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar nos seus cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-background text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="netflix-transition"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in-progress')}
                className="netflix-transition"
              >
                Em Andamento
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
                className="netflix-transition"
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
          <Card className="netflix-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Cursos</p>
                  <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="netflix-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="netflix-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.filter(c => (c.progress || 0) === 100).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="netflix-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Médio</p>
                  <p className="text-2xl font-bold text-foreground">
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
            {filteredCourses.map(course => {
              const status = getStatusBadge(course.progress || 0);
              const totalLessons = getTotalLessons(course);
              const completedLessons = getCompletedLessons(course);

              return (
                <Card key={course.id} className="group netflix-card">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-primary to-accent relative overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      
                      {/* Overlay com botão play */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Link to={`/courses/${course.id}`}>
                          <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-primary" />
                          </div>
                        </Link>
                      </div>

                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={status.color}>
                          {status.text}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <div 
                          className="h-full netflix-progress-bar transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        {course.author}
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                      {course.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Progress details */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="netflix-progress">
                        <div 
                          className="netflix-progress-bar"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{completedLessons} de {totalLessons} aulas</span>
                      </div>
                    </div>

                    {/* Last accessed */}
                    {course.lastAccessed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>Último acesso: {formatDate(course.lastAccessed)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/courses/${course.id}`} className="flex-1">
                        <Button className="w-full netflix-button" size="sm">
                          {course.progress === 0 ? 'Começar' : 'Continuar'}
                        </Button>
                      </Link>
                      {course.rating && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">{course.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses; 