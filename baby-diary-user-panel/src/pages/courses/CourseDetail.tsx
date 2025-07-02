import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Download,
  Share2,
  Heart,
  CheckCircle,
  Lock,
  FileText,
  Video,
  Image,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { apiFetch } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/use-toast';

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
  materials: CourseMaterial[];
  thumbnail?: string;
}

interface CourseMaterial {
  id: string;
  type: string;
  title: string;
  url: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const modulesRef = useRef<HTMLDivElement>(null);
  const storiesCarouselRef = useRef<HTMLDivElement>(null);
  const modulesCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`public/courses/${id}`);
      if (response.success) {
        setCourse(response.data);
        // Expandir primeiro módulo por padrão
        if (response.data.modules?.length > 0) {
          setExpandedModules([response.data.modules[0].id]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o curso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson: CourseLesson) => {
    console.log('🎯 Selecionando aula:', lesson.title);
    console.log('📹 URL do vídeo:', lesson.videoUrl);
    console.log('🖼️ Thumbnail da aula:', lesson.thumbnail);
    setCurrentLesson(lesson);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleFavorite = () => {
    if (!course) return;
    setFavorites(prev => 
      prev.includes(course.id) 
        ? prev.filter(id => id !== course.id)
        : [...prev, course.id]
    );
  };

  const enrollCourse = async () => {
    if (!course || !user) return;
    
    try {
      const response = await apiFetch(`user/courses/${course.id}/enroll`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Você foi inscrito no curso"
        });
        await loadCourse(); // Recarregar dados do curso
        // Scroll para a área de módulos/aulas
        setTimeout(() => {
          modulesRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível se inscrever no curso",
        variant: "destructive"
      });
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      console.log('✅ Marcando aula como completa:', lessonId);
      const response = await apiFetch(`user/courses/lessons/${lessonId}/complete`, {
        method: 'POST'
      });
      
      console.log('📚 Resposta da marcação:', response);
      
      if (response.success) {
        loadCourse(); // Recarregar dados do curso
      }
    } catch (error) {
      console.error('❌ Erro ao marcar aula como completa:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const scrollCarousel = (direction: 'left' | 'right', carouselRef: React.RefObject<HTMLDivElement>) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Curso não encontrado</p>
          <Button onClick={() => navigate('/courses')} className="mt-4 netflix-button">
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = course.modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.isCompleted).length, 0
  );
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section com Capa do Curso - Estilo Netflix */}
      <div className="relative bg-gradient-to-br from-primary/20 to-accent/20">
        {/* Imagem de fundo com overlay */}
        <div className="absolute inset-0">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover opacity-10"
            />
          ) : (
            <div className="w-full h-full netflix-gradient-dark" />
          )}
        </div>
        
        {/* Conteúdo do Hero */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/courses')}
              className="text-foreground hover:bg-foreground/10 netflix-transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cursos
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="text-foreground hover:bg-foreground/10 netflix-transition"
              >
                <Heart 
                  className={`w-4 h-4 ${favorites.includes(course.id) ? 'fill-destructive text-destructive' : 'text-foreground'}`} 
                />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-foreground hover:bg-foreground/10 netflix-transition"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-foreground hover:bg-foreground/10 netflix-transition"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Informações do Curso */}
            <div className="lg:col-span-2">
              <Badge variant="outline" className="mb-4 bg-primary/20 text-primary border-primary">
                {course.category}
              </Badge>
              <h1 className="netflix-title text-foreground mb-4">{course.title}</h1>
              <p className="netflix-body text-muted-foreground mb-6 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4" />
                  <span>{course.author}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.modules.length} módulos</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Video className="w-4 h-4" />
                  <span>{totalLessons} aulas</span>
                </div>
              </div>

              {course.isEnrolled && (
                <div className="bg-card/50 rounded-lg p-4 mb-6 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Seu Progresso</span>
                    <span className="text-foreground">{course.progress || 0}%</span>
                  </div>
                  <div className="netflix-progress">
                    <div 
                      className="netflix-progress-bar"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {completedLessons} de {totalLessons} aulas concluídas
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                {course.isEnrolled ? (
                  <Button
                    size="lg"
                    onClick={() => modulesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="netflix-button"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continuar Curso
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={enrollCourse}
                    className="netflix-button"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Inscrever-se Gratuitamente
                  </Button>
                )}
              </div>
            </div>

            {/* Thumbnail do Curso - Estilo Netflix */}
            <div className="lg:col-span-1">
              <div className="relative">
                {course.thumbnail ? (
                  <div className="aspect-video rounded-lg overflow-hidden shadow-2xl netflix-card">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 transform scale-0 hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video netflix-gradient rounded-lg shadow-2xl flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" ref={modulesRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player e Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Player de Vídeo - Estilo Netflix */}
            <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg netflix-card">
              <div className="aspect-video relative">
                {currentLesson?.videoUrl ? (
                  <video
                    key={currentLesson.videoUrl} // Força re-render quando URL muda
                    src={currentLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    poster={currentLesson.thumbnail || course.thumbnail}
                    preload="metadata"
                    onError={(e) => {
                      console.error('❌ Erro no player de vídeo:', e);
                      console.error('📹 URL do vídeo:', currentLesson.videoUrl);
                      console.error('🎬 Elemento de vídeo:', e.target);
                    }}
                    onLoadStart={() => {
                      console.log('🎬 Iniciando carregamento do vídeo:', currentLesson.videoUrl);
                    }}
                    onCanPlay={() => {
                      console.log('✅ Vídeo carregado com sucesso:', currentLesson.videoUrl);
                    }}
                    onLoadedMetadata={() => {
                      console.log('📊 Metadados do vídeo carregados:', currentLesson.videoUrl);
                    }}
                    onLoad={() => {
                      console.log('🔄 Vídeo carregado:', currentLesson.videoUrl);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    {course.thumbnail ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-75" />
                            <p className="text-lg font-medium">Selecione uma aula para começar</p>
                            {currentLesson && (
                              <p className="text-sm opacity-75 mt-2">
                                Aula selecionada: {currentLesson.title} 
                                {!currentLesson.videoUrl && ' (sem vídeo)'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Selecione uma aula para começar</p>
                        {currentLesson && (
                          <p className="text-sm opacity-75 mt-2">
                            Aula selecionada: {currentLesson.title}
                            {!currentLesson.videoUrl && ' (sem vídeo)'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Informações da Aula Atual */}
            {currentLesson && (
              <Card className="mb-6 netflix-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">{currentLesson.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(currentLesson.duration)}
                      </span>
                      {currentLesson.isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Materiais de Apoio */}
                  {currentLesson.materials && currentLesson.materials.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3 text-foreground">Materiais de Apoio</h4>
                      <div className="space-y-2">
                        {currentLesson.materials.map(material => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 netflix-transition"
                          >
                            <div className="flex items-center gap-3">
                              {getMaterialIcon(material.type)}
                              <span className="font-medium text-foreground">{material.title}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(material.url, '_blank')}
                              className="netflix-transition"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão Marcar como Completa */}
                  {!currentLesson.isCompleted && (
                    <Button
                      className="mt-4 netflix-button"
                      onClick={() => markLessonComplete(currentLesson.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Completa
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stories com Imagens Verticais - Estilo Netflix */}
            {course.isEnrolled && (
              <div className="mb-6">
                <h2 className="netflix-subtitle text-foreground mb-4">Aulas em Destaque</h2>
                <div className="relative">
                  {/* Botões de navegação do carrossel */}
                  <Button
                    variant="secondary"
                    size="lg"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-background/90 hover:bg-primary text-primary border-2 border-primary shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
                    onClick={() => scrollCarousel('left', storiesCarouselRef)}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="lg"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-background/90 hover:bg-primary text-primary border-2 border-primary shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
                    onClick={() => scrollCarousel('right', storiesCarouselRef)}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>

                  {/* Carrossel de stories */}
                  <div 
                    ref={storiesCarouselRef}
                    className="netflix-carousel"
                  >
                    {course.modules.flatMap(module => 
                      module.lessons.map(lesson => (
                        <div key={lesson.id} className="flex-shrink-0">
                          <NetflixStoryCard
                            image={lesson.thumbnail || course.thumbnail || 'https://via.placeholder.com/200x350/8A2BE2/FFFFFF?text=Aula'}
                            title={lesson.title}
                            duration={lesson.duration}
                            isCompleted={lesson.isCompleted}
                            onClick={() => selectLesson(lesson)}
                            className="mx-2"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Carrossel de Módulos - Estilo Netflix */}
            {course.isEnrolled && (
              <div className="mb-6">
                <h2 className="netflix-subtitle text-foreground mb-4">Módulos do Curso</h2>
                <div className="relative">
                  {/* Botões de navegação do carrossel */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background netflix-transition"
                    onClick={() => scrollCarousel('left', modulesCarouselRef)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background netflix-transition"
                    onClick={() => scrollCarousel('right', modulesCarouselRef)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Carrossel de módulos */}
                  <div 
                    ref={modulesCarouselRef}
                    className="netflix-carousel"
                  >
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="flex-shrink-0 w-80">
                        <Card className="netflix-card h-full">
                          <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {module.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {module.lessons.length} aulas
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {module.lessons.map(lesson => (
                                <div
                                  key={lesson.id}
                                  className={`p-3 rounded-lg cursor-pointer netflix-transition ${
                                    currentLesson?.id === lesson.id 
                                      ? 'bg-primary/20 border border-primary' 
                                      : 'hover:bg-muted/50 border border-transparent'
                                  }`}
                                  onClick={() => selectLesson(lesson)}
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDuration(lesson.duration)}
                                      </p>
                                    </div>
                                    <Play className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Descrição do Curso */}
            <Card className="netflix-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sobre este curso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{course.modules.length}</div>
                    <div className="text-sm text-muted-foreground">Módulos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Aulas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{course.author}</div>
                    <div className="text-sm text-muted-foreground">Autor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{course.category}</div>
                    <div className="text-sm text-muted-foreground">Categoria</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Progresso - Estilo Netflix */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <Card className="sticky top-6 netflix-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">Conteúdo do Curso</CardTitle>
                  {course.isEnrolled && (
                    <Badge variant="outline" className="text-xs">
                      {progressPercentage.toFixed(0)}% completo
                    </Badge>
                  )}
                </div>
                
                {course.isEnrolled && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progresso</span>
                      <span>{completedLessons} de {totalLessons} aulas</span>
                    </div>
                    <div className="netflix-progress">
                      <div 
                        className="netflix-progress-bar"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {!course.isEnrolled ? (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2 text-foreground">Conteúdo Bloqueado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Inscreva-se no curso para acessar todo o conteúdo
                    </p>
                    <Button onClick={enrollCourse} className="w-full netflix-button">
                      Inscrever-se Gratuitamente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.modules.map(module => (
                      <div key={module.id} className="border border-border rounded-lg">
                        <button
                          className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 netflix-transition"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div>
                            <h4 className="font-medium text-foreground">{module.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons.length} aulas
                            </p>
                          </div>
                          {expandedModules.includes(module.id) ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        
                        {expandedModules.includes(module.id) && (
                          <div className="border-t border-border">
                            {module.lessons.map(lesson => (
                              <button
                                key={lesson.id}
                                className={`w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 netflix-transition ${
                                  currentLesson?.id === lesson.id ? 'bg-primary/20 border-l-4 border-primary' : ''
                                }`}
                                onClick={() => selectLesson(lesson)}
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDuration(lesson.duration)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 