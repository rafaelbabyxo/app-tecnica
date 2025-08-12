import * as path from 'node:path'
import { Injectable } from '@nestjs/common'
import * as firebase from 'firebase-admin'

import { PrismaService } from 'src/infra/database/prisma/prisma.service'

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', 'firebase-adminsdk.json'),
  ),
  projectId: process.env.FIREBASE_PROJECT_ID,
})

interface SendNotificationToSchoolData {
  schoolId: string
  title: string
  body: string
}

interface SendNotificationToStudentData {
  studentId: string
  title: string
  body: string
}

@Injectable()
export class PushNotificationService {
  constructor(private prisma: PrismaService) {}

  private async getTokensForSchool(schoolId: string): Promise<string[]> {
    const students = await this.prisma.student.findMany({
      where: { schoolId },
    })

    const firebaseTokens = students.flatMap((student) => student.firebaseTokens)

    return firebaseTokens
  }

  async sendNotificationToSchool({
    schoolId,
    title,
    body,
  }: SendNotificationToSchoolData) {
    try {
      const tokens = await this.getTokensForSchool(schoolId)

      if (tokens.length === 0) {
        console.log(`Nenhum token encontrado para a escola ${schoolId}`)
        return
      }

      console.log(`Enviando notificação para ${tokens.length} estudantes da escola ${schoolId}`)

      const promises = tokens.map(async (token) => {
        try {
          if (!token || token.trim() === '') {
            console.log('Token vazio ou inválido, pulando...')
            return
          }

          await firebase.messaging().send({ 
            notification: { title, body }, 
            token 
          })
          console.log(`Notificação enviada com sucesso para token: ${token.substring(0, 20)}...`)
        } catch (error) {
          console.error(`Erro ao enviar notificação para token ${token.substring(0, 20)}...:`, error.message)
          
          // Se o token for inválido, remove ele do banco de dados
          if (error.code === 'messaging/registration-token-not-registered' || 
              error.code === 'messaging/invalid-registration-token') {
            console.log(`Removendo token inválido: ${token.substring(0, 20)}...`)
            await this.removeInvalidToken(token)
          }
        }
      })

      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Erro geral ao enviar notificações para escola:', error)
    }
  }

  async sendNotificationToStudent({
    studentId,
    title,
    body,
  }: SendNotificationToStudentData) {
    try {
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { firebaseTokens: true },
      })

      if (!student || !student.firebaseTokens || student.firebaseTokens.length === 0) {
        console.log(`Nenhum token encontrado para o estudante ${studentId}`)
        return
      }

      console.log(`Enviando notificação para estudante ${studentId} com ${student.firebaseTokens.length} token(s)`)

      const promises = student.firebaseTokens.map(async (token) => {
        try {
          if (!token || token.trim() === '') {
            console.log('Token vazio ou inválido, pulando...')
            return
          }

          await firebase.messaging().send({ 
            notification: { title, body }, 
            token 
          })
          console.log(`Notificação enviada com sucesso para token: ${token.substring(0, 20)}...`)
        } catch (error) {
          console.error(`Erro ao enviar notificação para token ${token.substring(0, 20)}...:`, error.message)
          
          // Se o token for inválido, remove ele do banco de dados
          if (error.code === 'messaging/registration-token-not-registered' || 
              error.code === 'messaging/invalid-registration-token') {
            console.log(`Removendo token inválido: ${token.substring(0, 20)}...`)
            await this.removeInvalidToken(token)
          }
        }
      })

      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Erro geral ao enviar notificação para estudante:', error)
    }
  }

  private async removeInvalidToken(token: string): Promise<void> {
    try {
      // Busca todos os estudantes que têm esse token
      const students = await this.prisma.student.findMany({
        where: {
          firebaseTokens: {
            has: token
          }
        }
      })

      // Remove o token de cada estudante
      for (const student of students) {
        const updatedTokens = student.firebaseTokens.filter(t => t !== token)
        
        await this.prisma.student.update({
          where: { id: student.id },
          data: { firebaseTokens: updatedTokens }
        })
      }

      console.log(`Token ${token.substring(0, 20)}... removido de ${students.length} estudante(s)`)
    } catch (error) {
      console.error(`Erro ao remover token inválido: ${error.message}`)
    }
  }
}
