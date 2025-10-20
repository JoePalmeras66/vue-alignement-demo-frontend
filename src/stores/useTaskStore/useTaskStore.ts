import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import {
  CycleCountTaskType,
  MultiItemCycleCountTaskType,
  StockType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

export const useTaskStore = defineStore('task', {
  state: () => ({
    task: undefined as TaskType | undefined,
    originalQuantity: undefined as number | undefined,
    cycleCountCountedCompartments: {} as CountedCompartmentsType,
    countedLoadCarrierId: '' as string,
    cycleCountedQuantities: {} as Record<string, number>,
  }),
  actions: {
    increaseCycleCountQuantity(itemId?: string) {
      if (itemId === undefined) {
        itemId = 'default'
      }
      if (this.cycleCountedQuantities[itemId] === undefined) {
        this.cycleCountedQuantities[itemId] = 1
      } else {
        this.cycleCountedQuantities[itemId] += 1
      }
    },
    setCycleCountQuantity(cycleCountQuantity: number, itemId = 'default') {
      this.cycleCountedQuantities[itemId] = cycleCountQuantity
    },
    hasCycleCountedQuantities(): boolean {
      const cycleCountQuantityKeys = Object.keys(this.cycleCountedQuantities)
      let hasCountedQuantity = false
      if (cycleCountQuantityKeys.length > 0) {
        cycleCountQuantityKeys.forEach((key) => {
          if (this.cycleCountedQuantities[key] !== 0) {
            hasCountedQuantity = true
          }
        })
      }
      return hasCountedQuantity
    },
    resetCycleCountQuantityByItemId(itemId: string | undefined) {
      if (itemId) {
        delete this.cycleCountedQuantities[itemId]
      }
    },
    resetCycleCountQuantities() {
      this.cycleCountedQuantities = {}
    },
    resetTask() {
      this.task = undefined
    },
    setTask(task: TaskType | undefined | null) {
      if (task === null || task === undefined) {
        this.resetTask()
      } else {
        task.uuidString = uuidv4()
        this.task = task
      }
    },
    // adds the itemId of the sourceStock to the cycleCountCountedCompartments
    addCountedCycleCountCompartment(
      cycleCountTask: CycleCountTaskType | MultiItemCycleCountTaskType,
      sourceStock: StockType | undefined
    ) {
      if (cycleCountTask.sourceLoadCarrierId) {
        this.countedLoadCarrierId = cycleCountTask.sourceLoadCarrierId
        if (
          cycleCountTask.sourceCompartmentId &&
          sourceStock &&
          sourceStock.item
        ) {
          const countedCompartment =
            this.cycleCountCountedCompartments[
              cycleCountTask.sourceCompartmentId
            ]

          if (countedCompartment) {
            this.cycleCountCountedCompartments[
              cycleCountTask.sourceCompartmentId
            ].push(sourceStock.item.id)
          } else {
            this.cycleCountCountedCompartments[
              cycleCountTask.sourceCompartmentId
            ] = [sourceStock.item.id]
          }
        }
      }
    },
    resetCycleCountedCompartments() {
      this.cycleCountCountedCompartments = {}
    },
  },
  getters: {
    hasTask: (state) => {
      return state.task !== undefined
    },
    getCycleCountQuantity: (state) => {
      return (itemId?: string) => {
        if (itemId !== undefined) {
          return state.cycleCountedQuantities[itemId] ?? 0
        }
        let quantity: number
        const barcodeStore = useBarcodeStore()
        const loadCarrierStore = useLoadCarrierStore()
        const { isMultiItemCycleCountTask } = useApiDataHelper()
        const lastScannedItem = barcodeStore.getLastScannedItem(
          loadCarrierStore.sourceLoadCarrier
        )
        if (isMultiItemCycleCountTask(state.task) && lastScannedItem) {
          quantity = state.cycleCountedQuantities[lastScannedItem.id]
        } else {
          quantity = state.cycleCountedQuantities.default
        }
        if (quantity === undefined) {
          return 0
        }
        return quantity
      }
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['cycleCountCountedCompartments', 'countedLoadCarrierId'],
  },
})
