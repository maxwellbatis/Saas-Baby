import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import NetflixStoryCard from '../../components/NetflixStoryCard';
import Header from '../../components/Header';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Heart,
  Download,
  Share2,
  User
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
  modules?: CourseModule[];
  rating?: number;
  enrolledCount?: number;
  isEnrolled?: boolean;
  progress?: number;
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

const CoursesHome: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([
    { id: 'all', name: 'Todos', icon: '📚' }
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('public/courses');
      if (response.success) {
        setCourses(response.data || []);
        // Gerar categorias dinamicamente
        const uniqueCategories = Array.from(new Set((response.data || []).map((c: Course) => c.category)));
        const dynamicCategories = uniqueCategories
          .filter((cat): cat is string => typeof cat === 'string')
          .map(cat => ({
            id: cat.toLowerCase().replace(/\s/g, '-'),
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: '📚'
          }));
        setCategories([{ id: 'all', name: 'Todos', icon: '📚' }, ...dynamicCategories]);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const courseCategoryId = course.category.toLowerCase().replace(/\s/g, '-');
    const matchesCategory = selectedCategory === 'all' || courseCategoryId === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedCourses = categories.reduce((acc, category) => {
    const categoryCourses = courses.filter(course => 
      category.id === 'all' || course.category === category.id
    );
    if (categoryCourses.length > 0) {
      acc[category.id] = categoryCourses;
    }
    return acc;
  }, {} as Record<string, Course[]>);

  const toggleFavorite = (courseId: string) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const CourseCard: React.FC<{ course: Course; showProgress?: boolean }> = ({ course, showProgress = false }) => (
    <Card 
      className="group cursor-pointer netflix-card overflow-hidden"
      onClick={() => {
        navigate(`/courses/${course.id}`);
      }}
    >
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
            <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.isEnrolled && (
              <Badge className="bg-primary text-white">Inscrito</Badge>
            )}
          </div>

          {/* Botões de ação */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(course.id);
              }}
            >
              <Heart 
                className={`w-4 h-4 ${favorites.includes(course.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Progress bar */}
          {showProgress && course.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div 
                className="h-full netflix-progress-bar transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          )}
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

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">{course.rating.toFixed(1)}</span>
              </div>
            )}
            {course.enrolledCount && (
              <span className="text-sm text-muted-foreground">
                {course.enrolledCount} alunos
              </span>
            )}
          </div>
        </div>

        {showProgress && course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{course.progress}%</span>
            </div>
            <div className="netflix-progress">
              <div 
                className="netflix-progress-bar transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CourseCarousel: React.FC<{ title: string; courses: Course[]; showProgress?: boolean }> = ({ 
    title, 
    courses, 
    showProgress = false 
  }) => {
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerView = 4;
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
              <div key={course.id} className="flex-shrink-0 w-1/4">
                <CourseCard course={course} showProgress={showProgress} />
              </div>
            ))}
          </div>
        </div>
      </div>
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
                  onClick={() => navigate(`/courses/${course.id}`)}
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
          <p className="text-muted-foreground">Carregando cursos...</p>
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
              <h1 className="netflix-title text-foreground">Cursos para Pais</h1>
              <p className="text-muted-foreground mt-1">
                Aprenda com especialistas sobre desenvolvimento infantil
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
              </div>
              <Button variant="outline" className="netflix-transition">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap netflix-transition"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stories em Destaque */}
        <StoriesCarousel
          title="Cursos em Destaque"
          courses={courses.filter(c => c.rating && c.rating >= 4.5).slice(0, 12)}
        />

        {/* Todos os Cursos */}
        <CourseCarousel
          title="Todos os Cursos"
          courses={courses}
        />

        {/* Meus Cursos */}
        {user && (
          <CourseCarousel
            title="Meus Cursos"
            courses={courses.filter(c => c.isEnrolled)}
            showProgress={true}
          />
        )}

        {/* Cursos por Categoria */}
        {Object.entries(groupedCourses).map(([categoryId, categoryCourses]) => {
          const category = categories.find(c => c.id === categoryId);
          if (!category || categoryId === 'all') return null;
          
          return (
            <CourseCarousel
              key={categoryId}
              title={category.name}
              courses={categoryCourses.slice(0, 8)}
            />
          );
        })}

        {/* Cursos Mais Populares */}
        <CourseCarousel
          title="Cursos Mais Populares"
          courses={courses
            .filter(c => c.enrolledCount && c.enrolledCount > 100)
            .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
            .slice(0, 8)
          }
        />
      </div>
    </div>
  );
};

export default CoursesHome; 