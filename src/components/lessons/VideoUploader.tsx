
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoLesson } from "@/types";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FilePlusIcon, UploadIcon, X, Youtube } from "lucide-react";
import { toast } from "sonner";

interface VideoUploaderProps {
  onSubmit: (lesson: VideoLesson) => void;
  onCancel: () => void;
}

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  youtubeUrl: z.string().url("URL inválida").refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    "Deve ser uma URL válida do YouTube"
  ),
  thumbnailUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function VideoUploader({ onSubmit, onCancel }: VideoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      thumbnailUrl: "",
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas como thumbnail");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailPreview(reader.result as string);
      form.setValue("thumbnailUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (values: FormValues) => {
    setIsUploading(true);

    // In a real app, you would upload files to a server here
    setTimeout(() => {
      // Create new lesson with mock data
      const newLesson: VideoLesson = {
        id: `lesson-${Date.now()}`,
        title: values.title,
        description: values.description,
        youtubeUrl: values.youtubeUrl,
        thumbnailUrl: thumbnailPreview || "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: files.map((file, index) => ({
          id: `attachment-${Date.now()}-${index}`,
          lessonId: `lesson-${Date.now()}`,
          name: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type,
          fileSize: file.size,
          createdAt: new Date().toISOString(),
        })),
      };

      setIsUploading(false);
      onSubmit(newLesson);
      toast.success("Aula adicionada com sucesso!");
    }, 1500);
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Aula</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da videoaula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo desta aula"
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do YouTube</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-l-md border-y border-l border-input">
                        <Youtube className="h-4 w-4 text-red-600" />
                      </div>
                      <Input 
                        className="rounded-l-none"
                        placeholder="https://www.youtube.com/watch?v=..." 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cole o link do vídeo do YouTube
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormItem>
              <FormLabel>Thumbnail da Aula</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                  {thumbnailPreview ? (
                    <div className="relative w-full">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview"
                        className="w-full h-[180px] object-cover rounded-md" 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                        onClick={() => {
                          setThumbnailPreview(null);
                          form.setValue("thumbnailUrl", "");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <span className="font-medium text-primary hover:underline">
                          Clique para fazer upload
                        </span>
                        <span className="text-muted-foreground"> ou arraste e solte</span>
                        <p className="text-xs text-muted-foreground mt-2">
                          Recomendado: 1280x720px (16:9)
                        </p>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Carregue uma imagem para ser a miniatura da aula
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Materiais de Apoio</FormLabel>
              <FormControl>
                <div className="border rounded-md p-4 space-y-4">
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md"
                        >
                          <div className="flex items-center overflow-hidden">
                            <div className="shrink-0 mr-2">
                              <FilePlusIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 cursor-pointer"
                    >
                      <FilePlusIcon className="h-4 w-4" />
                      <span>Adicionar arquivos</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                PDF, Word, Excel, PowerPoint (máx. 10MB por arquivo)
              </FormDescription>
            </FormItem>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Enviando..." : "Publicar Aula"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
