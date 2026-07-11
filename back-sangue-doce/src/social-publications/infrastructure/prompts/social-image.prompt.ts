export const SOCIAL_IMAGE_PROMPT_VERSION = "social-image-v1";

export const SOCIAL_IMAGE_PROMPT = [
  "Use a imagem fornecida como referência visual principal.\n\n",
  "Crie uma nova composição para publicação em rede social, mantendo o assunto,\n",
  "a identidade visual e os elementos essenciais da imagem original.\n\n",
  "Requisitos:\n",
  "- formato quadrado, proporção 1:1;\n",
  "- composição limpa e profissional;\n",
  "- boa leitura em dispositivos móveis;\n",
  "- manter coerência com o tema do artigo;\n",
  "- não inserir logotipos de redes sociais;\n",
  "- não criar textos longos dentro da imagem;\n",
  "- não inserir dados médicos não fornecidos;\n",
  "- não modificar o sentido principal da imagem;\n",
  "- evitar aparência de banco de imagens genérico;\n",
  "- deixar margem de segurança nas bordas;\n",
  "- não adicionar marca d'água.\n\n",
  "Título de referência:\n",
  "{{title}}\n\n",
  "Resumo de referência:\n",
  "{{summary}}",
].join("");
