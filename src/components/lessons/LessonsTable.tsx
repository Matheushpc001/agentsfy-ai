
import { VideoLesson } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LessonsTableProps {
  lessons: VideoLesson[];
}

export function LessonsTable({ lessons }: LessonsTableProps) {
  // Format date to local format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Preview</TableHead>
            <TableHead className="min-w-[200px]">Título</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="hidden lg:table-cell">Arquivos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhuma aula encontrada
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <div className="w-[80px] h-[45px] rounded overflow-hidden">
                    <img 
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] md:max-w-[300px]">
                      {lesson.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(lesson.createdAt)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {lesson.attachments.length > 0 ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                      <FileText className="h-3 w-3 mr-1" />
                      {lesson.attachments.length}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Nenhum</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
