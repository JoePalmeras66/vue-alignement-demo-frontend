import { defineStore } from 'pinia'
import { LoadCarrierType } from '@/types/Api/pcots/PcotsApiModel'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { PcotsLocationType } from '@/types/PcotsLocationType'

export const useLoadCarrierDetailsStore = defineStore('loadCarrierDetails', {
  state: () => ({
    loadCarrier: undefined as LoadCarrierType | undefined,
    pcotsLocation: PcotsLocationEnum.Source as PcotsLocationType,
  }),
  actions: {
    setLoadCarrierDetails(
      loadCarrier: LoadCarrierType | undefined,
      pcotsLocation: PcotsLocationType
    ) {
      this.loadCarrier = loadCarrier
      this.pcotsLocation = pcotsLocation
    },
    swapPcotsLocation() {
      const loadCarrierStore = useLoadCarrierStore()

      if (this.pcotsLocation === PcotsLocationEnum.Source) {
        this.pcotsLocation = PcotsLocationEnum.Target
      } else {
        this.pcotsLocation = PcotsLocationEnum.Source
      }
      this.loadCarrier = loadCarrierStore.getLoadCarrier(this.pcotsLocation)
    },
  },
})
