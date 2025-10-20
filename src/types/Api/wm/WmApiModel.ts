import { z } from 'zod'

export const SupportedStationTypeValidator = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  isExtendedApiSupported: z.boolean().optional(),
})
export type SupportedStationType = z.infer<typeof SupportedStationTypeValidator>

export const SupportedStationsTypeValidator = z.object({
  stations: z.array(SupportedStationTypeValidator),
})
export type SupportedStationsType = z.infer<
  typeof SupportedStationsTypeValidator
>
