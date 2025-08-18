'use server'
import { revalidatePath } from 'next/cache'
import { AxiosError } from 'axios'

import { api } from '@/lib/api'
import { errorMessages } from '@/utils/errors/errorMessages'

export async function createStudent(data: FormData) {
  try {
    const name = data.get('student_name')?.toString()
    const email = data.get('student_email')?.toString()
    const number = data.get('student_number')?.toString()
    const birthDate = data.get('student_birth_date')?.toString()
    // Data de inscrição no formato local de Portugal (DD-MM-YYYY)
    const now = new Date()
    const enrolledAt = now
      .toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replaceAll('/', '-')
    const schoolId = data.get('student_register')?.toString()
    const driverLicenseCategoryId = data.get('category')?.toString()

    await api.post(`/student`, {
      name,
      email,
      number: Number(number),
      birthDate: birthDate
        ? String(new Date(birthDate!).toISOString())
        : undefined,
      enrolledAt,
      driverLicenseCategoryId,
      schoolId,
    })

    revalidatePath('/panel/students/list')

    return { message: 'Success!' }
  } catch (error) {
    console.log('🚀 ~ createStudent ~ error:', error)
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        if (
          error.response?.data.message ===
          errorMessages.numberHasAlreadyBeenUsed
        ) {
          return {
            message:
              'Esse número já está sendo utilizado, por favor coloque outro',
          }
        }
      }
    }
    return {
      message:
        'Ocorreu um erro no servidor! Por favor tente novamente mais tarde',
    }
  }
}
