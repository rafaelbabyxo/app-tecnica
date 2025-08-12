import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { server } from '@/lib/server'
import { useAuth } from '@/hooks/useAuth'

interface TestNotificationsProps {
}

export default function TestNotifications() {
  const [title, setTitle] = useState('Teste de Notificação')
  const [message, setMessage] = useState('Esta é uma notificação de teste!')
  const router = useRouter()
  const { student } = useAuth()

  // Client-side authentication check
  useEffect(() => {
    if (!student) {
      router.push('/')
    }
  }, [student, router])

  // Show loading while checking authentication
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    )
  }

  // Mutation para enviar notificação para o estudante
  const { mutateAsync: sendNotification, isLoading } = useMutation(
    async ({ title, body }: { title: string, body: string }) => {
      try {
        const response = await server.post('/test/notification', {
          studentId: student.id,
          title,
          body
        })
        return response.data
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
        throw error
      }
    },
    {
      onSuccess() {
        alert('Notificação enviada com sucesso!')
      },
      onError() {
        alert('Erro ao enviar notificação')
      },
    },
  )

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Por favor, preencha o título e a mensagem')
      return
    }

    await sendNotification({ title, body: message })
  }

  // Função para testar permissões de notificação
  const testNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações')
      return
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // Criar uma notificação local de teste
      new Notification('Teste Local', {
        body: 'Esta é uma notificação local de teste',
        icon: '/logo.svg'
      })
    } else {
      alert('Permissão de notificação negada')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Teste de Notificações - Grupo Técnica</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1">Teste de Notificações</h1>
          <span className="font-regular text-sm">Aluno(a) N° {student?.number}</span>
        </div>

        {/* Seção de Teste de Permissões */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              🔔
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Permissões de Notificação</h2>
              <p className="text-gray-600 text-sm">Teste as permissões do navegador</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Status das Permissões</h3>
              <p className="text-sm text-blue-700">
                Status atual: <span className="font-bold">
                  {typeof window !== 'undefined' && 'Notification' in window 
                    ? Notification.permission 
                    : 'Não suportado'
                  }
                </span>
              </p>
            </div>

            <button
              onClick={testNotificationPermission}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Testar Notificação Local
            </button>
          </div>
        </div>

        {/* Seção de Teste de Notificações Push */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              📱
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Notificações Push</h2>
              <p className="text-gray-600 text-sm">Envie uma notificação via Firebase</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Notificação
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o título da notificação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a mensagem da notificação"
              />
            </div>

            <button
              onClick={handleSendNotification}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Enviando...' : 'Enviar Notificação Push'}
            </button>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-500 text-xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Informações Técnicas</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• As notificações push funcionam via Firebase Cloud Messaging</li>
                <li>• Você precisa ter permitido notificações no navegador</li>
                <li>• O token Firebase é salvo automaticamente quando você faz login</li>
                <li>• As notificações aparecem mesmo com a aba fechada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
