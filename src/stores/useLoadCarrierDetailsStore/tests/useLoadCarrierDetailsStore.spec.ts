import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import {
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'

setActivePinia(createPinia())

describe('Test useLoadCarrierDetailsStore', () => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
  const loadCarrierStore = useLoadCarrierStore()

  it('should set load carrier details', () => {
    loadCarrierDetailsStore.setLoadCarrierDetails(
      sourceLoadCarrier,
      PcotsLocationEnum.Source
    )
    expect(loadCarrierDetailsStore.loadCarrier).toStrictEqual(sourceLoadCarrier)
    expect(loadCarrierDetailsStore.pcotsLocation).toBe(PcotsLocationEnum.Source)
  })

  it('should swap pcots location', () => {
    loadCarrierStore.sourceLoadCarrier = sourceLoadCarrier
    loadCarrierStore.targetLoadCarrier = targetLoadCarrier
    loadCarrierDetailsStore.setLoadCarrierDetails(
      sourceLoadCarrier,
      PcotsLocationEnum.Source
    )
    expect(loadCarrierDetailsStore.loadCarrier).toStrictEqual(sourceLoadCarrier)
    expect(loadCarrierDetailsStore.pcotsLocation).toBe(PcotsLocationEnum.Source)
    loadCarrierDetailsStore.swapPcotsLocation()
    expect(loadCarrierDetailsStore.loadCarrier).toStrictEqual(targetLoadCarrier)
    expect(loadCarrierDetailsStore.pcotsLocation).toBe(PcotsLocationEnum.Target)
    loadCarrierDetailsStore.swapPcotsLocation()
    expect(loadCarrierDetailsStore.loadCarrier).toStrictEqual(sourceLoadCarrier)
    expect(loadCarrierDetailsStore.pcotsLocation).toBe(PcotsLocationEnum.Source)
  })
})
