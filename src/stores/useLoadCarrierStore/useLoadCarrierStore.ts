import { defineStore } from 'pinia'
import { Nullable } from 'vitest'
import { LoadCarrierType } from '@/types/Api/pcots/PcotsApiModel'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { PcotsLocationType } from '@/types/PcotsLocationType'

export const useLoadCarrierStore = defineStore('loadcarrier', {
  state: () => ({
    sourceLoadCarrier: undefined as LoadCarrierType | undefined,
    targetLoadCarrier: undefined as LoadCarrierType | undefined,
    loadCarrierHeaderDataSource: '' as string,
    loadCarrierHeaderDataTarget: '' as string,
  }),
  actions: {
    resetSourceLoadCarrier() {
      this.sourceLoadCarrier = undefined
    },
    resetTargetLoadCarrier() {
      this.targetLoadCarrier = undefined
    },
    setLoadCarrier(
      location: PcotsLocationType,
      loadCarrier: Nullable<LoadCarrierType>
    ) {
      if (location === PcotsLocationEnum.Source) {
        this.setSourceLoadCarrier(loadCarrier)
      } else if (location === PcotsLocationEnum.Target) {
        this.setTargetLoadCarrier(loadCarrier)
      }
    },
    getLoadCarrier(location: PcotsLocationType) {
      if (location === PcotsLocationEnum.Source) {
        return this.sourceLoadCarrier
      }
      return this.targetLoadCarrier
    },
    setSourceLoadCarrier(loadCarrier: Nullable<LoadCarrierType>) {
      if (loadCarrier === undefined || loadCarrier === null) {
        this.resetSourceLoadCarrier()
      } else {
        this.sourceLoadCarrier = loadCarrier
      }
    },
    setTargetLoadCarrier(loadCarrier: Nullable<LoadCarrierType>) {
      if (loadCarrier === undefined || loadCarrier === null) {
        this.resetTargetLoadCarrier()
      } else {
        this.targetLoadCarrier = loadCarrier
      }
    },
    updateUnknownItemsUrls() {
      const { unknownItemUrl } = useTheme()
      this.sourceLoadCarrier?.compartments.forEach((compartment) => {
        compartment.items.forEach((stock) => {
          if (stock.item.isUnknownItem) {
            stock.item.images[0].url = unknownItemUrl.value
          }
        })
      })
    },
  },
})
