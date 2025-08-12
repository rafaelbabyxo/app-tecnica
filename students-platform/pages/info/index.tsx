import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Spinner, WarningCircle, XCircle } from '@phosphor-icons/react'
import { AxiosError } from 'axios'
import { format } from 'date-fns-tz'
import { pt } from 'date-fns/locale'

import { server } from '@/lib/server'
import { errorMessages } from '@/utils/errors/errorMessages'
import { useAuth } from '@/hooks/useAuth'

import { useToast } from "@/components/ui/use-toast"

interface Test {
  id: string;
  category: "THEORETICAL" | "PRACTICAL";
  status: "APPROVED" | "DISAPPROVED" | "MARKED";
  studentId: string;
  testDate: string;
  testHour: string;
  createdAt: string;
}

interface Information {
  id: string
  name: string
  description?: string
  date: string
}

interface School {
  id: string
  name: string
  createdAt: string;
}

interface StudentInfo {
  test: Test[]
  school: School
  info?: Information[]
}

interface InfoProps {
}

export default function Info() {
  const router = useRouter()
  const { student } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: studentInfo, isLoading } = useQuery<StudentInfo>(['information'], async () => {
    try {
      const [
        { data: testData },
        { data: schoolData },
        { data: infoData }
      ] = await Promise.all([
        server.get(`/test/student/${student?.id}`),
        server.get(`/school/${student?.schoolId}`),
        server.get(`/information/school/${student?.schoolId}`)
      ])

      const studentInfo = {
        ...testData,
        ...schoolData,
        info: infoData.information
      }

      return studentInfo
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data.message === errorMessages.schoolNotFound) {
          toast({
            title: "Escola não encontrada",
            description: "Por favor entre em contado com o administrador",
            variant: 'destructive'
          })
        } else {
          toast({
            title: "Ops! Erro no servidor",
            description: "Tente novamente mais tarde",
            variant: 'destructive'
          })
        }
      }
    }
  }, {
    enabled: !!student && mounted
  })

  // Client-side authentication check
  useEffect(() => {
    if (mounted && !student) {
      router.push('/')
    }
  }, [student, router, mounted])

  // Show loading while checking authentication or mounting
  if (!mounted || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    )
  }

  const codeTests = studentInfo?.test?.filter(test => test.category === 'THEORETICAL')
  const drivingTests = studentInfo?.test?.filter(test => test.category === 'PRACTICAL')

  return (
    <div className="flex flex-col gap-4 items-start mt-6">
      <Head>
        <title>Alunos - Grupo Técnica</title>
      </Head>

        <div>
          <h1 className="text-xl font-semibold">Bem-vindo(a), {student?.name}</h1>
          <span className="mb-12 font-regular text-sm">Aluno(a) N° {student?.number}</span>
        </div>

        <div className="w-full">
          <h2 className="mb-5 text-xl font-semibold">Informações</h2>

          <div className="flex flex-col items-start">
          <div className="flex items-center">
            <CheckCircle size={24} color="#00A300" weight="fill" />
            <span className="text-sm">: Aprovado</span>
          </div>

          <div className="flex items-center">
            <XCircle size={24} color="#CC0000" weight="fill" />
            <span className="text-sm">: Reprovado</span>
          </div>

          <div className="flex items-center">
            <WarningCircle size={24} color="#FDDA0D" weight="fill" />
            <span className="text-sm">: Teste marcado</span>
          </div>
        </div>

        <div className='mt-5'>
          <span className="text-base font-bold">Exame de Código</span>

          <div className="mb-2 mt-1 h-[1px] w-full bg-[#EBEBEB]" />

          {isLoading ? (
            <Spinner size={20} className='animate-spin'/>
          ) : (
            !codeTests ?
            (
              <p className="font-regular text-sm">
                Informação não encontrada...
              </p>
            ) : codeTests.map(test => (
              <div key={test.id} className='flex items-center gap-x-3'>
                <time
                  title={format(new Date(test.testDate), 'PPP', { locale: pt })}
                  datatype={format(new Date(test.testDate), 'yyyy-MM-dd')}
                >
                  {format(new Date(test.testDate), 'dd/MM/yyyy')} {test.testHour}
                </time>

                {test.status === 'MARKED' ? (
                  <WarningCircle size={24} color="#FDDA0D" weight="fill" />
                ) : test.status === 'DISAPPROVED' ? (
                  <XCircle size={24} color="#CC0000" weight="fill" />
                ) : (
                  <CheckCircle size={24} color="#00A300" weight="fill" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <p className="text-base font-bold">Exame de Condução</p>

          <div className="mb-2 mt-1 h-[1px] w-full bg-[#EBEBEB]" />

          {isLoading ? (
            <Spinner size={20} className='animate-spin'/>
          ) : (
            !drivingTests ?
            (
              <p className="font-regular text-sm">
                Informação não encontrada...
              </p>
            ) : drivingTests.map(test => (
              <div key={test.id} className='flex items-center gap-x-3'>
                <time
                  title={format(new Date(test.testDate), 'PPP', { locale: pt })}
                  datatype={format(new Date(test.testDate), 'yyyy-MM-dd')}
                >
                  {format(new Date(test.testDate), 'dd/MM/yyyy')} {test.testHour}
                </time>

                {test.status === 'MARKED' ? (
                  <WarningCircle size={24} color="#FDDA0D" weight="fill" />
                ) : test.status === 'DISAPPROVED' ? (
                  <XCircle size={24} color="#CC0000" weight="fill" />
                ) : (
                  <CheckCircle size={24} color="#00A300" weight="fill" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <p className="text-base font-bold">Outras informações</p>

          <div className="mb-2 mt-1 h-[1px] w-full bg-[#EBEBEB]" />

          {isLoading ? (
            <Spinner size={20} className='animate-spin'/>
          ) : (
            <div className='flex flex-col items-start'>
              {studentInfo?.info?.map(info => (
                <div key={info.id} className='flex items-start flex-col mb-3'>
                  <strong className='font-medium'>{info.name}</strong>
                  <p className='text-sm my-1 leading-relaxed'>{info.description}</p>
                  <time
                    title={format(new Date(info.date), 'PPP', { locale: pt })}
                    datatype={format(new Date(info.date), 'yyyy-MM-dd')}
                  >
                    {format(new Date(info.date), 'dd/MM/yyyy')}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
