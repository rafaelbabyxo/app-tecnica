import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'

@Controller('upload')
export class UploadController {
  @Post('calendar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/calendars',
        filename: (req, file, callback) => {
          const fileExtName = extname(file.originalname)
          const fileName = `${uuid()}${fileExtName}`
          callback(null, fileName)
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Apenas arquivos PDF são permitidos'),
            false,
          )
        }
        callback(null, true)
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadCalendar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório')
    }

    // Retorna a URL do arquivo que pode ser acessada publicamente
    const fileUrl = `${process.env.API_URL || 'http://localhost:3333'}/uploads/calendars/${file.filename}`

    console.log('Upload realizado com sucesso:', {
      filename: file.filename,
      fileUrl,
      originalname: file.originalname,
    })

    return {
      message: 'Arquivo enviado com sucesso',
      fileUrl,
      filename: file.filename,
    }
  }
}
