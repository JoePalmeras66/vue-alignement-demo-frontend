import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetUserInfoResponseTypeValidator = z.object({
  success: z.boolean(),
  data: z.string(),
  message: MessageTypeValidator.optional().nullable(),
})
export type GetUserInfoResponseType = z.infer<
  typeof GetUserInfoResponseTypeValidator
>
