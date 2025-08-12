import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator'

export class CreateCalendarBody {
  @IsNotEmpty()
  @IsUUID()
  schoolId: string

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  fileUrl: string
}
