import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanOldCalendars() {
  try {
    console.log('🧹 Removendo calendários com URLs antigas do Supabase...')
    
    // Buscar todos os calendários com URLs do Supabase
    const oldCalendars = await prisma.calendar.findMany({
      where: {
        fileUrl: {
          contains: 'supabase.co'
        }
      }
    })
    
    console.log(`📋 Encontrados ${oldCalendars.length} calendários com URLs antigas:`)
    oldCalendars.forEach(calendar => {
      console.log(`  - ID: ${calendar.id}`)
      console.log(`    School: ${calendar.schoolId}`)
      console.log(`    URL: ${calendar.fileUrl}`)
      console.log(`    Created: ${calendar.createdAt}`)
      console.log('')
    })
    
    if (oldCalendars.length > 0) {
      // Remover calendários com URLs antigas
      const deleteResult = await prisma.calendar.deleteMany({
        where: {
          fileUrl: {
            contains: 'supabase.co'
          }
        }
      })
      
      console.log(`✅ Removidos ${deleteResult.count} calendários antigos`)
    } else {
      console.log('✅ Nenhum calendário antigo encontrado')
    }
    
    // Mostrar calendários restantes
    const remainingCalendars = await prisma.calendar.findMany()
    console.log(`📊 Calendários restantes: ${remainingCalendars.length}`)
    
    if (remainingCalendars.length > 0) {
      console.log('📋 Calendários atuais:')
      remainingCalendars.forEach(calendar => {
        console.log(`  - ID: ${calendar.id}`)
        console.log(`    School: ${calendar.schoolId}`)
        console.log(`    URL: ${calendar.fileUrl}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar calendários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanOldCalendars()
