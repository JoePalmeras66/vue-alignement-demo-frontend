// noinspection DuplicatedCode

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { mount } from '@vue/test-utils'
import LoadCarrierDetailsView from '@/views/LoadCarrierDetailsView/LoadCarrierDetailsView.vue'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import {
  getCompartment,
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import LoadCarrierDetails from '@/components/LoadCarrierDetails/LoadCarrierDetails.vue'
import LoadCarrierDetailsFooter from '@/components/LoadCarrierDetailsFooter/LoadCarrierDetailsFooter.vue'

setActivePinia(createPinia())

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

describe('Test LoadCarrierDetailsView', () => {
  const currentLocale = ref<string>('en')
  let wrapper: VueWrapper<InstanceType<typeof LoadCarrierDetailsView>>

  const mountDetailsView = () => {
    if (wrapper) {
      wrapper.unmount()
    }
    const i18n = createI18n({
      legacy: false,
      locale: currentLocale.value,
      messages: {
        en: {
          'load-carrier-details': {
            source: 'Source load carrier',
            target: 'Target load carrier',
            compartment:
              '{n} Compartments | {n} Compartment | {n} Compartments',
            item: '{n} Items | {n} Item | {n} Items',
            item_type: '{n} Item types | {n} Item type | {n} Item types',
            show_target: 'Show target lc',
            show_source: 'Show source lc',
          },
        },
        de: {
          'load-carrier-details': {
            source: 'Source load carrier',
            target: 'Target load carrier',
            compartment:
              '{n} Compartments | {n} Compartment | {n} Compartments',
            item: '{n} Items | {n} Item | {n} Items',
            item_type: '{n} Item types | {n} Item type | {n} Item types',
            show_target: 'Show target lc',
            show_source: 'Show source lc',
          },
        },
      },
    })
    wrapper = mount(LoadCarrierDetailsView, {
      global: {
        plugins: [i18n],
        stubs: {
          IconButton: true,
          LoadCarrierDetails: true,
          LoadCarrierItemDetails: true,
          LoadCarrierDetailsOrderLines: true,
        },
      },
      props: {},
    })
  }

  const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
  const loadCarrierStore = useLoadCarrierStore()

  beforeEach(() => {
    currentLocale.value = 'en'
    loadCarrierDetailsStore.$reset()
    loadCarrierStore.$reset()
    mockRouterPush.mockClear()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render source correctly', () => {
    loadCarrierDetailsStore.loadCarrier = getSourceLoadCarrier()
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Source
    mountDetailsView()
    expect(
      wrapper.find('.load-carrier-details-view-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe(
      'Source load carrier - #4711'
    )
    expect(wrapper.findAll('.sub-text-item__text')[0].text()).toBe(
      '1 Compartment'
    )
    expect(wrapper.findAll('.sub-text-item__text')[1].text()).toBe('10 Items')
    expect(wrapper.findAll('.sub-text-item__text')[2].text()).toBe(
      '1 Item type'
    )
    expect(wrapper.find('icon-button-stub').attributes().text).toBe(
      'Show target lc'
    )
    expect(wrapper.find('load-carrier-details-stub').exists()).toBeTruthy()
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeTruthy()
  })

  it('should render target correctly', () => {
    loadCarrierDetailsStore.loadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Target
    mountDetailsView()
    expect(
      wrapper.find('.load-carrier-details-view-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe(
      'Target load carrier - #4712'
    )
    expect(wrapper.findAll('.sub-text-item__text')[0].text()).toBe(
      '1 Compartment'
    )
    expect(wrapper.findAll('.sub-text-item__text')[1].text()).toBe('10 Items')
    expect(wrapper.findAll('.sub-text-item__text')[2].text()).toBe(
      '1 Item type'
    )
    expect(wrapper.find('icon-button-stub').attributes().text).toBe(
      'Show source lc'
    )
    expect(wrapper.find('load-carrier-details-stub').exists()).toBeTruthy()
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeTruthy()
  })

  it('should show opposite load carrier', async () => {
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.targetLoadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.loadCarrier = loadCarrierStore.targetLoadCarrier
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Target

    mountDetailsView()
    expect(wrapper.find('.header-text').text()).toBe(
      'Target load carrier - #4712'
    )
    const button = wrapper.find('icon-button-stub')
    await button.trigger('click')

    expect(wrapper.find('.header-text').text()).toBe(
      'Source load carrier - #4711'
    )

    await button.trigger('click')

    expect(wrapper.find('.header-text').text()).toBe(
      'Target load carrier - #4712'
    )
  })

  it('should not show opposite load carrier', async () => {
    loadCarrierStore.targetLoadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.loadCarrier = loadCarrierStore.targetLoadCarrier
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Target

    mountDetailsView()
    expect(wrapper.find('.header-text').text()).toBe(
      'Target load carrier - #4712'
    )
    const button = wrapper.find('icon-button-stub')
    await button.trigger('click')

    expect(wrapper.find('.header-text').text()).toBe(
      'Target load carrier - #4712'
    )
  })

  it('should change selected compartment', async () => {
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.targetLoadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.loadCarrier = loadCarrierStore.targetLoadCarrier
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Target
    const testCompartment = getCompartment()
    testCompartment.id = '12341234'

    mountDetailsView()
    wrapper
      .findComponent(LoadCarrierDetails)
      .vm.$emit('selected-compartment-changed', testCompartment)

    expect(wrapper.vm.selectedCompartment).toStrictEqual(testCompartment)
  })

  it('should route back with no data', () => {
    mountDetailsView()
    expect(mockRouterPush).toHaveBeenCalledOnce()
    expect(mockRouterPush).toHaveBeenCalledWith('/')
  })

  it('should change button width on locale', () => {
    mountDetailsView()
    expect(wrapper.vm.textMinWidth).toBe('206px')
    currentLocale.value = 'de'
    mountDetailsView()
    expect(
      (wrapper.vm as InstanceType<typeof LoadCarrierDetailsView>).textMinWidth
    ).toBe('276px')
  })

  it('should render correctly by current page', async () => {
    mountDetailsView()
    expect(wrapper.vm.currentPage).toBe(LoadCarrierDetailsPageEnum.item_details)
    expect(wrapper.find('load-carrier-details-stub').exists()).toBeTruthy()
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-order-lines-stub').exists()
    ).toBeFalsy()
    await wrapper
      .findComponent(LoadCarrierDetailsFooter)
      .vm.$emit('update:modelValue', LoadCarrierDetailsPageEnum.order_lines)
    expect(wrapper.vm.currentPage).toBe(LoadCarrierDetailsPageEnum.order_lines)
    expect(wrapper.find('load-carrier-details-stub').exists()).toBeFalsy()
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeFalsy()
    expect(
      wrapper.find('load-carrier-details-order-lines-stub').exists()
    ).toBeTruthy()
  })
})
