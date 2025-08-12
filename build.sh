#!/bin/bash
# Install dependencies and build in server directory
echo "🔧 Navegando para pasta server..."
cd server

echo "📦 Instalando dependências..."
npm ci

echo "🔄 Gerando Prisma client..."
npx prisma generate

echo "🗃️ Executando migrações do banco..."
npx prisma migrate deploy

echo "🏗️ Compilando aplicação..."
npm run build

echo "✅ Build concluído!"
ls -la dist/
