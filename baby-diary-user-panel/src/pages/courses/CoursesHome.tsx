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
import { CourseCard } from '../../components/courses/CourseCard';

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

  const getTotalLessons = (course: Course) => {
    return course.modules?.reduce((total, module) => total + module.lessons.length, 0) || 0;
  };

  const getCompletedLessons = (course: Course) => {
    return course.modules?.reduce((total, module) =>
      total + module.lessons.filter(lesson => lesson.isCompleted).length, 0
    ) || 0;
  };

  // Remove duplicados pelo id do curso
  const uniqueCourses = Object.values(
    courses.reduce((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {} as Record<string, Course>)
  );

  // Renderização principal
  if (loading) {
    return <div className="text-center text-white py-10">Carregando cursos...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-zinc-900 to-[#b91c1c] pb-16">
      {/* Banner Maxflix */}
      <div className="w-full flex flex-col items-center justify-center py-10 mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-widest mb-2">
          <span className="bg-gradient-to-r from-red-600 via-red-400 to-white bg-clip-text text-transparent">MAXFLIX</span> <span className="text-white">CURSOS</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 font-medium drop-shadow mb-2">Aprenda com os melhores, no seu ritmo.</p>
        <span className="text-xs text-white/60 tracking-widest uppercase">O streaming de cursos do Baby Diary</span>
      </div>

      {/* Bloco de incentivo para negócio digital */}
      <div className="w-full flex flex-col items-center justify-center mb-8 px-4">
        <div className="max-w-2xl w-full bg-gradient-to-r from-red-700/80 via-black/80 to-pink-700/80 border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-pink-400">🚀</span> Transforme seu conhecimento em um negócio digital!
            </h2>
            <p className="text-white/80 mb-2">Crie sua própria plataforma de cursos, comunidade e loja com o Baby Diary. Tenha um império digital que vende no automático, com IA, marketing e tudo pronto para você.</p>
          </div>
          <a href="/business" className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg">
            Quero meu negócio digital
          </a>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-16 mb-8">
        <div className="flex-1 flex items-center bg-black/60 rounded-lg px-4 py-2 border border-white/20 max-w-md">
          <Search className="w-5 h-5 text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-white placeholder:text-gray-400 flex-1"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === cat.id ? 'bg-red-600 text-white border-white/40' : 'bg-black/40 text-white/70 border-white/10 hover:bg-red-700/80'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="mr-1">{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards dos cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-16">
        {uniqueCourses.length === 0 && (
          <div className="col-span-full text-center text-white/80 text-lg py-16">Nenhum curso encontrado.</div>
        )}
        {uniqueCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CoursesHome; 