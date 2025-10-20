// noinspection DuplicatedCode

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { AppContainer, AppMeta } from '@tgw-components/core'
import Keycloak, {
  KeycloakAccountOptions,
  KeycloakError,
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakProfile,
  KeycloakPromise,
  KeycloakRegisterOptions,
} from 'keycloak-js'
import { createPinia, setActivePinia } from 'pinia'
import { RouteLocationNormalized, RouteMeta, RouteParams } from 'vue-router'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'
import WorkstationSelectionView from '@/views/WorkstationSelectionView/WorkstationSelectionView.vue'
import { ThemeEnum, colorMode } from '@/composables/useTheme'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { useApiMock } from '@/helpers/useApiMock'
import { NotificationPayload } from '@/composables/useAppContainer'

setActivePinia(createPinia())

const backHomeEventHook = vi.fn()
const appMetaEventHook = vi.fn()
const logoutUserEventHook = vi.fn()
const toggleThemeEventHook = vi.fn()
const toggleLanguageEventHook = vi.fn()
const appContainerMock: AppContainer = {
  triggerAppMetaEvent(data?: AppMeta) {
    appMetaEventHook(data)
  },
  containerBaseUrl: ref(''),
  containerFullPath: ref(''),
  triggerAppErrorNotificationEvent(data: NotificationPayload): void {
    vi.fn()(data)
  },
  triggerAppLoadedEvent(): void {
    vi.fn()()
  },
  triggerAppNotificationEvent(data: NotificationPayload): void {
    vi.fn()(data)
  },
  triggerAppSuccessNotificationEvent(data: NotificationPayload): void {
    vi.fn()(data)
  },
  triggerAppWarningNotificationEvent(data: NotificationPayload): void {
    vi.fn()(data)
  },
  triggerThemeToggle() {
    toggleThemeEventHook()
  },
  triggerLanguageToggle() {
    toggleLanguageEventHook()
  },
  triggerBackHomeEvent(): void {
    backHomeEventHook()
  },
  triggerLogoutUserEvent(): void {
    logoutUserEventHook()
  },
  onAppInit() {
    vi.fn()
  },
  onExecuteAction() {
    vi.fn()
  },
  onThemeChange() {
    vi.fn()
  },
  onLanguageChange() {
    vi.fn()
  },
  isHosted(): boolean {
    return false
  },
  triggerAppFilterEvent() {
    vi.fn()
  },
}

const keycloakLogout = vi.fn()
const keyCloakMock: Keycloak = {
  accountManagement(): KeycloakPromise<void, void> {
    return vi.fn()()
  },
  clearToken(): void {},
  createAccountUrl(options?: KeycloakAccountOptions): string {
    return vi.fn()(options)
  },
  createLoginUrl(options?: KeycloakLoginOptions): string {
    return vi.fn()(options)
  },
  createLogoutUrl(options?: KeycloakLogoutOptions): string {
    return vi.fn()(options)
  },
  createRegisterUrl(options?: KeycloakRegisterOptions): string {
    return vi.fn()(options)
  },

  hasRealmRole(role: string): boolean {
    return vi.fn()(role)
  },

  hasResourceRole(role: string, resource?: string): boolean {
    return vi.fn()(role, resource)
  },
  init(
    initOptions: KeycloakInitOptions
  ): KeycloakPromise<boolean, KeycloakError> {
    return vi.fn()(initOptions)
  },

  isTokenExpired(minValidity?: number): boolean {
    return vi.fn()(minValidity)
  },
  loadUserInfo(): KeycloakPromise<object, void> {
    return vi.fn()()
  },
  loadUserProfile(): KeycloakPromise<KeycloakProfile, void> {
    return vi.fn()()
  },
  login(options?: KeycloakLoginOptions): KeycloakPromise<void, void> {
    return vi.fn()(options)
  },
  register(options?: KeycloakRegisterOptions): KeycloakPromise<void, void> {
    return vi.fn()(options)
  },
  updateToken(minValidity: number): KeycloakPromise<boolean, boolean> {
    return vi.fn()(minValidity)
  },
  logout(options?: KeycloakLogoutOptions): KeycloakPromise<void, void> {
    return keycloakLogout(options)
  },
}

