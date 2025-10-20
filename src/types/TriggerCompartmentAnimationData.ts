import { CompartmentAnimationName } from '@/types/CompartmentAnimationName'

export interface TriggerCompartmentAnimationData {
  compartmentId: string
  transitionName: CompartmentAnimationName
  transitionDelayMs: number
}
