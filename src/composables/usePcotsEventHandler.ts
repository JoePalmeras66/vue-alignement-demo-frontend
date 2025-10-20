import { useLogger } from '@tgw-components/core'
import { EventMessageType } from '@/types/Api/pcots/PcotsApiModel'
import { PcotsEventEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { RobotStateChangedEventType } from '@/types/Api/pcots/Events/RobotStateChanged/RobotStateChangedEventType'
import { WorkstationChangedEventType } from '@/types/Api/pcots/Events/WorkstationChanged/WorkstationChangedEventType'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { ItemScannedEventType } from '@/types/Api/pcots/Events/ItemScanned/ItemScannedEventType'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'

export const usePcotsEventHandler = () => {
  const logger = useLogger()
  const rovoflexStore = useRovoflexStore()
  const scanModificationStore = useScanModificationStore()
  const { resetAppIdle } = useAppIdle()

  const onHandlePcotsEvent = async (data: EventMessageType) => {
    logger.info('onPcotsEventReceived:', data)
    if (data.eventType === PcotsEventEnum.RobotStateChangedEvent) {
      resetAppIdle()
      await rovoflexStore.handleRovoflexEvent(
        data.data as RobotStateChangedEventType
      )
    } else if (data.eventType === PcotsEventEnum.WorkstationChangedEvent) {
      await rovoflexStore.handleWorkstationChangedEvent(
        data.data as WorkstationChangedEventType
      )
    } else if (data.eventType === PcotsEventEnum.ItemScannedEvent) {
      resetAppIdle()
      await scanModificationStore.handleItemScan(
        data.data as ItemScannedEventType
      )
    }
  }
  return { onHandlePcotsEvent }
}
