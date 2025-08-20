import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Video, 
  FileText, 
  BookOpen, 
  HelpCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface LessonCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  lessons_count?: number;
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
  updated_at: string;
}

export default function Lessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<LessonCategory[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingCategory, setEditingCategory] = useState<LessonCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newLesson, setNewLesson] = useState<{
    title: string;
    description: string;
    content_type: 'video' | 'ebook' | 'material' | 'quiz';
    content_url: string;
    thumbnail_url: string;
    category_id: string;
    duration_minutes: string;
    file_size_mb: string;
    is_premium: boolean;
    is_published: boolean;
  }>({
    title: "",
    description: "",
    content_type: "video",
    content_url: "",
    thumbnail_url: "",
    category_id: "",
    duration_minutes: "",
    file_size_mb: "",
    is_premium: false,
    is_published: false,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "BookOpen",
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('lesson_categories')
        .select('*')
        .order('name');
      
      setCategories(categoriesData || []);

      // Carregar aulas
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select(`
          *,
          category:lesson_categories (
            id,
            name,
            description,
            icon
          )
        `)
        .order('category_id', { ascending: true })
        .order('order_index', { ascending: true });

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar aulas e categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!newLesson.title || !newLesson.category_id) {
      toast.error('Título e categoria são obrigatórios');
      return;
    }

    try {
      const lessonData = {
        ...newLesson,
        duration_minutes: newLesson.duration_minutes ? parseInt(newLesson.duration_minutes) : null,
        file_size_mb: newLesson.file_size_mb ? parseFloat(newLesson.file_size_mb) : null,
      };

      const { error } = await supabase
        .from('lessons')
        .insert(lessonData);

      if (error) throw error;

      toast.success('Aula criada com sucesso!');
      setIsLessonModalOpen(false);
      resetLessonForm();
      await loadData();
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast.error('Erro ao criar aula');
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson || !newLesson.title || !newLesson.category_id) {
      toast.error('Título e categoria são obrigatórios');
      return;
    }

    try {
      const lessonData = {
        ...newLesson,
        duration_minutes: newLesson.duration_minutes ? parseInt(newLesson.duration_minutes) : null,
        file_size_mb: newLesson.file_size_mb ? parseFloat(newLesson.file_size_mb) : null,
      };

      const { error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', editingLesson.id);

      if (error) throw error;

      toast.success('Aula atualizada com sucesso!');
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      resetLessonForm();
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      toast.error('Erro ao atualizar aula');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Aula excluída com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir aula:', error);
      toast.error('Erro ao excluir aula');
    }
  };

  const handleTogglePublished = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !lesson.is_published })
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success(`Aula ${!lesson.is_published ? 'publicada' : 'despublicada'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar status da aula:', error);
      toast.error('Erro ao alterar status da aula');
    }
  };

const handleCreateCategory = async () => {
  if (!newCategory.name) {
    toast.error('Nome da categoria é obrigatório');
    return;
  }

  try {
    console.log('Invocando a Edge Function para criar categoria:', newCategory);
    
    // CHAMADA PARA A EDGE FUNCTION
    const { data, error } = await supabase.functions.invoke('create-lesson-category', {
      body: newCategory
    });

    if (error) {
      const errorBody = await error.context.json();
      throw new Error(errorBody.error || "Erro ao criar categoria via função.");
    }

    console.log('Categoria criada:', data);
    toast.success('Categoria criada com sucesso!');
    setIsCategoryModalOpen(false);
    resetCategoryForm();
    await loadData(); // Recarrega os dados para mostrar a nova categoria

  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    toast.error(`Erro ao criar categoria: ${error.message}`);
  }
};

const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
  // Verificar se há aulas nesta categoria
  const categoryLessons = lessons.filter(lesson => lesson.category_id === categoryId);
  
  if (categoryLessons.length > 0) {
    toast.error(`Não é possível deletar a categoria "${categoryName}" pois ela possui ${categoryLessons.length} aula(s). Delete as aulas primeiro.`);
    return;
  }

  if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
    return;
  }

  try {
    console.log('Deletando categoria:', categoryId);
    
    const { data, error } = await supabase.functions.invoke('delete-lesson-category', {
      body: { categoryId }
    });

    if (error) {
      const errorBody = await error.context.json();
      throw new Error(errorBody.error || "Erro ao deletar categoria via função.");
    }

    console.log('Categoria deletada:', data);
    toast.success('Categoria deletada com sucesso!');
    await loadData(); // Recarrega os dados

  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error);
    toast.error(`Erro ao deletar categoria: ${error.message}`);
  }
};

  const resetLessonForm = () => {
    setNewLesson({
      title: "",
      description: "",
      content_type: "video",
      content_url: "",
      thumbnail_url: "",
      category_id: "",
      duration_minutes: "",
      file_size_mb: "",
      is_premium: false,
      is_published: false,
    });
  };

  const resetCategoryForm = () => {
    setNewCategory({
      name: "",
      description: "",
      icon: "BookOpen",
    });
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description || "",
      content_type: lesson.content_type,
      content_url: lesson.content_url || "",
      thumbnail_url: lesson.thumbnail_url || "",
      category_id: lesson.category_id,
      duration_minutes: lesson.duration_minutes?.toString() || "",
      file_size_mb: lesson.file_size_mb?.toString() || "",
      is_premium: lesson.is_premium,
      is_published: lesson.is_published,
    });
    setIsLessonModalOpen(true);
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

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout title="Aulas">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gerenciar Aulas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Aulas e Materiais</h2>
            <p className="text-muted-foreground">
              Gerencie vídeo aulas, e-books e materiais de apoio
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
            <Button onClick={() => setIsLessonModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </div>

        {/* Tabs por categoria */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="all">Todas ({lessons.length})</TabsTrigger>
                {categories.map((category) => {
                  const categoryLessons = lessons.filter(l => l.category_id === category.id);
                  return (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name} ({categoryLessons.length})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {/* Menu de ações das categorias */}
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-sm text-muted-foreground">Gerenciar Categorias:</Label>
                {categories.map((category) => (
                  <Button
                    key={`delete-${category.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    title={`Deletar categoria "${category.name}"`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <TabsContent value="all">
              <LessonsGrid 
                lessons={lessons} 
                onEdit={openEditLessonModal}
                onDelete={handleDeleteLesson}
                onTogglePublished={handleTogglePublished}
              />
            </TabsContent>

            {categories.map((category) => {
              const categoryLessons = lessons.filter(l => l.category_id === category.id);
              return (
                <TabsContent key={category.id} value={category.id}>
                  <LessonsGrid 
                    lessons={categoryLessons} 
                    onEdit={openEditLessonModal}
                    onDelete={handleDeleteLesson}
                    onTogglePublished={handleTogglePublished}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>

      {/* Modal para Aula */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Atualize as informações da aula' : 'Crie uma nova aula ou material'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da aula"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={newLesson.category_id} onValueChange={(value) => 
                  setNewLesson(prev => ({ ...prev, category_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newLesson.description}
                onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo da aula..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                <Select value={newLesson.content_type} onValueChange={(value: 'video' | 'ebook' | 'material' | 'quiz') => 
                  setNewLesson(prev => ({ ...prev, content_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="ebook">E-book</SelectItem>
                    <SelectItem value="material">Material de Apoio</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newLesson.content_type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLesson.duration_minutes}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    placeholder="Ex: 15"
                  />
                </div>
              )}

              {newLesson.content_type !== 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="file_size">Tamanho (MB)</Label>
                  <Input
                    id="file_size"
                    type="number"
                    step="0.1"
                    value={newLesson.file_size_mb}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, file_size_mb: e.target.value }))}
                    placeholder="Ex: 2.5"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_url">URL do Conteúdo</Label>
              <Input
                id="content_url"
                value={newLesson.content_url}
                onChange={(e) => setNewLesson(prev => ({ ...prev, content_url: e.target.value }))}
                placeholder={newLesson.content_type === 'video' ? 
                  'https://youtube.com/watch?v=...' : 
                  'https://example.com/material.pdf'
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL da Miniatura (opcional)</Label>
              <Input
                id="thumbnail_url"
                value={newLesson.thumbnail_url}
                onChange={(e) => setNewLesson(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://example.com/thumb.jpg"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={newLesson.is_premium}
                  onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, is_premium: checked }))}
                />
                <Label htmlFor="is_premium">Conteúdo Premium</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={newLesson.is_published}
                  onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">Publicado</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLessonModalOpen(false);
                setEditingLesson(null);
                resetLessonForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingLesson ? handleUpdateLesson : handleCreateLesson}>
              {editingLesson ? 'Atualizar' : 'Criar'} Aula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Categoria */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar as aulas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Nome *</Label>
              <Input
                id="category_name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da categoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_description">Descrição</Label>
              <Textarea
                id="category_description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da categoria..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_icon">Ícone</Label>
              <Select value={newCategory.icon} onValueChange={(value) => 
                setNewCategory(prev => ({ ...prev, icon: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BookOpen">Livro</SelectItem>
                  <SelectItem value="PlayCircle">Play</SelectItem>
                  <SelectItem value="Settings">Configurações</SelectItem>
                  <SelectItem value="MessageCircle">Mensagem</SelectItem>
                  <SelectItem value="Brain">Cérebro</SelectItem>
                  <SelectItem value="BarChart">Gráfico</SelectItem>
                  <SelectItem value="TrendingUp">Tendência</SelectItem>
                  <SelectItem value="HelpCircle">Ajuda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCategoryModalOpen(false);
                resetCategoryForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory}>
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Componente para grid de aulas
interface LessonsGridProps {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  onTogglePublished: (lesson: Lesson) => void;
}

function LessonsGrid({ lessons, onEdit, onDelete, onTogglePublished }: LessonsGridProps) {
  if (lessons.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg mb-2">Nenhuma aula encontrada</p>
        <p className="text-sm">Clique em "Nova Aula" para começar</p>
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => {
        const ContentIcon = getContentTypeIcon(lesson.content_type);
        
        return (
          <Card key={lesson.id} className="overflow-hidden">
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
                <Badge variant={lesson.is_published ? "default" : "destructive"} className="text-xs">
                  {lesson.is_published ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>

              {lesson.content_type === 'video' && lesson.duration_minutes && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {lesson.duration_minutes}min
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
                      {lesson.content_type === 'video' ? 'Vídeo' :
                       lesson.content_type === 'ebook' ? 'E-book' :
                       lesson.content_type === 'material' ? 'Material' : 'Quiz'}
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
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTogglePublished(lesson)}
                  className="h-8 px-2"
                >
                  {lesson.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lesson)}
                    className="h-8 px-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lesson.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}