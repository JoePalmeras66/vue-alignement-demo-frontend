import { z } from 'zod'
import { GetRobotStateResponseTypeValidator } from '@/types/Api/pcots/Get/RobotState/GetRobotStateResponseType'

export const RobotStateChangedEventTypeValidator =
  GetRobotStateResponseTypeValidator
export type RobotStateChangedEventType = z.infer<
  typeof RobotStateChangedEventTypeValidator
>
