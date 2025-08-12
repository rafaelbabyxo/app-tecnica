import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import Head from 'next/head'

import { server } from '@/lib/server'

import type { Student } from '@/contexts/AuthContext'
import { NavigationButton } from '@/components/buttons/NavigationButton'

interface MenuProps {
  student: Student
}

export default function Menu({ student }: MenuProps) {
  // Firebase messaging completely removed
  
  return (
    <main className="flex flex-col gap-4 items-center mt-6">
      <Head>
        <title>Alunos - Grupo Técnica</title>
      </Head>

      <div className='flex flex-col items-center justify-center'>
        <h1 className="text-xl font-semibold">Bem-vindo(a), {student?.name}</h1>
        <span className="mb-12 font-regular text-sm">Aluno(a) N° {student?.number}</span>
      </div>

      <div className='flex flex-col gap-y-7 -mt-8'>
        <NavigationButton href='/theoretical-classes' title='Aulas de Código' />
        <NavigationButton href='/practical-classes' title='Aulas Práticas' />
        <NavigationButton href='/calendar' title='Calendário de Aulas' />
        <NavigationButton href='/info' title='Informações' />
        <NavigationButton title='Sair' />
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { '@studentsPlatform:student': student } = parseCookies({ req: ctx.req })

  if (!student) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      student: JSON.parse(student)
    },
  }
}