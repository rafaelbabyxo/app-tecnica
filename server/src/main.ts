import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useGlobalPipes(new ValidationPipe())

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://app-tecnica-rodrigo001.vercel.app',
      'https://app-tecnica-kfjrsf1rm-rodrigo001.vercel.app',
      'https://students-platform-mu.vercel.app',
      'https://students-platform-53j6s246g-filipesilvestre0-gmailcom.vercel.app',
      'https://backoffice-app-tecnica.vercel.app',
      'https://backoffice-app-tecnica-rgqa8nfnq-filipesilvestre0-gmailcom.vercel.app',
      // Adicione aqui o domínio da sua API quando souber
      // 'https://sua-api.railway.app',
      // 'https://sua-api.onrender.com',
      // 'https://sua-api.herokuapp.com',
    ],
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'PATCH'],
  })

  await app.listen(process.env.PORT || 3333)
}
bootstrap()
