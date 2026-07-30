# Manual de Arquitetura do Projeto Sangue Doce

> Versão: 1.0
>
> Objetivo: Servir como documentação oficial do projeto Sangue Doce, descrevendo toda a arquitetura técnica, SEO, Analytics, Google Ads, UX, Dashboard, Plataforma Premium e boas práticas para implementação.
>
> Público-alvo:
>
> - Desenvolvedores Backend
> - Desenvolvedores Frontend
> - DevOps
> - UX/UI
> - Marketing
> - IA (LLMs responsáveis pela implementação)

---

# COMO UTILIZAR ESTE DOCUMENTO

Cada capítulo foi planejado para ser desenvolvido de forma independente.

Uma LLM pode receber apenas um capítulo por vez.

Cada capítulo deverá conter obrigatoriamente:

- Objetivo
- Contexto
- Arquitetura
- Fluxogramas
- Diagramas Mermaid
- Diagramas PlantUML
- Exemplos
- Código
- Boas práticas
- Erros comuns
- Checklist
- Próximos passos

---

# PARTE I — VISÃO GERAL

## Capítulo 1 — O Projeto Sangue Doce

Objetivos

História

Problema que resolve

Missão

Visão

Valores

Público-alvo

Roadmap

MVP

Evolução futura

Modelo Freemium

---

## Capítulo 2 — Arquitetura Geral

Arquitetura completa

Frontend

Backend

Banco

Storage

Cloudflare

Docker

Nginx

Analytics

Google

Fluxo completo

Diagramas

---

## Capítulo 3 — Arquitetura de Pastas

Frontend

Backend

Banco

Infra

Documentação

Assets

CI/CD

Organização

Padrões

---

# PARTE II — EXPERIÊNCIA DO USUÁRIO

## Capítulo 4 — Jornada do Usuário

Primeiro acesso

Leitura

Navegação

Descoberta

Cadastro

Dashboard

Plano Premium

Retenção

Fluxos completos

---

## Capítulo 5 — Arquitetura das Páginas

Home

Artigos

Categorias

Autor

Sobre

Contato

Landing

Dashboard

Perfil

Administração

SEO

Hierarquia

---

## Capítulo 6 — Wireframes

Desktop

Tablet

Mobile

Componentes

Layouts

UX

CTA

---

# PARTE III — SEO

## Capítulo 7 — SEO explicado do zero

Como Google funciona

Crawler

Indexação

Ranking

SERP

Palavras-chave

EEAT

YMYL

SEO Técnico

SEO On-page

SEO Off-page

---

## Capítulo 8 — SEO Técnico

robots.txt

sitemap.xml

Canonical

Meta Tags

OpenGraph

Twitter Cards

RSS

Manifest

Schema.org

JSON-LD

Breadcrumb

Rich Results

404

301

302

410

Paginação

hreflang

---

## Capítulo 9 — SEO para Next.js

App Router

Metadata

generateMetadata

SSR

ISR

SSG

Streaming

Image Optimization

Lazy Loading

Cache

Performance

---

## Capítulo 10 — SEO para Conteúdo Médico

YMYL

EEAT

Autoridade

Fontes

Referências

Aviso Médico

Atualizações

Autoria

Boas práticas

Políticas Google

---

# PARTE IV — CONTEÚDO

## Capítulo 11 — Estrutura dos Artigos

Título

Resumo

Imagem

Introdução

Hierarquia H1 H2 H3

Conclusão

CTA

Autor

Referências

Schema

SEO

---

## Capítulo 12 — Estratégia de Conteúdo

Clusters

Topical Authority

Categorias

Calendário Editorial

Interligação

Links internos

Tags

---

# PARTE V — ANALYTICS

## Capítulo 13 — Google Analytics 4

GA4

Conceitos

Eventos

Usuários

Sessões

Conversões

Funis

Attribution

Debug

---

## Capítulo 14 — Eventos do Sangue Doce

Todos os eventos

page_view

scroll

article_view

article_finished

cta_click

newsletter

signup

login

measurement_created

measurement_updated

measurement_deleted

subscription_created

payment_success

etc.

Tabela completa.

---

## Capítulo 15 — Arquitetura de Tracking

Fluxo

Frontend

Backend

GA4

Tag Manager

Cookies

Consentimento

LGPD

---

## Capítulo 16 — Dashboards Analytics

Dashboards

Visitantes

Artigos

Conversão

Tempo

Origem

Engajamento

Heatmaps

---

# PARTE VI — GOOGLE

## Capítulo 17 — Google Search Console

Configuração

DNS

Validação

Sitemap

Performance

Cobertura

Erros

Indexação

Solicitação

---

## Capítulo 18 — Google Ads

Tipos de campanhas

Landing Pages

Conversões

Políticas

Palavras-chave

Performance Max

Search

Remarketing

---

## Capítulo 19 — Google Ads para Saúde

Restrições

Boas práticas

Conteúdo permitido

Conteúdo proibido

Landing Pages

