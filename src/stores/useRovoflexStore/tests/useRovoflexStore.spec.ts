import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import {
  MessageTypeEnum,
  RobotOperatingStateEnum,
  TaskExecutionModeEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { RobotStateChangedEventType } from '@/types/Api/pcots/Events/RobotStateChanged/RobotStateChangedEventType'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { setConsoleLogger } from '@/helpers/loggerHelper'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { useApiMock } from '@/helpers/useApiMock'

const mockClose = vi.fn()
const mockNotify = vi.fn()

const mockTriggerAppMetaDataEvent = vi.fn()
vi.mock('@/composables/useAppContainer', () => ({
  useAppContainer() {
    const triggerAppMetaDataEvent = mockTriggerAppMetaDataEvent
    return { triggerAppMetaDataEvent }
  },
}))

vi.mock('@tgw-components/web', async () => {
  const tgwWebComponents = await vi.importActual<
    typeof import('@tgw-components/web')
  >('@tgw-components/web')
  return {
    ...tgwWebComponents,
    notify: (data: any): any => {
      mockNotify(data)
      return { close: mockClose }
    },
  }
})

const {
  mockGetWorkstationStateApi,
  mockGetRobotStateApi,
  getRobotStateResponseData,
  getWorkstationStateResponseData,
} = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  getWorkstationStateApi: () => mockGetWorkstationStateApi(),
  getRobotStateApi: () => mockGetRobotStateApi(),
}))

const mockCurrentRoute = ref({ name: 'Herbert' })
const mockRouterPush = vi.fn((data: any) => {
  if (typeof data === 'string') {
    mockCurrentRoute.value.name = data
  } else {
    mockCurrentRoute.value.name = data.name
  }
})
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (data: any) => mockRouterPush(data),
    currentRoute: mockCurrentRoute,
  }),
}))

setActivePinia(createPinia())

describe('Test useRovoflexStore', () => {
  const router = useRouter()
  const rovoflexStore = useRovoflexStore()
  const workspaceStore = useWorkspaceStore()
  const appContainerConfigStore = useAppContainerConfigStore()

  setConsoleLogger()

  beforeEach(() => {
    getWorkstationStateResponseData.workstationMode =
      WorkStationModeEnum.Picking
    getWorkstationStateResponseData.robotSupport = true
    getWorkstationStateResponseData.taskExecutionMode =
      TaskExecutionModeEnum.Init
    getRobotStateResponseData.operatingState = RobotOperatingStateEnum.Off
    getRobotStateResponseData.errors = []
    getRobotStateResponseData.robotInHome = false
    mockClose.mockClear()
    mockNotify.mockClear()
    rovoflexStore.$reset()
    rovoflexStore.router = markRaw(router)
  })

  it('should show notification', () => {
    rovoflexStore.showNotification({
      messageType: MessageTypeEnum.Warning,
      messageTitle: 'test',
      messageText: 'test',
      parameters: [],
    } as MessageType)
    expect(rovoflexStore.isNotificationOpen()).toBeTruthy()
    expect(mockNotify).toHaveBeenCalledOnce()
  })

  it('should close notification', () => {
    rovoflexStore.showNotification({
      messageType: MessageTypeEnum.Warning,
      messageTitle: 'test',
      messageText: 'test',
      parameters: [],
    } as MessageType)
    expect(rovoflexStore.isNotificationOpen()).toBeTruthy()
    expect(mockNotify).toHaveBeenCalledOnce()
    rovoflexStore.closeNotification()
    expect(mockClose).toHaveBeenCalledOnce()
    expect(rovoflexStore.isNotificationOpen()).toBeFalsy()
  })

  it('should get 0 put quantity', () => {
    expect(rovoflexStore.getPutQuantity).toBe(0)
  })

  it('should route home when robot in home position and on moveRobotToHome page', async () => {
    expect(mockRouterPush).toHaveBeenCalledTimes(0)
    let robotStateChangedEvent = {
      operatingState: RobotOperatingStateEnum.Error,
      errors: ['myError'],
      robotInHome: false,
    } as RobotStateChangedEventType
    await rovoflexStore.handleRovoflexEvent(robotStateChangedEvent)
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockCurrentRoute.value.name).toBe('moveRobotToHome')
    robotStateChangedEvent = {
      operatingState: RobotOperatingStateEnum.Error,
      errors: [],
      robotInHome: true,
    } as RobotStateChangedEventType
    await rovoflexStore.handleRovoflexEvent(robotStateChangedEvent)
    expect(mockRouterPush).toHaveBeenCalledTimes(2)
    expect(mockCurrentRoute.value.name).toBe('/')
  })

  it('should ignore event when workstation mode is WorkStationModeEnum.Off', async () => {
    rovoflexStore.rovoflexState = RovoflexState.RovoflexPicking
    workspaceStore.workstationMode = WorkStationModeEnum.Off
    const robotStateChangedEvent = {
      operatingState: RobotOperatingStateEnum.Error,
      errors: ['myError'],
      robotInHome: true,
    } as RobotStateChangedEventType
    await rovoflexStore.handleRovoflexEvent(robotStateChangedEvent)
    expect(rovoflexStore.rovoflexState).toEqual(RovoflexState.RovoflexPicking)
  })

  it('should load states', async () => {
    getWorkstationStateResponseData.taskExecutionMode =
      TaskExecutionModeEnum.Human
    expect(
      appContainerConfigStore.appMeta.containerHeaderMenuItems?.some(
        (item) => item.actionName === AppContainerActionEnum.SwitchToRobotMode
      )
    ).toBeFalsy()
    await rovoflexStore.loadStates()
    expect(
      appContainerConfigStore.appMeta.containerHeaderMenuItems?.some(
        (item) => item.actionName === AppContainerActionEnum.SwitchToRobotMode
      )
    ).toBeTruthy()
  })

  it('should not load robot state on taskExecutionMode init', async () => {
    getWorkstationStateResponseData.taskExecutionMode =
      TaskExecutionModeEnum.Init
    getWorkstationStateResponseData.workstationMode =
      WorkStationModeEnum.Picking
    mockGetRobotStateApi.mockClear()
    expect(mockGetRobotStateApi).not.toHaveBeenCalled()
    await rovoflexStore.loadStates()
    expect(mockGetRobotStateApi).not.toHaveBeenCalled()
  })

  it('should not load robot state on workstationMode off', async () => {
    getWorkstationStateResponseData.taskExecutionMode =
      TaskExecutionModeEnum.Human
    getWorkstationStateResponseData.workstationMode = WorkStationModeEnum.Off
    mockGetRobotStateApi.mockClear()
    expect(mockGetRobotStateApi).not.toHaveBeenCalled()
    await rovoflexStore.loadStates()
    expect(mockGetRobotStateApi).not.toHaveBeenCalled()
  })
})
