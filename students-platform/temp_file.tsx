import { GetServerSideProps } from 'next';
import Head from 'next/head'
import { parseCookies } from 'nookies';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from "axios";
import { useState } from 'react'
import { format, isSameDay, isBefore, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, startOfWeek, endOfWeek, startOfDay, isSameMonth } from 'date-fns'

import { PracticalClassesList } from "@/components/PracticalClassesList";

import { server } from '@/lib/server'
import type { Student } from '@/contexts/AuthContext';

export interface ScheduledClass {
  id: string
  schedulingDate?: string
  schedulingHour?: string
  status: 'PENDING' | 'UNCHECKED' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'
  studentId: string
  classId: string
  class: PracticalClassesData
}

export interface PracticalClassesData {
  id: string
  name: string
  code: number
  description: string
  category: "THEORETICAL" | "PRACTICAL"
  createdAt: string
  scheduledClass?: ScheduledClass
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

interface PracticalClassesProps {
  student: Student
}

export default function PracticalClasses({ student }: PracticalClassesProps) {
  const queryClient = useQueryClient()
  
  // Estados para o calendário interativo
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Gerar dias do calendário
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  })

  const { data: practicalClassesData, isLoading } = useQuery<ScheduledClass[]>(['practical-classes'], async () => {
    try {
      const { data } = await server.get(`/scheduled-class/student/${student?.id}/category`, { params: { category: "PRACTICAL" } })

      return data.scheduledClasses
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("🚀 ~ file: AuthContext.tsx:52 ~ const{data:practicalClassesData}=useQuery ~ error:", error.response?.data.message[0])
        window.alert(error.response?.data.message[0])
      }
    }
  })

  // Função para gerar horários disponíveis
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    
    for (let hour = 8; hour <= 18; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      const dateTimeString = format(date, 'yyyy-MM-dd')
      
      // Verificar se já existe uma aula neste horário
      const existingClass = practicalClassesData?.find(cls => 
        cls.schedulingDate === dateTimeString && cls.schedulingHour === timeString
      )
      
      slots.push({
        time: timeString,
        available: !existingClass,
        reason: existingClass ? 'Horário já ocupado' : undefined
      })
    }
    
    return slots
  }

  // Mutation para agendar aula
  const { mutateAsync: scheduleClass, isLoading: isScheduling } = useMutation(
    async ({ date, time }: { date: Date, time: string }) => {
      const className = `Aula Prática - ${format(date, 'dd/MM/yyyy')}`
      
      try {
        await server.post('/scheduled-class/student-booking', {
          schedulingDate: format(date, 'yyyy-MM-dd'),
          schedulingHour: time,
          className,
          studentId: student.id,
        })
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data?.message || 'Erro ao agendar aula')
        }
        throw error
      }
    },
    {
      onSuccess() {
        window.alert(`Aula confirmada para ${format(selectedDate!, 'dd/MM/yyyy')} às ${selectedTime}`)
        queryClient.invalidateQueries({ queryKey: ['practical-classes'] })
        setSelectedDate(null)
        setSelectedTime('')
      },
      onError(error: Error) {
        window.alert(`Erro ao agendar: ${error.message}`)
      },
    },
  )

  // Navegação do calendário
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Dias para preencher o calendário
  const firstDayOfWeek = getDay(monthStart)
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => 
    addDays(monthStart, i - firstDayOfWeek)
  )
  
  const allDays = [...paddingDays, ...monthDays]

  const handleDayClick = (date: Date) => {
    if (isPast(date) || isWeekend(date)) return
    if (date.getMonth() !== currentMonth.getMonth()) return
    
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = async (time: string) => {
    if (!selectedDate) return
    
    setSelectedTime(time)
    await scheduleClass({ date: selectedDate, time })
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate)
  const isPast = (date: Date) => isBefore(date, new Date())
  const hasClass = (date: Date) => practicalClassesData?.some(cls => 
    cls.schedulingDate === format(date, 'yyyy-MM-dd')
  )

  const completedPracticalClasses = practicalClassesData?.filter(lesson => lesson?.status === 'COMPLETED').length ?? 0
  const canceledPracticalClasses = practicalClassesData?.filter(lesson => lesson?.status === 'CANCELED').length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Aulas Práticas - Grupo Técnica</title>
      </Head>

      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              🚗
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aulas Práticas</h1>
              <p className="text-blue-100">Gerir e agendar as suas aulas de condução</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <span>👋 Bem-vindo(a), {student?.name}</span>
            <span>•</span>
            <span>📋 Aluno(a) N° {student?.number}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Aviso importante com melhor destaque */}
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="text-amber-500 text-xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Importante</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                As faltas às aulas práticas sem aviso prévio de 24 horas são consideradas lições dadas e obrigam à compra de uma aula de repetição
              </p>
            </div>
          </div>
        </div>

      {/* Calendário Interativo */}
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                📅 Agendar Aula Prática
              </h2>
              <p className="text-gray-600 text-sm">
                {format(currentMonth, 'MMMM yyyy')}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Mês anterior"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Próximo mês"
              >
                →
              </button>
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Aula agendada</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Indisponível</span>
            </div>
          </div>
          
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid do Calendário */}
          <div className="space-y-3">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="h-10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                const isPast = isBefore(day, startOfDay(new Date()))
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={isPast || isWeekend}
                    className={`
                      h-12 w-full rounded-lg flex items-center justify-center text-sm font-medium
                      transition-all duration-200 transform hover:scale-105
                      ${isSelected 
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' 
                        : isToday 
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                        : isCurrentMonth
                        ? isPast || isWeekend
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:shadow-md'
                        : 'text-gray-300 cursor-not-allowed'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>          {/* Seleção de horário */}
          {selectedDate && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    🕐 Horários Disponíveis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {format(selectedDate, "dd 'de' MMMM, yyyy")}
                  </p>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {generateTimeSlots(selectedDate).filter(slot => slot.available).length} horários livres
                </div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {generateTimeSlots(selectedDate).map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available || isScheduling}
                    className={`
                      p-3 text-sm rounded-lg font-medium transition-all duration-200
                      transform hover:scale-105 border
                      ${slot.available 
                        ? 'bg-white hover:bg-green-50 border-green-200 text-green-700 hover:border-green-400 hover:shadow-md cursor-pointer' 
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }
                      ${isScheduling ? 'opacity-50' : ''}
                    `}
                  >
                    {slot.time}
                    {!slot.available && (
                      <div className="text-xs text-gray-500 mt-1">Ocupado</div>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-4 px-4 py-2 text-gray-600 hover:bg-white hover:text-gray-800 rounded-lg transition-colors border border-gray-300"
              >
                ← Voltar ao calendário
              </button>
            </div>
          )}
        </div>
        
        {/* Estatísticas de aulas */}
        {practicalClassesData && practicalClassesData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                📊
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Estatísticas de Aulas</h3>
                <p className="text-gray-600 text-sm">Acompanhe o seu progresso</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">✅</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">{completedPracticalClasses}</div>
                <div className="text-sm font-medium text-green-700">Completas</div>
                <div className="text-xs text-green-600 mt-1">Aulas finalizadas com sucesso</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">❌</span>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">{canceledPracticalClasses}</div>
                <div className="text-sm font-medium text-red-700">Desmarcadas</div>
                <div className="text-xs text-red-600 mt-1">Aulas canceladas ou faltadas</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">⏳</span>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{practicalClassesData?.filter(lesson => lesson?.status === 'PENDING').length ?? 0}</div>
                <div className="text-sm font-medium text-orange-700">Pendentes</div>
                <div className="text-xs text-orange-600 mt-1">Aguardando confirmação</div>
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                <span className="text-sm text-gray-600">
                  {completedPracticalClasses} de {practicalClassesData.length} aulas
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedPracticalClasses / practicalClassesData.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {Math.round((completedPracticalClasses / practicalClassesData.length) * 100)}% das aulas concluídas
              </p>
            </div>
          </div>
        )}
        
        {/* Próximas Aulas Práticas */}
        {practicalClassesData && practicalClassesData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                📋
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Próximas Aulas Práticas</h3>
                <p className="text-gray-600 text-sm">Suas aulas agendadas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {practicalClassesData
                .filter(lesson => lesson?.status === 'CONFIRMED' || lesson?.status === 'PENDING')
                .sort((a, b) => new Date(a.schedulingDate || '').getTime() - new Date(b.schedulingDate || '').getTime())
                .slice(0, 5)
                .map(lesson => (
                  <div key={lesson.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          lesson.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{lesson.class.name}</h4>
                          <p className="text-sm text-gray-600">
                            📅 {lesson.schedulingDate ? format(new Date(lesson.schedulingDate), "dd 'de' MMMM, yyyy") : 'Data não definida'}
                            {lesson.schedulingHour && ` • 🕐 ${lesson.schedulingHour}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lesson.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {lesson.status === 'CONFIRMED' ? 'Confirmada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              }
              
              {practicalClassesData.filter(lesson => lesson?.status === 'CONFIRMED' || lesson?.status === 'PENDING').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    📅
                  </div>
                  <p className="font-medium">Nenhuma aula agendada</p>
                  <p className="text-sm">Use o calendário acima para agendar uma nova aula</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista completa de aulas práticas */}
        <PracticalClassesList practicalClassesData={practicalClassesData} isLoading={isLoading} />
      </div>