vi.mock('@tgw-components/core', async () => {
  const tgwWebComponents = await vi.importActual<
    typeof import('@tgw-components/core')
  >('@tgw-components/core')
  return {
    ...tgwWebComponents,
    useAppContainer: (): AppContainer => appContainerMock,
  }
})

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

const { mockGetSupportedVersionsPcotsApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  getSupportedVersionsApi: () => mockGetSupportedVersionsPcotsApi(),
}))

vi.mock('@/composables/useAppContainer', () => ({
  useAppContainer() {
    const triggerAppMetaDataEvent = appMetaEventHook
    const triggerAppWarningNotificationEvent = vi.fn()
    return { triggerAppMetaDataEvent, triggerAppWarningNotificationEvent }
  },
}))

describe('Test WorkstationSelectionView', () => {
  const workspaceStore = useWorkspaceStore()
  const keyCloakStore = useKeycloakStore()
  const appContainerConfigStore = useAppContainerConfigStore()
  keyCloakStore.keycloak = keyCloakMock
  let wrapper: VueWrapper<any>
  const testRoute: RouteLocationNormalized = {
    query: { workstationId: '' },
    path: '',
    hash: '',
    fullPath: '',
    redirectedFrom: undefined,
    matched: [],
    name: undefined,
    params: {} as RouteParams,
    meta: {} as RouteMeta,
  }

  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'workstation-selection-view': {
          warning: 'Warning',
          station_not_supported: 'station_not_supported',
        },
      },
    },
  })

  const remount = () => {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = mount(WorkstationSelectionView, {
      global: {
        plugins: [i18n],
        stubs: {
          WorkstationSelection: true,
        },
      },
      props: {},
    })
  }

  beforeEach(() => {
    // Clear event hooks before each test
    appMetaEventHook.mockClear()
    backHomeEventHook.mockClear()
    logoutUserEventHook.mockClear()

    keycloakLogout.mockClear()

    workspaceStore.$reset()
    workspaceStore.clearWorkstationIdFromLocalStorage()
    appContainerConfigStore.getTranslation = useTranslations('').getTranslation
  })

  afterAll(() => {
    colorMode.value = ThemeEnum.light
  })

  const saveWorkstationIdToLocalStorage = (workstationId: string) => {
    const oldId = workspaceStore.workstation.id
    workspaceStore.workstation.id = workstationId
    workspaceStore.saveWorkstationIdToLocalStorage()
    workspaceStore.workstation.id = oldId
  }

  remount()

  it('should render correctly', () => {
    expect(wrapper.find('el-card')).toBeTruthy()
    expect(wrapper.find('workstation-selection-stub')).toBeTruthy()
  })

  it('should render multiple stations', () => {
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    remount()
    expect(wrapper.find('workstation-selection-stub')).toBeTruthy()
    expect(
      wrapper.find('workstation-selection-stub').attributes()
    ).toHaveProperty('availablestations')
    const workstationSelectionView =
      wrapper.vm as typeof WorkstationSelectionView
    expect(workstationSelectionView.availableStations.length).toBe(2)
  })

  it('should trigger back home in case of wrong workstation', () => {
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    workspaceStore.setWorkspace({
      workstation: { id: '4711', name: 'station does not exist', path: '' },
      user: { id: '1', name: 'Spatti' },
    })
    expect(backHomeEventHook).not.toHaveBeenCalled()
    remount()
    expect(backHomeEventHook).toHaveBeenCalledOnce()
  })

  it('should select station if its correct', () => {
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    workspaceStore.setWorkspace({
      workstation: { id: '0816', name: 'Simon station', path: '' },
      user: { id: '2', name: 'Simon' },
    })
    expect(appMetaEventHook).not.toHaveBeenCalled()
    remount()
    expect(appMetaEventHook).toHaveBeenCalledOnce()
    expect(appMetaEventHook.mock.calls[0]).toStrictEqual([
      appContainerConfigStore.appMeta,
    ])
  })

  it('should select first station', () => {
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
    ]
    expect(appMetaEventHook).not.toHaveBeenCalled()
    remount()
    expect(workspaceStore.getWorkspace.workstation.id).toBe('0815')
    expect(workspaceStore.getWorkspace.workstation.name).toBe('Spatti station')
    expect(appMetaEventHook).toHaveBeenCalledOnce()
    expect(appMetaEventHook.mock.calls[0]).toStrictEqual([
      appContainerConfigStore.appMeta,
    ])
  })

  it('should trigger backToLogin', async () => {
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(logoutUserEventHook).not.toHaveBeenCalled()
    remount()
    await (wrapper.vm as typeof WorkstationSelectionView).backToLogin()
    expect(logoutUserEventHook).toHaveBeenCalledOnce()
  })

  it('should reset workspace on backToLogin in dev mode', async () => {
    useEnv().setEnv('MODE', 'development')
    workspaceStore.setWorkspace({
      workstation: { id: '0816', name: 'Simon station', path: '' },
      user: { id: '2', name: 'Simon' },
    })
    remount()
    await (wrapper.vm as typeof WorkstationSelectionView).backToLogin()
    expect(workspaceStore.getWorkspace.workstation.id).toBe('')
    expect(workspaceStore.getWorkspace.workstation.name).toBe('')
    expect(workspaceStore.getWorkspace.user.id).toBe('')
    expect(workspaceStore.getWorkspace.workstation.name).toBe('')
    expect(workspaceStore.getWorkspace.workstation.id).toBe('')
    expect(keycloakLogout).toHaveBeenCalledOnce()
  })

  it('should select station from url param when available', () => {
    testRoute.query.workstationId = '0816'
    workspaceStore.loadWorkstationId(testRoute)
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(workspaceStore.workstation.id).toBe('0816')
    expect(appMetaEventHook).not.toHaveBeenCalled()
    remount()
    expect(workspaceStore.getWorkspace.workstation.id).toBe('0816')
    expect(workspaceStore.getWorkspace.workstation.name).toBe('Simon station')
    expect(appMetaEventHook).toHaveBeenCalledOnce()
    expect(appMetaEventHook.mock.calls[0]).toStrictEqual([
      appContainerConfigStore.appMeta,
    ])
  })

  it('should trigger back home in case of wrong workstation in url parameter', () => {
    testRoute.query.workstationId = '0817'
    workspaceStore.loadWorkstationId(testRoute)
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(workspaceStore.workstation.id).toBe('0817')
    expect(backHomeEventHook).not.toHaveBeenCalled()
    remount()
    expect(backHomeEventHook).toHaveBeenCalledOnce()
  })

  it('should select station from sessionStorage when available', () => {
    saveWorkstationIdToLocalStorage('0816')
    testRoute.query.workstationId = ''
    workspaceStore.loadWorkstationId(testRoute)
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(workspaceStore.workstation.id).toBe('0816')
    expect(appMetaEventHook).not.toHaveBeenCalled()
    remount()
    expect(workspaceStore.getWorkspace.workstation.id).toBe('0816')
    expect(workspaceStore.getWorkspace.workstation.name).toBe('Simon station')
    expect(appMetaEventHook).toHaveBeenCalledOnce()
    expect(appMetaEventHook.mock.calls[0]).toStrictEqual([
      appContainerConfigStore.appMeta,
    ])
  })

  it('should trigger back home in case of wrong workstation in sessionStorage', () => {
    saveWorkstationIdToLocalStorage('0817')
    testRoute.query.workstationId = ''
    workspaceStore.loadWorkstationId(testRoute)
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(workspaceStore.workstation.id).toBe('0817')
    expect(backHomeEventHook).not.toHaveBeenCalled()
    remount()
    expect(backHomeEventHook).toHaveBeenCalledOnce()
  })

  it('should not trigger back home in case of wrong workstation in sessionStorage but with special rights', () => {
    appContainerConfigStore.addMenuItem(AppContainerActionEnum.SwitchStation)
    saveWorkstationIdToLocalStorage('0817')
    testRoute.query.workstationId = ''
    workspaceStore.loadWorkstationId(testRoute)
    workspaceStore.availableStations = [
      { id: '0815', name: 'Spatti station', path: '' },
      { id: '0816', name: 'Simon station', path: '' },
    ]
    expect(workspaceStore.workstation.id).toBe('0817')
    expect(backHomeEventHook).not.toHaveBeenCalled()
    remount()
    expect(backHomeEventHook).not.toHaveBeenCalledOnce()
    // Workstation should be cleared
    expect(workspaceStore.workstation.id).toBe('')
  })
})
