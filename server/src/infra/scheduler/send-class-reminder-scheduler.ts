import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

import { PrismaService } from '../database/prisma/prisma.service'
import { PushNotificationService } from '../../push-notification/push-notification.service'

@Injectable()
export class SendClassReminderScheduler {
  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) {}

  // Executa todos os dias às 08:00 da manhã para lembrar das aulas do dia
  @Cron('0 8 * * *', {
    name: 'class-reminder',
    timeZone: 'Europe/Lisbon', // Timezone de Portugal
  })
  async sendDailyReminders() {
    console.log('🔔 Executando scheduler de lembretes de aulas...')

    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

      // Buscar todas as aulas confirmadas ou pendentes para hoje
      const todayClasses = await this.prisma.scheduledClass.findMany({
        where: {
          schedulingDate: today,
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
        include: {
          student: true,
          class: true,
        },
      })

      console.log(
        `📅 Encontradas ${todayClasses.length} aulas para hoje (${today})`,
      )

      if (todayClasses.length === 0) {
        console.log('✅ Nenhuma aula para relembrar hoje')
        return
      }

      // Enviar notificação para cada aula
      for (const scheduledClass of todayClasses) {
        try {
          const classDate = new Date(scheduledClass.schedulingDate)
          const formattedDate = format(classDate, 'dd/MM/yyyy', { locale: pt })
          
          await this.pushNotificationService.sendNotificationToStudent({
            studentId: scheduledClass.studentId,
            title: '🚗 Lembrete: Aula Hoje!',
            body: `Tem uma aula de condução marcada para hoje (${formattedDate}) às ${
              scheduledClass.schedulingHour
            }. ${
              scheduledClass.status === 'PENDING'
                ? 'Não se esqueça de confirmar a sua presença!'
                : 'Não se esqueça de comparecer!'
            }`,
          })

          console.log(
            `✅ Lembrete enviado para ${scheduledClass.student.name} - ${scheduledClass.schedulingHour}`,
          )
        } catch (error) {
          console.error(
            `❌ Erro ao enviar lembrete para aula ${scheduledClass.id}:`,
            error,
          )
        }
      }

      console.log(
        `🎉 Processo de lembretes concluído: ${todayClasses.length} notificações enviadas`,
      )
    } catch (error) {
      console.error('❌ Erro no scheduler de lembretes:', error)
    }
  }

  // Método auxiliar para executar manualmente (para testes)
  async executeManualy() {
    console.log('🧪 Executando lembretes manualmente para teste...')
    await this.sendDailyReminders()
  }
}
