import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Download,
  Play,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  GripVertical,
  BookOpen,
  User
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminCourses } from '../../lib/adminApi';
import { API_CONFIG } from '../../config/api';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  thumbnail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules: CourseModule[];
  _count: {
    modules: number;
    lessons: number;
    enrollments: number;
  };
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessons: CourseLesson[];
  _count: {
    lessons: number;
  };
}

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz';
  content: string;
  videoUrl?: string;
  thumbnail?: string;
  duration: number;
  order: number;
  moduleId: string;
  materials: CourseMaterial[];
  _count: {
    materials: number;
  };
}

interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'image' | 'video';
  url: string;
  size: number;
  lessonId: string;
}

export const AdminCourses: React.FC = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    author: '',
    thumbnail: '',
    isActive: true
  });

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 0
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'text' | 'quiz',
    content: '',
    videoUrl: '',
    thumbnail: '',
    duration: 0,
    order: 1
  });

  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'pdf' as 'pdf' | 'doc' | 'image' | 'video',
    file: null as File | null
  });

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await adminCourses.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      toast({ title: 'Erro ao carregar cursos', description: 'Tente novamente', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Course CRUD
  const handleCreateCourse = async () => {
    try {
      await adminCourses.createCourse(courseForm);
      toast({ title: 'Curso criado com sucesso!' });
      setShowCourseModal(false);
      setCourseForm({ title: '', description: '', category: '', author: '', thumbnail: '', isActive: true });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao criar curso', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      await adminCourses.updateCourse(selectedCourse.id, courseForm);
      toast({ title: 'Curso atualizado com sucesso!' });
      setShowCourseModal(false);
      setSelectedCourse(null);
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao atualizar curso', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await adminCourses.deleteCourse(courseId);
      toast({ title: 'Curso excluído com sucesso!' });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao excluir curso', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  // Module CRUD
  const handleCreateModule = async () => {
    if (!selectedCourse) return;
    try {
      await adminCourses.createCourseModule({ ...moduleForm, courseId: selectedCourse.id });
      toast({ title: 'Módulo criado com sucesso!' });
      setShowModuleModal(false);
      setModuleForm({ title: '', description: '', order: 0 });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao criar módulo', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleUpdateModule = async () => {
    if (!selectedModule) return;
    try {
      await adminCourses.updateCourseModule(selectedModule.id, moduleForm);
      toast({ title: 'Módulo atualizado com sucesso!' });
      setShowModuleModal(false);
      setSelectedModule(null);
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao atualizar módulo', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este módulo?')) return;
    try {
      await adminCourses.deleteCourseModule(moduleId);
      toast({ title: 'Módulo excluído com sucesso!' });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao excluir módulo', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  // Lesson CRUD
  const handleCreateLesson = async () => {
    if (!selectedModule) return;
    try {
      await adminCourses.createCourseLesson({ ...lessonForm, moduleId: selectedModule.id });
      toast({ title: 'Aula criada com sucesso!' });
      setShowLessonModal(false);
      setLessonForm({
        title: '',
        description: '',
        type: 'video',
        content: '',
        videoUrl: '',
        thumbnail: '',
        duration: 0,
        order: 1
      });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao criar aula', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleUpdateLesson = async () => {
    if (!selectedLesson) return;
    try {
      await adminCourses.updateCourseLesson(selectedLesson.id, lessonForm);
      toast({ title: 'Aula atualizada com sucesso!' });
      setShowLessonModal(false);
      setSelectedLesson(null);
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao atualizar aula', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;
    try {
      await adminCourses.deleteCourseLesson(lessonId);
      toast({ title: 'Aula excluída com sucesso!' });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao excluir aula', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  // Material upload
  const handleUploadMaterial = async () => {
    if (!materialForm.file || !selectedLesson) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', materialForm.file);
      formData.append('type', materialForm.type);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.url) {
        await adminCourses.createCourseMaterial({
          title: materialForm.title,
          type: materialForm.type,
          url: result.url,
          size: materialForm.file.size,
          lessonId: selectedLesson.id
        });
        
        toast({ title: 'Material enviado com sucesso!' });
        setShowMaterialModal(false);
        setMaterialForm({ title: '', type: 'pdf', file: null });
        loadCourses();
      }
    } catch (error) {
      toast({ title: 'Erro ao enviar material', description: 'Tente novamente', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;
    try {
      await adminCourses.deleteCourseMaterial(materialId);
      toast({ title: 'Material excluído com sucesso!' });
      loadCourses();
    } catch (error) {
      toast({ title: 'Erro ao excluir material', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  // Toggle expanded states
  const toggleModuleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleLessonExpanded = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Format helpers
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'doc': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração de Cursos</h1>
          <p className="text-gray-600">Gerencie cursos, módulos, aulas e materiais</p>
        </div>
        <Button onClick={() => setShowCourseModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Cursos</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cursos Ativos</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.isActive).length}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Módulos</p>
                <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Aulas</p>
                <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.modules.reduce((moduleSum, m) => moduleSum + (m.lessons?.length || 0), 0), 0)}</p>
              </div>
              <Video className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {course.author}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        0 alunos
                      </span>
                      <Badge variant={course.isActive ? 'default' : 'secondary'}>
                        {course.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModuleExpanded(course.id)}
                  >
                    {expandedModules.has(course.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setCourseForm({
                        title: course.title,
                        description: course.description,
                        category: course.category,
                        author: course.author,
                        thumbnail: course.thumbnail,
                        isActive: course.isActive
                      });
                      setShowCourseModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedModules.has(course.id) && (
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Módulos ({course.modules?.length || 0})</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setModuleForm({
                          title: '',
                          description: '',
                          order: course.modules.length + 1
                        });
                        setShowModuleModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Módulo
                    </Button>
                  </div>

                  {course.modules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium">{module.title}</h4>
                          <Badge variant="outline">{(module.lessons?.length || 0)} aulas</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleLessonExpanded(module.id)}
                          >
                            {expandedLessons.has(module.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setSelectedLesson(undefined);
                              setLessonForm({
                                title: '',
                                description: '',
                                type: 'video',
                                content: '',
                                videoUrl: '',
                                thumbnail: '',
                                duration: 0,
                                order: (module.lessons?.length || 0) + 1
                              });
                              setShowLessonModal(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Aula
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedLessons.has(module.id) && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">Aulas</h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedModule(module);
                                setSelectedLesson(null);
                                setLessonForm({
                                  title: '',
                                  description: '',
                                  type: 'video',
                                  content: '',
                                  videoUrl: '',
                                  thumbnail: '',
                                  duration: 0,
                                  order: (module.lessons?.length || 0) + 1
                                });
                                setShowLessonModal(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Nova Aula
                            </Button>
                          </div>

                          {(module.lessons || []).map((lesson) => (
                            <div key={lesson.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <div className="flex items-center space-x-3">
                                    {lesson.thumbnail && (
                                      <img 
                                        src={lesson.thumbnail} 
                                        alt={lesson.title}
                                        className="w-12 h-8 object-cover rounded"
                                      />
                                    )}
                                    <div>
                                      <h6 className="font-medium text-sm">{lesson.title}</h6>
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <span>{lesson.type}</span>
                                        <span>•</span>
                                        <span>{formatDuration(lesson.duration)}</span>
                                        <span>•</span>
                                        <span>{(lesson.materials?.length || 0)} materiais</span>
                                        {lesson.videoUrl && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center">
                                              <Video className="w-3 h-3 mr-1" />
                                              Vídeo
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLesson(lesson);
                                      setLessonForm({
                                        title: lesson.title,
                                        description: lesson.description,
                                        type: lesson.type || (lesson.videoUrl ? 'video' : 'text'),
                                        content: lesson.content,
                                        videoUrl: lesson.videoUrl || '',
                                        thumbnail: lesson.thumbnail || '',
                                        duration: lesson.duration,
                                        order: lesson.order
                                      });
                                      setShowLessonModal(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Materials */}
                              {(lesson.materials || []).length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <h6 className="text-xs font-medium text-gray-600">Materiais:</h6>
                                  {(lesson.materials || []).map((material) => (
                                    <div key={material.id} className="flex items-center justify-between bg-white rounded p-2">
                                      <div className="flex items-center space-x-2">
                                        {getMaterialIcon(material.type)}
                                        <span className="text-sm">{material.title}</span>
                                        <span className="text-xs text-gray-500">
                                          ({formatFileSize(material.size)})
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(material.url, '_blank')}
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDeleteMaterial(material.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(lessonForm.type === 'video' || lessonForm.videoUrl || lessonForm.thumbnail) && (
                                <>
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium">Vídeo da Aula</label>
                                    <div className="mt-1 flex items-center gap-4">
                                      {lessonForm.videoUrl && (
                                        <div className="mb-2 flex items-center gap-2">
                                          <video 
                                            src={lessonForm.videoUrl} 
                                            controls 
                                            className="w-full max-w-md h-32 object-cover rounded border"
                                          />
                                          <Button type="button" variant="outline" size="sm" onClick={() => setLessonForm({ ...lessonForm, videoUrl: '' })}>
                                            Remover vídeo
                                          </Button>
                                        </div>
                                      )}
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            try {
                                              const formData = new FormData();
                                              formData.append('file', file);
                                              formData.append('type', 'video');
                                              const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
                                                method: 'POST',
                                                headers: {
                                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                                },
                                                body: formData
                                              });
                                              const result = await response.json();
                                              if (result.url) {
                                                setLessonForm({ ...lessonForm, videoUrl: result.url });
                                                e.target.value = '';
                                              }
                                            } catch (error) {
                                              console.error('Erro ao fazer upload:', error);
                                            }
                                          }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      />
                                    </div>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium">Capa do Vídeo</label>
                                    <div className="mt-1 flex items-center gap-4">
                                      {lessonForm.thumbnail && (
                                        <div className="mb-2 flex items-center gap-2">
                                          <img 
                                            src={lessonForm.thumbnail} 
                                            alt="Capa do vídeo" 
                                            className="w-32 h-20 object-cover rounded border"
                                          />
                                          <Button type="button" variant="outline" size="sm" onClick={() => setLessonForm({ ...lessonForm, thumbnail: '' })}>
                                            Remover imagem
                                          </Button>
                                        </div>
                                      )}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            try {
                                              const formData = new FormData();
                                              formData.append('file', file);
                                              formData.append('type', 'image');
                                              const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
                                                method: 'POST',
                                                headers: {
                                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                                },
                                                body: formData
                                              });
                                              const result = await response.json();
                                              if (result.url) {
                                                setLessonForm({ ...lessonForm, thumbnail: result.url });
                                                e.target.value = '';
                                              }
                                            } catch (error) {
                                              console.error('Erro ao fazer upload:', error);
                                            }
                                          }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Descrição</label>
                                <Textarea
                                  value={lessonForm.description}
                                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                  placeholder="Descrição da aula"
                                  rows={3}
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Conteúdo</label>
                                <Textarea
                                  value={lessonForm.content}
                                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                                  placeholder="Conteúdo da aula (texto, HTML, etc.)"
                                  rows={6}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Course Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Novo Curso'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do curso
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Título do curso"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                placeholder="Ex: Desenvolvimento, Marketing"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Autor</label>
              <Input
                value={courseForm.author}
                onChange={(e) => setCourseForm({ ...courseForm, author: e.target.value })}
                placeholder="Nome do autor"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Capa do Curso</label>
              <div className="mt-1">
                {courseForm.thumbnail && (
                  <div className="mb-2">
                    <img 
                      src={courseForm.thumbnail} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'image');
                        
                        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                          },
                          body: formData
                        });
                        
                        const result = await response.json();
                        if (result.url) {
                          setCourseForm({ ...courseForm, thumbnail: result.url });
                        }
                      } catch (error) {
                        console.error('Erro ao fazer upload:', error);
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Descrição detalhada do curso"
                rows={4}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={courseForm.isActive}
              onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm">Curso ativo</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCourseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedCourse ? handleUpdateCourse : handleCreateCourse}>
              {selectedCourse ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Modal */}
      <Dialog open={showModuleModal} onOpenChange={setShowModuleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
            </DialogTitle>
            <DialogDescription>
              Configure os dados do módulo do curso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Título do módulo"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Descrição do módulo"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ordem</label>
              <Input
                type="number"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowModuleModal(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedModule ? handleUpdateModule : handleCreateModule}>
              {selectedModule ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
            <DialogDescription>
              Configure os dados da aula do módulo
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Título da aula"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={lessonForm.type} onValueChange={(value: 'video' | 'text' | 'quiz') => setLessonForm({ ...lessonForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Duração (minutos)</label>
              <Input
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ordem</label>
              <Input
                type="number"
                value={lessonForm.order}
                onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>

            {lessonForm.type === 'video' && (
              <>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Vídeo da Aula</label>
                  <div className="mt-1 flex items-center gap-4">
                    {lessonForm.videoUrl && (
                      <div className="mb-2 flex items-center gap-2">
                        <video 
                          src={lessonForm.videoUrl} 
                          controls 
                          className="w-full max-w-md h-32 object-cover rounded border"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => setLessonForm({ ...lessonForm, videoUrl: '' })}>
                          Remover vídeo
                        </Button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'video');
                            const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                              },
                              body: formData
                            });
                            const result = await response.json();
                            if (result.url) {
                              setLessonForm({ ...lessonForm, videoUrl: result.url });
                              e.target.value = '';
                            }
                          } catch (error) {
                            console.error('Erro ao fazer upload:', error);
                          }
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Capa do Vídeo</label>
                  <div className="mt-1 flex items-center gap-4">
                    {lessonForm.thumbnail && (
                      <div className="mb-2 flex items-center gap-2">
                        <img 
                          src={lessonForm.thumbnail} 
                          alt="Capa do vídeo" 
                          className="w-32 h-20 object-cover rounded border"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => setLessonForm({ ...lessonForm, thumbnail: '' })}>
                          Remover imagem
                        </Button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'image');
                            const response = await fetch(`${API_CONFIG.BASE_URL}/admin/courses/upload`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                              },
                              body: formData
                            });
                            const result = await response.json();
                            if (result.url) {
                              setLessonForm({ ...lessonForm, thumbnail: result.url });
                              e.target.value = '';
                            }
                          } catch (error) {
                            console.error('Erro ao fazer upload:', error);
                          }
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Descrição da aula"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Conteúdo da aula (texto, HTML, etc.)"
                rows={6}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLessonModal(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedLesson ? handleUpdateLesson : handleCreateLesson}>
              {selectedLesson ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Modal */}
      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Material</DialogTitle>
            <DialogDescription>
              Faça upload de materiais de apoio para a aula
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Nome do material"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={materialForm.type} onValueChange={(value: 'pdf' | 'doc' | 'image' | 'video') => setMaterialForm({ ...materialForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Documento</SelectItem>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Arquivo</label>
              <Input
                type="file"
                onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                accept={materialForm.type === 'pdf' ? '.pdf' : materialForm.type === 'doc' ? '.doc,.docx' : materialForm.type === 'image' ? 'image/*' : 'video/*'}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowMaterialModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadMaterial} disabled={uploading || !materialForm.file}>
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 