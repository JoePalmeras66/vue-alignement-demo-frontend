import { describe, expect, it } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import {
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

setActivePinia(createPinia())

describe('Test useLoadCarrierStore', () => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  const loadCarrierStore = useLoadCarrierStore()

  it('should set and reset source load carrier', () => {
    loadCarrierStore.setSourceLoadCarrier(sourceLoadCarrier)
    expect(loadCarrierStore.sourceLoadCarrier).toStrictEqual(sourceLoadCarrier)
    loadCarrierStore.resetSourceLoadCarrier()
    expect(loadCarrierStore.sourceLoadCarrier).toBe(undefined)
    loadCarrierStore.setLoadCarrier(PcotsLocationEnum.Source, sourceLoadCarrier)
    expect(loadCarrierStore.sourceLoadCarrier).toStrictEqual(sourceLoadCarrier)
    loadCarrierStore.setLoadCarrier(PcotsLocationEnum.Source, undefined)
    expect(loadCarrierStore.sourceLoadCarrier).toBe(undefined)
  })

  it('should set and reset target load carrier', () => {
    loadCarrierStore.setTargetLoadCarrier(targetLoadCarrier)
    expect(loadCarrierStore.targetLoadCarrier).toStrictEqual(targetLoadCarrier)
    loadCarrierStore.resetTargetLoadCarrier()
    expect(loadCarrierStore.targetLoadCarrier).toBe(undefined)
    loadCarrierStore.setLoadCarrier(PcotsLocationEnum.Target, targetLoadCarrier)
    expect(loadCarrierStore.targetLoadCarrier).toStrictEqual(targetLoadCarrier)
    loadCarrierStore.setLoadCarrier(PcotsLocationEnum.Target, undefined)
    expect(loadCarrierStore.targetLoadCarrier).toBe(undefined)
  })
})
