import { z } from 'zod'

export const GetVersionResponseTypeValidator = z.object({
  version: z.string(),
  supported: z.boolean(),
})
export type GetVersionResponseType = z.infer<
  typeof GetVersionResponseTypeValidator
>

export const GetVersionsResponseTypeValidator = z.object({
  data: z.array(GetVersionResponseTypeValidator),
})

export type GetVersionsResponseType = z.infer<
  typeof GetVersionsResponseTypeValidator
>
