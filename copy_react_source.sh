#!/bin/bash
# ==============================================================================
# --- CONFIGURAÇÃO ---
# ==============================================================================

# Nome do arquivo de saída que conterá todo o código do projeto.
OUTPUT_FILE="dump_codigo_react.txt"

# Nome do projeto (usado no cabeçalho do arquivo de saída).
PROJECT_NAME="React Project"

# ==============================================================================
# --- INÍCIO DO SCRIPT ---
# ==============================================================================

# Garante que o script funciona a partir do seu diretório de origem.
cd "$(dirname "$0")"

# Limpa o conteúdo anterior e adiciona um cabeçalho ao arquivo de saída.
echo "=============================================" > "$OUTPUT_FILE"
echo " DUMP DO PROJETO: $PROJECT_NAME" >> "$OUTPUT_FILE"
echo " GERADO EM: $(date)" >> "$OUTPUT_FILE"
echo "=============================================\n" >> "$OUTPUT_FILE"

echo "Iniciando a cópia do código-fonte do projeto React..."

# O comando 'find' busca por arquivos, aplicando as exclusões de forma otimizada.
#
# COMO FUNCIONA A EXCLUSÃO:
# 1. '-type d \( ... \) -prune': Encontra diretórios com os nomes listados e os "poda" (prune),
#    impedindo que o 'find' entre neles. Esta é a forma mais eficiente de ignorar grandes
#    árvores de diretórios.
#    - Adicionado 'build' (padrão do Create React App) e '.next' (padrão do Next.js)
# 2. '-o': Significa 'OU'. Se o item não foi podado, a verificação continua.
# 3. '-type f': Garante que estamos processando apenas arquivos.
# 4. '-not -name "..."': Exclui arquivos específicos pelo nome.
#    - Adicionado 'yarn.lock', 'pnpm-lock.yaml' e '.env*' para cobrir outros gerenciadores
#      de pacotes e arquivos de ambiente.
# 5. '-print0 | while ...': Trata de forma segura nomes de arquivos com espaços ou caracteres especiais.
find . \
  -type d \( -name "node_modules" -o -name ".git" -o -name "build" -o -name "dist" -o -name ".next" -o -name "coverage" \) -prune \
  -o \
  -type f \
  -not -name "$OUTPUT_FILE" \
  -not -name "package-lock.json" \
  -not -name "yarn.lock" \
  -not -name "pnpm-lock.yaml" \
  -not -name ".DS_Store" \
  -not -name ".env*" \
  -print0 | while IFS= read -r -d $'\0' file; do

    # --- FILTRO DE ARQUIVOS BINÁRIOS ---

    # 1. Verificação rápida por extensão: Ignora arquivos de imagem, fontes, e binários comuns.
    #    NOTA: .svg foi REMOVIDO desta lista, pois é código (XML) e relevante para o contexto de UI.
    if [[ "$file" =~ \.(jpg|jpeg|png|gif|bmp|ico|eot|ttf|woff|woff2|otf|mp3|mp4|avi|mov|zip|gz|tar|rar|pdf|doc|docx|xls|xlsx)$ ]]; then
      continue # Pula para o próximo arquivo
    fi

    # 2. Verificação pelo conteúdo: Como um segundo nível de segurança, o comando 'file'
    #    analisa o conteúdo real do arquivo para identificar tipos binários ou de dados.
    #    Isso evita incluir arquivos binários que não tenham uma extensão comum.
    if file -b --mime-type "$file" | grep -qE 'image|binary|archive|x-dosexec|application/(octet-stream|zip|pdf|msword)'; then
      continue # Pula arquivos identificados como não-texto
    fi

    # --- FIM DO FILTRO ---

    # Se o arquivo passou em todas as verificações, seu conteúdo é adicionado ao dump.
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "ARQUIVO: $file" >> "$OUTPUT_FILE"
    echo "================================================================================\n" >> "$OUTPUT_FILE"

    # 'cat' lê o conteúdo do arquivo e '>>' anexa ao nosso arquivo de saída.
    cat "$file" >> "$OUTPUT_FILE"

    # Adiciona duas novas linhas para uma melhor separação visual entre os arquivos.
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "Arquivo '$OUTPUT_FILE' gerado com sucesso na raiz do projeto!"