import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const UserNotificationEventTypeValidator = z
  .object({})
  .extend(MessageTypeValidator.shape)
export type UserNotificationEventType = z.infer<
  typeof UserNotificationEventTypeValidator
>
