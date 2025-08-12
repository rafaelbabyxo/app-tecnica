#!/bin/bash

# Script para copiar arquivos do server para raiz durante o build
echo "🔧 Preparando build..."

# Copiar package.json do server para raiz
cp server/package.json ./
cp server/tsconfig.json ./
cp server/nest-cli.json ./

# Copiar código fonte
mkdir -p src
cp -r server/src/* src/
cp -r server/prisma ./

echo "📦 Instalando dependências..."
npm ci

echo "🔄 Gerando Prisma client..."
npx prisma generate

echo "🗃️ Executando migrações..."
npx prisma migrate deploy

echo "🏗️ Compilando aplicação..."
npm run build

echo "✅ Build concluído!"
ls -la dist/
