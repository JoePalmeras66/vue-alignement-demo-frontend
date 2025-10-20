import { z } from 'zod'
import { BarcodeDataTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const ItemScannedEventTypeValidator = z.object({
  barcodes: z.array(BarcodeDataTypeValidator),
})
export type ItemScannedEventType = z.infer<typeof ItemScannedEventTypeValidator>
