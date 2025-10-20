import { z } from 'zod'
import { RobotOperatingStateEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { RobotOrderStatusTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetRobotStateResponseTypeValidator = z.object({
  operatingState: z.nativeEnum(RobotOperatingStateEnum),
  requestedOperatingState: z.nativeEnum(RobotOperatingStateEnum).optional(),
  errors: z.array(z.string()),
  orderStatus: RobotOrderStatusTypeValidator.optional(),
  robotInHome: z.boolean().optional(),
})
export type GetRobotStateResponseType = z.infer<
  typeof GetRobotStateResponseTypeValidator
>
