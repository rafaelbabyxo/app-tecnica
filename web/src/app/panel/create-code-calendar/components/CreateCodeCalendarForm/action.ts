'use server'
import { cookies } from 'next/headers'
import { AxiosError } from 'axios'

import { api } from '@/lib/api'

import { errorMessages } from '@/utils/errors/errorMessages'
import { User } from '@/utils/interfaces/user'

export async function createCodeCalendar(data: FormData) {
  try {
    const user = cookies().get('user')?.value

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const formattedUser = JSON.parse(user) as User

    const pdfFile = data.get('file_input') as File
    const selectedSchoolId = data.get('select_school')?.toString()

    console.log('Dados recebidos:', {
      userFunction: formattedUser.function,
      selectedSchoolId,
      fileName: pdfFile?.name,
      fileSize: pdfFile?.size,
    })

    if (formattedUser.function === 'DIRECTOR' && !selectedSchoolId) {
      return { message: 'Por favor, selecione uma escola para enviar o PDF' }
    }

    // Criar FormData para o upload
    const uploadFormData = new FormData()
    uploadFormData.append('file', pdfFile)

    console.log('Fazendo upload do arquivo...')

    // Fazer upload do arquivo para o backend
    const uploadResponse = await api.post('/upload/calendar', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('Resposta do upload:', uploadResponse.data)

    if (!uploadResponse.data.fileUrl) {
      return {
        message:
          'Ocorreu um erro ao salvar o arquivo, por favor tente novamente mais tarde',
      }
    }

    console.log('Criando calendário no banco de dados...')

    // Criar o calendário com a URL do arquivo
    const calendarResponse = await api.post('/calendar', {
      schoolId:
        formattedUser.function === 'DIRECTOR'
          ? selectedSchoolId!
          : formattedUser.schoolId,
      fileUrl: uploadResponse.data.fileUrl,
    })

    console.log('Calendário criado com sucesso:', calendarResponse.data)

    return { message: 'Success!' }
  } catch (error) {
    console.error('Erro na criação do calendário:', error)

    if (error instanceof AxiosError) {
      console.error('Detalhes do erro axios:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })

      if (error.response?.data?.message) {
        if (
          error.response?.data.message[0] === errorMessages.schoolIdMustBeUUID
        ) {
          return {
            message:
              'Parece que a plataforma na sua escola está fora do ar! Por favor tente novamente mais tarde',
          }
        } else if (
          error.response?.data.message[0] ===
          errorMessages.schoolIdShouldNotBeEmpty
        ) {
          return { message: 'Por favor, informe a escola' }
        }
      }
    }
    return {
      message:
        'Ocorreu um erro no servidor! Por favor tente novamente mais tarde',
    }
  }
}
