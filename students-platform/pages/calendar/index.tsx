import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { server } from '@/lib/server'
import { errorMessages } from '@/utils/errors/errorMessages'
import { useAuth } from '@/hooks/useAuth'

import { useToast } from "@/components/ui/use-toast"

interface Calendar {
  id: string
  schoolId: string
  fileUrl: string
}

type AxiosData = {
  calendar: Calendar
}

interface CalendarProps {}

export default function Calendar() {
  const router = useRouter()
  const { student } = useAuth()
  const { toast } = useToast()

  // Client-side authentication check
  useEffect(() => {
    if (!student) {
      router.push('/')
    }
  }, [student, router])

  const { data } = useQuery<any>(['calendar'], async () => {
    try {
      if (!student?.schoolId) return {}
      
      const { data } = await server.get<AxiosData>(`/calendar/school/${student.schoolId}`)

      return data?.calendar ? data.calendar : {}
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("🚀 ~ file: index.page.tsx:36 ~ const{data,isLoading}=useQuery ~ error:", error)
        toast({
          title: "Ops! Erro no servidor",
          description: "Tente novamente mais tarde",
          variant: 'destructive'
        })
      }
    }
  }, { enabled: !!student?.schoolId })

  if (!student) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex flex-col gap-4 items-start mt-6">
      <Head>
        <title>Alunos - Grupo Técnica</title>
      </Head>

      <div>
        <h1 className="text-xl font-semibold">Bem-vindo(a), {student?.name}</h1>
        <span className="mb-12 font-regular text-sm">Aluno(a) N° {student?.number}</span>
      </div>

      <div className='flex flex-col items-start'>
        {data?.fileUrl ? (
          <>
            <span className='mb-5'>Realizar download do calendário das aulas deste mês</span>

            <a
              href={data?.fileUrl}
              target="_blank"
              className="flex h-10 items-center justify-center gap-2 rounded bg-primary-500 px-4 text-white disabled:cursor-not-allowed"
            >
              Ver calendário das aulas
            </a>
          </>
        ) : (
          <span>Nenhum calendário de aulas encontrado</span>
        )}
      </div>
    </div>
  )
}
