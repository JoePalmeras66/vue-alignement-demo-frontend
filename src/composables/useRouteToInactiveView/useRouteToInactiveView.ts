import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { WorkStationModeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'

export const useRouteToInactiveView = () => {
  const { workstationMode } = storeToRefs(useWorkspaceStore())
  const router = useRouter()

  const routeToView = async () => {
    if (workstationMode.value === WorkStationModeEnum.Off) {
      await router.push({ name: 'inactive' })
    } else if (router.currentRoute.value.name === 'inactive') {
      // Task will be reloaded in mounted of home
      const taskStore = useTaskStore()
      taskStore.resetTask()
      await router.push({ name: 'home' })
    }
  }
  watch(workstationMode, async () => {
    await routeToView()
  })

  onMounted(async () => {
    await routeToView()
  })
}
