import { z } from 'zod'
import { BarcodeDataTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const VerifyBarcodeRequestTypeValidator = z.object({
  taskId: z.string(),
  barcodes: z.array(BarcodeDataTypeValidator),
})
export type VerifyBarcodeRequestType = z.infer<
  typeof VerifyBarcodeRequestTypeValidator
>
