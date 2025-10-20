import { UserType } from '@/types/UserType'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'

export interface WorkspaceType {
  workstation: SupportedStationType
  user: UserType
}
