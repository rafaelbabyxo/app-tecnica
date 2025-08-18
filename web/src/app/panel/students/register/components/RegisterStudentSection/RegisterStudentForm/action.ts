'use server'
import { revalidatePath } from 'next/cache'
import { AxiosError } from 'axios'

import { api } from '@/lib/api'
import { errorMessages } from '@/utils/errors/errorMessages'

export async function createStudent(data: FormData) {
  try {
    const name = data.get('student_name')?.toString()
    const number = data.get('student_number')?.toString()
    const birthDate = data.get('student_birth_date')?.toString()
    const date = data.get('student_date')?.toString()
  const schoolId = data.get('student_register')?.toString()
    const driverLicenseCategoryId = data.get('category')?.toString()
    const imtId = data.get('imt_id')?.toString()

    await api.post(`/student`, {
      name,
      number: Number(number),
      birthDate: birthDate
        ? String(new Date(birthDate!).toISOString())
        : undefined,
      enrolledAt: date ? String(new Date(date!).toISOString()) : undefined,
  // schoolId, // não enviar schoolId
  driverLicenseCategoryId,
  schoolId,
  // imtId,
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
