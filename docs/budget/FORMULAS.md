# Fórmulas do modelo

## Banco

- medições/mês = usuários ativos × medições por usuário/dia × dias do mês;
- armazenamento bruto = medições/mês × tamanho médio da medição;
- custo por usuário = custo mensal do serviço ÷ usuários cadastrados.

## Storage

- PDFs = usuários ativos × PDFs por usuário/mês × tamanho médio do PDF;
- fotos = usuários ativos × fotos por usuário/mês × tamanho médio da foto;
- avatares = usuários cadastrados × tamanho do avatar;
- imagens IA = usuários ativos × imagens IA por usuário/mês × tamanho médio da imagem.

## IA

- tokens/mês = usuários ativos × consultas por usuário/mês × (tokens de entrada + tokens de saída);
- custo IA = (tokens de entrada / 1.000.000 × preço de entrada) + (tokens de saída / 1.000.000 × preço de saída).

## Receita e lucro

- receita = usuários Premium × preço Premium + usuários Familiares × preço Familiar;
- margem de contribuição = (receita - custos variáveis) ÷ receita;
- lucro líquido estimado = receita - infraestrutura - IA - gateway - impostos - marketing - suporte - outros.

O arquivo CSV de cenários é compatível com Excel/LibreOffice, mas as referências estão demonstradas com os valores-base. Ao usar a planilha final, centralize as referências na aba Premissas para evitar números fixos nas fórmulas.
