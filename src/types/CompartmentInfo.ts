import { CompartmentState } from '@/types/CompartmentState'

export interface CompartmentInfo {
  id: string | undefined
  state: CompartmentState
  stockIndex?: number
}
