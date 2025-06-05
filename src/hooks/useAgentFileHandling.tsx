
import { useState } from "react";

export function useAgentFileHandling() {
  const [knowledgeBaseFile, setKnowledgeBaseFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['.pdf', '.txt', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        console.error('Tipo de arquivo não suportado:', fileExtension);
        return null;
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.error('Arquivo muito grande:', file.size);
        return null;
      }

      setKnowledgeBaseFile(file);
      console.log('Arquivo selecionado:', file.name);
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
