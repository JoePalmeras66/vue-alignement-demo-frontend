import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const VerifyBarcodeResponseTypeValidator = MessageTypeValidator
export type VerifyBarcodeResponseType = z.infer<
  typeof VerifyBarcodeResponseTypeValidator
>
