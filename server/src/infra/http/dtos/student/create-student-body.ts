
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

export class CreateStudentBody {
  @IsNotEmpty()
  name: string


  email?: string

  @IsNotEmpty()
  @IsUUID()
  schoolId: string

  enrolledAt?: string

  imtId?: string

  @IsNotEmpty()
  @IsNumber()
  number: number


  phone?: string

  birthDate?: string

  @IsNotEmpty()
  @IsUUID()
  driverLicenseCategoryId: string
}
