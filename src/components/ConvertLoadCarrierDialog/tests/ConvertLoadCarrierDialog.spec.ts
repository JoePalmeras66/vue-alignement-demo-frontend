import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ConvertLoadCarrierDialog from '@/components/ConvertLoadCarrierDialog/ConvertLoadCarrierDialog.vue'
import { getAllLoadCarrierTypes } from '@/helpers/testDataProvider'
import LoadCarrierTypeSelect from '@/components/LoadCarrierTypeSelect/LoadCarrierTypeSelect.vue'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const allLoadCarrierTypes = getAllLoadCarrierTypes()
describe('Test ConvertLoadCarrierDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'convert-load-carrier-dialog': {
          cancel: 'Cancel',
          convert: 'Convert',
          source_load_carrier: 'source load carrier',
          target_load_carrier: 'target load carrier',
          convert_load_carrier_title: 'Convert {0}',
          convert_load_carrier_description:
            'Select the desired load carrier type.',
        },
      },
    },
  })
  const wrapper = mount(ConvertLoadCarrierDialog, {
    global: {
      plugins: [i18n],
      stubs: {
        LoadCarrierTypeSelect: true,
      },
    },
    props: {
      isVisible: false,
      loadCarrierTypes: allLoadCarrierTypes,
      pcotsLocation: PcotsLocationEnum.Source,
      numberOfOccupiedCompartments: 0,
      currentLcType: null,
    },
  })
  it('should not render when not visible', () => {
    expect(wrapper.find('.convert-load-carrier-dialog').exists()).toBeFalsy()
  })
  it('should render correctly', async () => {
    await wrapper.setProps({
      isVisible: true,
      loadCarrierTypes: allLoadCarrierTypes,
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.find('.convert-load-carrier-dialog')).toBeTruthy()
    expect(wrapper.find('.dialog-header .dialog-header-text')).toBeTruthy()
    expect(wrapper.find('.dialog-header .dialog-header-text').text()).toBe(
      'Convert source load carrier'
    )
    expect(
      wrapper.find('.dialog-header .dialog-header-description')
    ).toBeTruthy()
    expect(wrapper.findComponent(LoadCarrierTypeSelect)).toBeTruthy()
    const footerButtons = wrapper.findAll('.dialog-footer .dialog-button')
    expect(footerButtons.length).toBe(2)
    expect(footerButtons[0].text()).toBe('Cancel')
    expect(footerButtons[1].text()).toBe('Convert')
  })

  it('should close on cancel click', async () => {
    expect(wrapper.vm.isVisible).toBeTruthy()
    const cancelButton = wrapper.findAll('.dialog-button')[0]
    await cancelButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('update:isVisible')
  })

  it('should emit convert on submit click', async () => {
    await wrapper.setProps({
      isVisible: true,
      loadCarrierTypes: allLoadCarrierTypes,
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.vm.isVisible).toBeTruthy()
    wrapper.vm.onConvertClicked()
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('convertLoadCarrier')
  })
})
