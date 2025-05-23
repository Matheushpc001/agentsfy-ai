
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoUploader } from "@/components/lessons/VideoUploader";
import { LessonsTable } from "@/components/lessons/LessonsTable";
import { Plus } from "lucide-react";
import { VideoLesson } from "@/types";

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
  }
];

export default function Lessons() {
  const [activeTab, setActiveTab] = useState("todas");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [lessons, setLessons] = useState<VideoLesson[]>(MOCK_LESSONS);

  const handleAddLesson = (newLesson: VideoLesson) => {
    setLessons([newLesson, ...lessons]);
    setShowUploadForm(false);
  };

  return (
    <DashboardLayout title="Aulas">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Gerenciamento de Videoaulas</h2>
          {!showUploadForm && (
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Nova Aula
            </Button>
          )}
        </div>

        {showUploadForm ? (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <VideoUploader 
                onSubmit={handleAddLesson} 
                onCancel={() => setShowUploadForm(false)} 
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="todas">Todas as Aulas</TabsTrigger>
              <TabsTrigger value="recentes">Adicionadas Recentemente</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="pt-4">
              <LessonsTable lessons={lessons} />
            </TabsContent>
            
            <TabsContent value="recentes" className="pt-4">
              <LessonsTable 
                lessons={lessons.sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).slice(0, 5)} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
