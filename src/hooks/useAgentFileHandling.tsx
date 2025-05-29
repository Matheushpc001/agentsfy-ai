
import { useState } from "react";

export function useAgentFileHandling() {
  const [knowledgeBaseFile, setKnowledgeBaseFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKnowledgeBaseFile(file);
      return file;
    }
    return null;
  };

  const resetFile = () => {
    setKnowledgeBaseFile(null);
  };

  return {
    knowledgeBaseFile,
    handleFileChange,
    resetFile,
  };
}
