import { randomUUID } from 'crypto'

import { Replace } from '../../helpers/Replace'

interface SchoolProps {
  name: string
  groupId?: string | null
  createdAt?: Date | null
}

export class School {
  private _id: string
  private props: SchoolProps

  constructor(props: Replace<SchoolProps, { createdAt?: Date }>, id?: string) {
    this._id = id ?? randomUUID()
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }
  }

  public get id() {
    return this._id
  }

  public set name(name: string) {
    this.props.name = name
  }

  public get name(): string {
    return this.props.name
  }

  public set groupId(groupId: string | null) {
    this.props.groupId = groupId
  }

  public get groupId(): string | null {
    return this.props.groupId
  }

  public get createdAt(): Date {
    return this.props.createdAt
  }
}
