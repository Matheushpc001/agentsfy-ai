import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Video, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  PlayCircle,
  Download,
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LessonCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'ebook' | 'material' | 'quiz';
  content_url?: string;
  thumbnail_url?: string;
  category_id: string;
  category?: LessonCategory;
  duration_minutes?: number;
  file_size_mb?: number;
  is_premium: boolean;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

interface UserProgress {
  lesson_id: string;
  progress_percentage: number;
  completed_at?: string;
}

export default function Lessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<LessonCategory[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('lesson_categories')
        .select('*')
        .order('name');
      
      setCategories(categoriesData || []);

      // Carregar apenas aulas publicadas
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_categories (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('is_published', true)
        .order('category_id', { ascending: true })
        .order('order_index', { ascending: true });

      setLessons(lessonsData || []);

      // Carregar progresso do usuário
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, progress_percentage, completed_at')
        .eq('user_id', user.id);

      setUserProgress(progressData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = async (lesson: Lesson) => {
    if (!user) return;

    try {
      // Registrar que o usuário começou a aula
      await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          progress_percentage: 0,
        });

      // Abrir conteúdo da aula
      if (lesson.content_url) {
        if (lesson.content_type === 'video') {
          // Abrir vídeo em nova aba
          window.open(lesson.content_url, '_blank');
        } else {
          // Para e-books e materiais, abrir link direto
          window.open(lesson.content_url, '_blank');
        }
      }

      // Atualizar progresso local
      await loadData();
    } catch (error) {
      console.error('Erro ao iniciar aula:', error);
      toast.error('Erro ao acessar aula');
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        });

      toast.success('Aula marcada como concluída!');
      await loadData();
    } catch (error) {
      console.error('Erro ao completar aula:', error);
      toast.error('Erro ao marcar aula como concluída');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'ebook':
        return FileText;
      case 'material':
        return BookOpen;
      case 'quiz':
        return HelpCircle;
      default:
        return BookOpen;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'ebook':
        return 'E-book';
      case 'material':
        return 'Material';
      case 'quiz':
        return 'Quiz';
      default:
        return type;
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return userProgress.find(p => p.lesson_id === lessonId);
  };

  const isLessonCompleted = (lessonId: string) => {
    const progress = getLessonProgress(lessonId);
    return progress && progress.progress_percentage === 100;
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const completedLessonsCount = lessons.filter(lesson => isLessonCompleted(lesson.id)).length;

  return (
    <DashboardLayout title="Aulas">
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Centro de Aprendizado</h2>
            <p className="text-muted-foreground">
              {completedLessonsCount} de {lessons.length} aulas concluídas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  {Math.round((completedLessonsCount / lessons.length) * 100) || 0}% Concluído
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar aulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs por categoria */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
              <TabsTrigger value="all">Todas ({lessons.length})</TabsTrigger>
              {categories.slice(0, 5).map((category) => {
                const categoryLessons = lessons.filter(l => l.category_id === category.id);
                return (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name} ({categoryLessons.length})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">Nenhuma aula encontrada</p>
                  <p className="text-sm">
                    {searchTerm ? 'Tente pesquisar por outros termos' : 'Aulas serão adicionadas em breve'}
                  </p>
                </div>
              ) : (
                filteredLessons.map((lesson) => {
                  const ContentIcon = getContentTypeIcon(lesson.content_type);
                  const progress = getLessonProgress(lesson.id);
                  const isCompleted = isLessonCompleted(lesson.id);
                  
                  return (
                    <Card key={lesson.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        {lesson.thumbnail_url ? (
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <ContentIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 flex gap-2">
                          {lesson.is_premium && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              Concluído
                            </Badge>
                          )}
                        </div>

                        {lesson.content_type === 'video' && lesson.duration_minutes && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration_minutes}min
                          </div>
                        )}

                        {lesson.content_type !== 'video' && lesson.file_size_mb && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {lesson.file_size_mb.toFixed(1)}MB
                          </div>
                        )}
                      </div>

                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-2">{lesson.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <ContentIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {getContentTypeLabel(lesson.content_type)}
                              </span>
                              {lesson.category && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.category.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lesson.description}
                          </p>
                        )}

                        {progress && progress.progress_percentage > 0 && progress.progress_percentage < 100 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progresso</span>
                              <span>{progress.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${progress.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartLesson(lesson)}
                            className="flex-1"
                            size="sm"
                          >
                            {lesson.content_type === 'video' ? (
                              <PlayCircle className="w-4 h-4 mr-2" />
                            ) : (
                              <ExternalLink className="w-4 h-4 mr-2" />
                            )}
                            {progress ? 'Continuar' : 'Iniciar'}
                          </Button>

                          {!isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteLesson(lesson.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}