import { LoadCarrierAction } from '@/types/LoadCarrierAction'

// A LoadCarrierEvent needs at least a 'loadCarrierAction' property
// and can have multiple string - value pairs
export type LoadCarrierEvent = Record<'loadCarrierAction', LoadCarrierAction> &
  Record<string, unknown>
