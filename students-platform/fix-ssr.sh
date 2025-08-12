#!/bin/bash

# Script para adicionar tratamento de erro em getServerSideProps

echo "Adicionando tratamento de erro em todas as páginas..."

# Lista de arquivos para corrigir
files=(
  "pages/practical-classes/index.tsx"
  "pages/info/index.tsx" 
  "pages/theoretical-classes/index.tsx"
  "pages/test-notifications/index.tsx"
  "pages/forgot-password/index.tsx"
  "pages/reset-password/[token].tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processando $file..."
    
    # Backup do arquivo original
    cp "$file" "$file.backup"
    
    # Adicionar try-catch ao getServerSideProps
    sed -i '' 's/export const getServerSideProps: GetServerSideProps = async ctx => {/export const getServerSideProps: GetServerSideProps = async ctx => {\
  try {/g' "$file"
    
    sed -i '' 's/const { '\''@studentsPlatform:student'\'': student } = parseCookies({ req: ctx.req })/const cookies = parseCookies({ req: ctx.req })\
    const student = cookies['\''@studentsPlatform:student'\'']/' "$file"
    
    # Adicionar catch no final
    sed -i '' '/return {$/,/}$/c\
    return {\
      props: {\
        student: student ? JSON.parse(student) : null\
      },\
    }\
  } catch (error) {\
    console.error('\''SSR Error:'\'', error)\
    return {\
      redirect: {\
        destination: '\''/'\''',\
        permanent: false,\
      },\
    }\
  }\
}' "$file"
    
    echo "✅ $file processado"
  else
    echo "❌ $file não encontrado"
  fi
done

echo "Script concluído!"
