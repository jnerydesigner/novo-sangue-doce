# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl \
  && corepack enable

FROM base AS deps

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build

ENV DATABASE_URL=postgresql://sangue_doce:sangue_doce@localhost:5432/sangue_doce?schema=public

COPY nest-cli.json prisma.config.ts tsconfig.build.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN yarn prisma:generate \
  && yarn build

FROM base AS production-deps

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts \
  && yarn cache clean

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV SERVER_PORT=3011

RUN apk add --no-cache openssl

COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --chown=node:node package.json ./

USER node

EXPOSE 3011

CMD ["node", "dist/src/main.js"]
