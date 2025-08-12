# Install dependencies and build in server directory
cd server
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
