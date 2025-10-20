// noinspection DuplicatedCode

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { mount } from '@vue/test-utils'
import { RouteLocationNormalized, RouteMeta, RouteParams } from 'vue-router'
import WorkstationInactiveView from '@/views/WorkstationInactiveView/WorkstationInactiveView.vue'

import { ThemeEnum, colorMode } from '@/composables/useTheme'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useApiMock } from '@/helpers/useApiMock'

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

const { mockGetWorkstationStateApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  getWorkstationStateApi: () => mockGetWorkstationStateApi(),
}))

describe('Test WorkstationInactiveView', () => {
  let wrapper: VueWrapper
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'workstation-inactive-view': {
          inactive: 'Inactive',
        },
      },
    },
  })

  const workspaceStore = useWorkspaceStore()

  const mountView = () => {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = mount(WorkstationInactiveView, {
      global: {
        plugins: [i18n],
      },
      props: {},
    })
  }

  beforeEach(() => {
    workspaceStore.workstation = {
      id: '69',
      name: 'Quattro Stagioni',
      path: '',
      isExtendedApiSupported: true,
    }
    colorMode.value = ThemeEnum.light
    mockRouterPush.mockClear()
    mockCurrentRoute.value.name = 'inactive'
  })
  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', async () => {
    const currentTime = useDateFormat(useNow(), 'HH:mm')
    const currentDate = useDateFormat(useNow(), 'dddd, MMMM D YYYY')
    mountView()
    await new Promise(process.nextTick)
    expect(mockRouterPush).toHaveBeenCalledTimes(2)
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'inactive' })
    expect(wrapper.find('.workstation-inactive-view').exists()).toBeTruthy()
    expect(wrapper.find('.bg-animation source').exists()).toBeTruthy()
    expect(wrapper.find('.bg-animation source').attributes().src).toBe(
      'src/assets/animations/video/workstation-inactive_light.mp4'
    )
    expect(wrapper.find('.header-container').exists()).toBeTruthy()
    expect(wrapper.find('.station-name').exists()).toBeTruthy()
    expect(wrapper.find('.station-name').text()).toBe('Quattro Stagioni')
    expect(wrapper.find('.current-time').exists()).toBeTruthy()
    expect(wrapper.find('.current-time').text()).toBe(currentTime.value)
    expect(wrapper.find('.current-date').exists()).toBeTruthy()
    expect(wrapper.find('.current-date').text()).toBe(currentDate.value)
    expect(wrapper.find('.workstation-state-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.workstation-state-container__text').exists()
    ).toBeTruthy()
  })

  it('should render dark', async () => {
    colorMode.value = ThemeEnum.dark
    mountView()
    await new Promise(process.nextTick)
    expect(wrapper.find('.bg-animation source').attributes().src).toBe(
      'src/assets/animations/video/workstation-inactive_dark.mp4'
    )
  })
})