Aprovação

Checklist

---

# PARTE VII — DASHBOARD

## Capítulo 20 — Dashboard Gratuita

Cadastro

Login

JWT

Refresh Token

Perfil

Medições

Histórico

Gráficos

Dashboard

---

## Capítulo 21 — Dashboard Premium

Benefícios

Pagamentos

Assinaturas

Permissões

Recursos exclusivos

Cancelamento

Webhook

---

## Capítulo 22 — Estrutura do Banco

Modelagem

Usuário

Medições

Artigos

Categorias

Autores

Assinaturas

Analytics

Relacionamentos

---

# PARTE VIII — FRONTEND

## Capítulo 23 — Arquitetura Next.js

Estrutura

Layouts

Providers

Hooks

State

Cache

Fetch

Boas práticas

---

## Capítulo 24 — Componentização

Navbar

Cards

CTA

Footer

Sidebar

Forms

Skeleton

Loading

Erro

---

# PARTE IX — BACKEND

## Capítulo 25 — Arquitetura NestJS

Modules

Controllers

Services

Repositories

DTO

Validation

Exceptions

Logs

---

## Capítulo 26 — API Pública

Endpoints

Versionamento

Swagger

OpenAPI

Paginação

Filtros

Rate Limit

---

## Capítulo 27 — Segurança

JWT

Refresh

RBAC

CSRF

XSS

CORS

Headers

LGPD

OWASP

---

# PARTE X — PERFORMANCE

## Capítulo 28 — Core Web Vitals

LCP

CLS

INP

TTFB

Cache

Compressão

CDN

Imagens

---

## Capítulo 29 — Observabilidade

Logs

Prometheus

Grafana

Loki

Alertas

Métricas

Tracing

---

# PARTE XI — DEVOPS

## Capítulo 30 — Infraestrutura

Docker

Compose

Nginx

Cloudflare

MinIO

Backup

Deploy

SSL

---

## Capítulo 31 — CI/CD

GitHub Actions

Build

Testes

Deploy

Rollback

Versionamento

---

# PARTE XII — APLICATIVO

## Capítulo 32 — Aplicativo Android

Arquitetura

Offline

Sincronização

Autenticação

Dashboard

Notificações

---

## Capítulo 33 — Aplicativo iOS

Planejamento

Arquitetura

Roadmap

---

# PARTE XIII — IA

## Capítulo 34 — Inteligência Artificial

Agentes

Chatbot

Interpretação

Insights

Alertas

LLM

Prompt Engineering

---

# PARTE XIV — MARKETING

## Capítulo 35 — Estratégia Digital

LinkedIn

Instagram

SEO

Newsletter

Blog

Autoridade

Comunidade

---

## Capítulo 36 — Landing Pages

Estrutura

Copy

CTA

Conversão

Testes A/B

---

# PARTE XV — QUALIDADE

## Capítulo 37 — Testes

Unitários

Integração

E2E

Performance

Carga

Segurança

---

## Capítulo 38 — Acessibilidade

WCAG

Contraste

Leitores

Teclado

Semântica

---

# PARTE XVI — CHECKLISTS

## Capítulo 39 — Checklist de SEO

Checklist completo

---

## Capítulo 40 — Checklist Analytics

Checklist completo

---

## Capítulo 41 — Checklist Google Ads

Checklist completo

---

## Capítulo 42 — Checklist Produção

Checklist completo

---

# PARTE XVII — ROADMAP

## Capítulo 43 — Evolução do Projeto

Fase 1

Site

↓

Fase 2

Dashboard

↓

Fase 3

Aplicativo

↓

Fase 4

Premium

↓

Fase 5

IA

↓

Fase 6

Integrações

↓

Fase 7

Escalabilidade

---

# APÊNDICES

A. Glossário

B. Referências

C. RFCs

D. ADRs

E. Convenções

F. Fluxogramas

G. Diagramas

H. Exemplos

I. Prompts para IA

J. Templates

K. Padrões de Código

L. Guia para futuras LLMs

---

# INSTRUÇÃO PARA OUTRAS LLMs

Cada capítulo deverá ser escrito de forma extremamente detalhada, assumindo que o leitor possui conhecimento intermediário em desenvolvimento de software, mas pouca experiência em SEO, Marketing Digital, Analytics e Google Ads.

Cada capítulo deve conter:

- Explicação conceitual.
- Motivação da implementação.
- Arquitetura recomendada.
- Alternativas possíveis.
- Prós e contras.
- Diagramas Mermaid.
- Diagramas PlantUML.
- Fluxogramas.
- Exemplos reais aplicados ao projeto Sangue Doce.
- Exemplos completos em Next.js 16.
- Exemplos completos em NestJS 11.
- Exemplos de banco PostgreSQL.
- Estratégias de escalabilidade.
- Estratégias de segurança.
- Estratégias de performance.
- Checklist final de implementação.
- Referências oficiais (Google, Next.js, NestJS, OWASP, W3C, Schema.org, etc.).
