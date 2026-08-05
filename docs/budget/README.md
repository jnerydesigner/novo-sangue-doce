# Sangue Doce Economics

Modelo inicial de unit economics para simular o Sangue Doce de 100 a 100.000 usuários.

## Como usar

Use os arquivos CSV como base de importação para Excel ou LibreOffice. A aba Premissas contém as entradas editáveis e a aba Cenários contém as fórmulas iniciais; os demais documentos descrevem as dimensões de custo e o roadmap.

- valores de infraestrutura estão em BRL e são exemplos editáveis;
- usuários ativos e Premium são percentuais dos cadastrados;
- custo de IA considera consultas, tokens e preço por milhão de tokens;
- banco e storage são estimativas de crescimento, não medição real do Neon/MinIO;
- impostos, gateway de pagamento, suporte, marketing e folha ainda devem ser preenchidos antes de usar o modelo para decisão financeira.

## Abas

1. Premissas — entradas editáveis.
2. Cenários — 100, 500, 1.000, 2.000, 10.000, 50.000 e 100.000 usuários.
3. Banco — medições, crescimento e consumo estimado.
4. Storage — PDFs, fotos, avatares e imagens de IA.
5. IA — consultas, tokens e custo mensal por modelo.
6. Servidor — faixas de infraestrutura e custo mensal.
7. Receita — gratuito, Premium e Familiar.
8. Lucro — receita, custos, margem de contribuição e lucro líquido.
9. Roadmap Infra — gatilhos de evolução operacional.

Preencher com faturas e métricas mensais: Neon/PostgreSQL, VPS/EC2, MinIO/S3, e-mail, observabilidade, backups, gateway, OpenAI/Gemini e impostos.
