import { usePathname } from 'next/navigation'
import { format } from 'date-fns-tz'
import { Copy } from 'lucide-react'

import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditStudentModal } from '../EditStudentModal'
import { DeleteStudentModal } from '../DeleteStudentModal'
import { useToast } from '../ui/use-toast'

import { Student } from '@/utils/interfaces/student'
import { CompletedLessonsModal } from './CompletedLessonsModal'

interface StudentsTableProps {
  students: Student[]
  categoryCard: {
    value: string
    label: string
    schoolId: string
  }[]
  schools: {
    value: string
    label: string
  }[]
}

export function StudentsTable({
  students,
  schools,
  categoryCard,
}: StudentsTableProps) {
  const pathname = usePathname()
  const hasEditStudentModal = pathname === '/panel/students/list'

  const { toast } = useToast()

  function handleCopyStudentId(id: string) {
    navigator.clipboard.writeText(id)

    toast({
      title: 'ID copiado com sucesso!',
      description: 'ID copiado para a área de transferência com sucesso',
    })
  }

  return (
    <div className="relative overflow-x-auto">
      <TableComponent>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data inscrição</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Aulas Completas</TableHead>
            {hasEditStudentModal && <TableHead>Editar</TableHead>}
            <TableHead>Apagar</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => {
            const completedLessons = student.scheduledClass?.filter(
              (scheduledClass) =>
                scheduledClass.status === 'COMPLETED' ||
                scheduledClass.status === 'CONFIRMED',
            )

            return (
              <TableRow key={student.id}>
                <TableCell
                  onClick={() => handleCopyStudentId(student.imtId ?? '')}
                >
                  <Copy
                    size={20}
                    className="hover:cursor-pointer hover:text-green-600"
                  />
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.number}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  {(() => {
                    if (
                      !student.enrolledAt ||
                      student.enrolledAt === 'Não informado'
                    )
                      return 'Não informado'
                    // Se já está no formato dd/MM/yyyy, retorna direto
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(student.enrolledAt))
                      return student.enrolledAt
                    // Se vier em outro formato, tenta converter
                    const date = new Date(student.enrolledAt)
                    if (!isNaN(date.getTime())) {
                      return format(date, 'dd/MM/yyyy')
                    }
                    return student.enrolledAt
                  })()}
                </TableCell>
                <TableCell>{student.school.name}</TableCell>
                <TableCell align="center">
                  <CompletedLessonsModal
                    student={student}
                    completedLessons={completedLessons}
                  />
                </TableCell>
                {hasEditStudentModal && (
                  <TableCell>
                    <EditStudentModal
                      student={student}
                      schools={schools}
                      categoryCard={categoryCard}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <DeleteStudentModal id={student?.id} title={student?.name} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </TableComponent>
    </div>
  )
}
