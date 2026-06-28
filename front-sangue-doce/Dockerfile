FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

ARG NEXT_PUBLIC_API_URL=http://localhost:3011
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3010
ARG NEXT_IMAGE_UNOPTIMIZED=false
ARG NEXT_PUBLIC_MINIO_PUBLIC_URL=http://localhost:9610
ARG NEXT_PUBLIC_MINIO_PUBLIC_PATH=/sangue-doce/public
ARG NEXT_PUBLIC_BRAND_LOGO_PATH=/sangue-doce-logo.png

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_IMAGE_UNOPTIMIZED=$NEXT_IMAGE_UNOPTIMIZED
ENV NEXT_PUBLIC_MINIO_PUBLIC_URL=$NEXT_PUBLIC_MINIO_PUBLIC_URL
ENV NEXT_PUBLIC_MINIO_PUBLIC_PATH=$NEXT_PUBLIC_MINIO_PUBLIC_PATH
ENV NEXT_PUBLIC_BRAND_LOGO_PATH=$NEXT_PUBLIC_BRAND_LOGO_PATH

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_IMAGE_UNOPTIMIZED=false
ENV NODE_ENV=production
ENV PORT=3010

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3010

CMD ["node", "server.js"]
