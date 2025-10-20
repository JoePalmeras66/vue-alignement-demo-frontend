import { z } from 'zod'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const GetLoadCarrierHeadingResponseTypeValidator = z.object({
  headings: z.array(
    z.object({
      pcotsLocation: z.nativeEnum(PcotsLocationEnum),
      text: z.string(),
    })
  ),
})
export type GetLoadCarrierHeadingResponseType = z.infer<
  typeof GetLoadCarrierHeadingResponseTypeValidator
>
