import { beforeEach, describe, expect, it } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import {
  getCycleCountTask,
  getItem1,
  getItem2,
  getMultiItemCycleCountTask,
  getPickingTask,
  getSourceLoadCarrier,
  getStock,
} from '@/helpers/testDataProvider'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'

setActivePinia(createPinia())

const taskStore = useTaskStore()
const barcodeStore = useBarcodeStore()
const loadCarrierStore = useLoadCarrierStore()

beforeEach(() => {
  taskStore.$reset()
})

describe('Test useTaskStore', () => {
  const task = getPickingTask(69)

  it('should set and reset task', () => {
    expect(taskStore.hasTask).toBeFalsy()
    taskStore.setTask(task)
    expect(taskStore.hasTask).toBeTruthy()
    expect(taskStore.task).toBeTruthy()
    expect(taskStore.task?.uuidString).not.toBe('')
    taskStore.resetTask()
    expect(taskStore.hasTask).toBeFalsy()
  })

  it('should increase and reset cycleCountQuantity', () => {
    taskStore.increaseCycleCountQuantity()
    expect(taskStore.getCycleCountQuantity()).toBe(1)
    taskStore.increaseCycleCountQuantity()
    expect(taskStore.getCycleCountQuantity()).toBe(2)
    taskStore.resetCycleCountQuantities()
    expect(taskStore.getCycleCountQuantity()).toBe(0)
    taskStore.task = getMultiItemCycleCountTask('S2T')
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.sourceLoadCarrier.compartments[0].items[0].item.gtins = [
      '123456789',
    ]
    barcodeStore.addBarcodes([
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '123456789',
      },
    ])
    taskStore.increaseCycleCountQuantity(getItem1().id)
    expect(taskStore.getCycleCountQuantity()).toBe(1)
  })

  it('should test hasCycleCountedQuantities', async () => {
    taskStore.cycleCountedQuantities = {}
    expect(taskStore.hasCycleCountedQuantities()).toBeFalsy()
    taskStore.cycleCountedQuantities = {
      '1234': 0,
    }
    expect(taskStore.hasCycleCountedQuantities()).toBeFalsy()
    taskStore.cycleCountedQuantities = {
      '1234': 12,
      '5678': 3,
    }
    expect(taskStore.hasCycleCountedQuantities()).toBeTruthy()
    taskStore.cycleCountedQuantities = {
      '1234': 12,
      '5678': 0,
    }
    expect(taskStore.hasCycleCountedQuantities()).toBeTruthy()
    taskStore.cycleCountedQuantities = {
      default: 12,
    }
    expect(taskStore.hasCycleCountedQuantities()).toBeTruthy()
  })

  it('should test addCountedCycleCountCompartment with cycleCountTask', () => {
    const cycleCountTask = getCycleCountTask('S2T')
    const sourceStock = getStock()
    taskStore.addCountedCycleCountCompartment(cycleCountTask, sourceStock)
    expect(taskStore.cycleCountCountedCompartments).toEqual({
      '1': ['800002'],
    } as CountedCompartmentsType)

    sourceStock.item = getItem2()
    taskStore.addCountedCycleCountCompartment(cycleCountTask, sourceStock)
    expect(taskStore.cycleCountCountedCompartments).toEqual({
      '1': ['800002', '800003'],
    } as CountedCompartmentsType)
  })
})
