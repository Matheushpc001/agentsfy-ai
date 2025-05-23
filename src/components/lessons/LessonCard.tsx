
import { VideoLesson } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, File, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: VideoLesson;
  onClick: () => void;
  compact?: boolean;
}

export function LessonCard({ lesson, onClick, compact = false }: LessonCardProps) {
  const formattedDate = new Date(lesson.createdAt).toLocaleDateString('pt-BR');
  
  const hasAttachments = lesson.attachments.length > 0;

  return (
    <Card 
      className={cn(
        "overflow-hidden border group cursor-pointer hover:shadow-md transition-shadow duration-200",
        compact ? "h-[240px]" : "h-[320px]"
      )}
      onClick={onClick}
    >
      <div className="relative h-full flex flex-col">
        {/* Thumbnail */}
        <div 
          className={cn(
            "relative w-full overflow-hidden",
            compact ? "h-[140px]" : "h-[180px]"
          )}
        >
          <img 
            src={lesson.thumbnailUrl} 
            alt={lesson.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary fill-primary ml-1" />
            </div>
          </div>
          {hasAttachments && (
            <Badge className="absolute bottom-2 right-2 bg-white/80 text-black hover:bg-white/70">
              <File className="h-3 w-3 mr-1" /> {lesson.attachments.length}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
          <h3 
            className={cn(
              "font-medium text-lg line-clamp-2 mb-1",
              compact && "text-base"
            )}
          >
            {lesson.title}
          </h3>
          
          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {lesson.description}
            </p>
          )}
          
          <div className="mt-auto flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
