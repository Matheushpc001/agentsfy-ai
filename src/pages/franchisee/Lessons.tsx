
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoLesson } from "@/types";
import { LessonCard } from "@/components/lessons/LessonCard";
import { Search } from "lucide-react";

// Mock data for lessons
const MOCK_LESSONS: VideoLesson[] = [
  {
    id: "1",
    title: "Introdução à Plataforma",
    description: "Uma aula introdutória sobre como utilizar a plataforma de vendas.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2023-05-20T14:30:00Z",
    updatedAt: "2023-05-20T14:30:00Z",
    attachments: [
      {
        id: "a1",
        lessonId: "1",
        name: "Manual da Plataforma.pdf",
        fileUrl: "/documents/manual.pdf",
        fileType: "application/pdf",
        fileSize: 2458000,
        createdAt: "2023-05-20T14:35:00Z"
      }
    ]
  },
  {
    id: "2",
    title: "Técnicas Avançadas de Vendas",
    description: "Aprenda técnicas de vendas que aumentarão sua taxa de conversão.",
    youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2023-06-16T11:20:00Z",
    attachments: [
      {
        id: "a2",
        lessonId: "2",
        name: "Slides da Apresentação.pptx",
        fileUrl: "/documents/slides.pptx",
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        fileSize: 3580000,
        createdAt: "2023-06-15T10:05:00Z"
      },
      {
        id: "a3",
        lessonId: "2",
        name: "Planilha de Exemplos.xlsx",
        fileUrl: "/documents/exemplos.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 1240000,
        createdAt: "2023-06-15T10:10:00Z"
      }
    ]
  },
  {
    id: "3",
    title: "Atendimento ao Cliente",
    description: "Como oferecer um atendimento excepcional aos seus clientes.",
    youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2023-07-10T09:30:00Z",
    updatedAt: "2023-07-10T09:30:00Z",
    attachments: []
  },
  {
    id: "4",
    title: "Marketing Digital para Vendas",
    description: "Estratégias de marketing digital para aumentar suas vendas.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2023-08-05T15:45:00Z",
    updatedAt: "2023-08-05T15:45:00Z",
    attachments: []
  },
  {
    id: "5",
    title: "Negociação e Fechamento",
    description: "Técnicas de negociação para fechar mais vendas.",
    youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnailUrl: "https://images.unsplash.com/photo-1560438718-eb61ede255eb?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2023-09-12T14:30:00Z",
    updatedAt: "2023-09-12T14:30:00Z",
    attachments: []
  }
];

// Categorize lessons
const recentLessons = MOCK_LESSONS.sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
).slice(0, 3);

export default function Lessons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  
  // Filter lessons based on search query
  const filteredLessons = searchQuery 
    ? MOCK_LESSONS.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_LESSONS;

  return (
    <DashboardLayout title="Aulas">
      <div className="space-y-8">
        {/* Hero section with search */}
        <div className="relative h-48 md:h-64 lg:h-72 rounded-lg overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center px-6 md:px-12">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                Centro de Aprendizado
              </h1>
              <p className="text-white/90 text-sm md:text-base mb-6">
                Aprimore suas habilidades com nossas videoaulas exclusivas
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar aulas"
                  className="pl-9 bg-white/10 text-white border-white/20 focus:bg-white/20 placeholder:text-white/60"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recentes */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Adicionados Recentemente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLessons.map(lesson => (
              <LessonCard 
                key={lesson.id}
                lesson={lesson}
                onClick={() => setSelectedLesson(lesson)}
              />
            ))}
          </div>
        </section>

        {/* All lessons */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Todas as Aulas</h2>
          <ScrollArea className="h-full w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredLessons.map(lesson => (
                <LessonCard 
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => setSelectedLesson(lesson)}
                  compact
                />
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* Player Dialog */}
        {selectedLesson && (
          <LessonPlayerDialog 
            lesson={selectedLesson} 
            onClose={() => setSelectedLesson(null)} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}

interface LessonPlayerDialogProps {
  lesson: VideoLesson;
  onClose: () => void;
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileIcon, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function LessonPlayerDialog({ lesson, onClose }: LessonPlayerDialogProps) {
  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(lesson.youtubeUrl);

  return (
    <Dialog open={!!lesson} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6">
          <DialogTitle className="text-xl md:text-2xl">{lesson.title}</DialogTitle>
        </DialogHeader>

        {embedUrl && (
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {lesson.description}
          </p>

          {lesson.attachments.length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="font-medium mb-3">Materiais de Apoio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.attachments.map((attachment) => (
                  <a 
                    href={attachment.fileUrl} 
                    key={attachment.id}
                    className="flex items-center p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    download
                  >
                    {attachment.fileType.includes('pdf') ? (
                      <FileText className="h-5 w-5 text-red-500 mr-2" />
                    ) : attachment.fileType.includes('spreadsheet') ? (
                      <FileIcon className="h-5 w-5 text-green-500 mr-2" />
                    ) : attachment.fileType.includes('presentation') ? (
                      <FileIcon className="h-5 w-5 text-orange-500 mr-2" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate">{attachment.name}</span>
                      <span className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
