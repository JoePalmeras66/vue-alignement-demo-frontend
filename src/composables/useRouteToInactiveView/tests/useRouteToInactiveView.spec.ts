import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { RouteLocationNormalized, RouteMeta, RouteParams } from 'vue-router'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { WorkStationModeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { getPickingTask } from '@/helpers/testDataProvider'
import { useRouteToInactiveView } from '@/composables/useRouteToInactiveView/useRouteToInactiveView'

setActivePinia(createPinia())

const mockRouterPush = vi.fn()
const mockCurrentRoute = ref<RouteLocationNormalized>({
  query: { workstationId: '' },
  path: '',
  hash: '',
  fullPath: '',
  redirectedFrom: undefined,
  matched: [],
  name: undefined,
  params: {} as RouteParams,
  meta: {} as RouteMeta,
})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush, currentRoute: mockCurrentRoute }),
}))

describe('Test useRouteToInactiveView', () => {
  useRouteToInactiveView()
  const { workstationMode } = storeToRefs(useWorkspaceStore())
  const taskStore = useTaskStore()

  beforeEach(() => {
    mockCurrentRoute.value.name = 'inactive'
  })

  afterEach(() => {
    mockRouterPush.mockClear()
  })

  it('should route to inactive view if workstationMode is WorkStationModeEnum.Off', async () => {
    workstationMode.value = WorkStationModeEnum.Off
    await new Promise(process.nextTick)
    expect(mockRouterPush).toHaveBeenCalledOnce()
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'inactive' })
  })

  it('should route to home view if on inactive view and workstationMode changes to WorkStationModeEnum.Picking', async () => {
    taskStore.setTask(getPickingTask(1))
    workstationMode.value = WorkStationModeEnum.Picking
    await new Promise(process.nextTick)
    expect(mockRouterPush).toHaveBeenCalledOnce()
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'home' })
    expect(taskStore.hasTask).toBeFalsy()
  })

  it('should not route to inactive view if workstationMode is WorkStationModeEnum.None', async () => {
    mockCurrentRoute.value.name = 'home'
    workstationMode.value = WorkStationModeEnum.None
    await new Promise(process.nextTick)
    expect(mockRouterPush).toHaveBeenCalledTimes(0)
  })
})
