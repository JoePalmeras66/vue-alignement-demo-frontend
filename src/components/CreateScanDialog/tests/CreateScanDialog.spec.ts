// noinspection DuplicatedCode

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { mount } from '@vue/test-utils'
import i18n from '../../../plugins/i18nFactory'
import CreateScanDialog from '@/components/CreateScanDialog/CreateScanDialog.vue'
import {
  BarcodeTestData,
  getBarcode,
  getPickingTask,
} from '@/helpers/testDataProvider'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { BarcodeDataType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import {
  CreateScanModelRecordType,
  buildCreateScanModelKeyFormat,
} from '@/types/CreateScanModelKeyFormat'
import { useApiMock } from '@/helpers/useApiMock'

const { mockVerifyBarcodeApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  verifyBarcodeApi: (request: VerifyBarcodeRequestType) =>
    mockVerifyBarcodeApi(request),
}))

describe('Test CreateScanDialog', () => {
  const i18nPlugin = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'create-scan-dialog': {
          create_scan: 'Create scan',
          continue: 'Continue',
          cancel: 'Cancel',
          error_message:
            'The entered {0} number does not match the expected item.',
          error_message_field:
            'Entered {0} does not belong to the expected item.',
        },
        testing: {
          specific_barcode_valid: 'Only {0} is valid!',
        },
      },
    },
  })
  let wrapper: VueWrapper<InstanceType<typeof CreateScanDialog>>

  const mountView = async (
    task: TaskType,
    createScanModel: CreateScanModelRecordType = {}
  ) => {
    wrapper = mount(CreateScanDialog, {
      global: {
        plugins: [i18nPlugin],
        stubs: {
          transition: false,
        },
      },
      props: {
        isVisible: true,
        task,
        createScanModel,
      },
    })
    await new Promise(process.nextTick)
  }

  // Set i18n for composable useMessage
  i18n.global.t = i18nPlugin.global.t

  afterEach(() => {
    wrapper?.unmount()
  })

  it('should render correctly', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '', true)
    )
    expect(wrapper.find('.scan-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').text()).toBe('Create scan')
    expect(wrapper.find('.dialog-body').exists()).toBeTruthy()
    expect(wrapper.find('.create-scan-form').exists()).toBeTruthy()
    expect(wrapper.find('.create-scan-item').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-form-item__label').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-form-item__label').text()).toBe('Gtin')
    expect(wrapper.find('.barcode-text').exists()).toBeTruthy()
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    expect(wrapper.findAll('.dialog-button')[0].text()).toBe('Cancel')
    expect(wrapper.findAll('.dialog-button')[1].text()).toBe('Continue')
    expect(wrapper.findAll('.dialog-button')[1].attributes()).toHaveProperty(
      'disabled'
    )
  })

  it('should close on cancel click', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '', true)
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    const cancelButton = wrapper.findAll('.dialog-button')[0]
    await cancelButton.trigger('click')
    await new Promise(process.nextTick)
    expect((wrapper.emitted()['update:isVisible'][0] as [0])[0]).toBeFalsy()
  })

  it('should emit continue on valid barcode', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '', true)
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    await wrapper.find('input').setValue('69')
    expect(wrapper.vm.createScanModel).toEqual({ Gtin_1: '69' })
    await new Promise(process.nextTick)
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-container').exists()).toBeFalsy()
    expect(wrapper.emitted()).toHaveProperty('continue')
    expect(wrapper.emitted('continue')).toEqual([
      [
        [
          {
            barcode: '69',
            barcodeType: BarcodeTypeEnum.Gtin,
          } as BarcodeDataType,
        ],
      ],
    ])
    expect(wrapper.vm.createScanModel).toEqual({})
  })

  it('should display backend validation error(backend error message)', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '', true)
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    await wrapper.find('input').setValue('0815')
    await new Promise(process.nextTick)
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-container').exists()).toBeTruthy()
    expect(wrapper.find('.error-icon').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').text()).toBe('Only 69 is valid!')
  })

  it('should display backend validation error(client error message)', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '', true)
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    await wrapper.find('input').setValue('CLIENTERROR')
    await new Promise(process.nextTick)
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-container').exists()).toBeTruthy()
    expect(wrapper.find('.error-icon').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').text()).toBe(
      'The entered GTIN number does not match the expected item.'
    )
  })

  it('should render multiple scan fields', async () => {
    await mountView(
      getPickingTask(
        10,
        [getBarcode(BarcodeTypeEnum.Gtin), getBarcode(BarcodeTypeEnum.Imei)],
        '0815'
      )
    )
    expect(wrapper.find('.create-scan-form').exists()).toBeTruthy()
    expect(wrapper.findAll('.create-scan-item').length).toBe(2)
    expect(wrapper.findAll('.tgw-form-item__label')[0].text()).toBe('Gtin')
    expect(wrapper.findAll('.tgw-form-item__label')[1].text()).toBe('Imei')
  })

  it('should render multiple scan fields of same type', async () => {
    await mountView(
      getPickingTask(
        10,
        [
          getBarcode(BarcodeTypeEnum.Gtin),
          getBarcode(BarcodeTypeEnum.Imei),
          getBarcode(BarcodeTypeEnum.Imei),
        ],
        '0815'
      )
    )
    expect(wrapper.find('.create-scan-form').exists()).toBeTruthy()
    expect(wrapper.findAll('.create-scan-item').length).toBe(3)
    expect(wrapper.findAll('.tgw-form-item__label')[0].text()).toBe('Gtin')
    expect(wrapper.findAll('.tgw-form-item__label')[1].text()).toBe('Imei')
    expect(wrapper.findAll('.tgw-form-item__label')[2].text()).toBe('Imei')
  })

  it('should emit continue with multiple fields of same type', async () => {
    await mountView(
      getPickingTask(
        10,
        [
          getBarcode(BarcodeTypeEnum.Gtin),
          getBarcode(BarcodeTypeEnum.Imei),
          getBarcode(BarcodeTypeEnum.Imei),
        ],
        '69',
        false
      )
    )
    await wrapper.findAll('input')[0].setValue('69')
    await wrapper.findAll('input')[1].setValue(BarcodeTestData.Imei.Imei1)
    await wrapper.findAll('input')[2].setValue(BarcodeTestData.Imei.Imei2)
    await new Promise(process.nextTick)
    expect(wrapper.vm.createScanModel).toEqual({
      Gtin_1: '69',
      Imei_1: '448255738063551',
      Imei_2: '490154203237518',
    })
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.vm.createScanModel).toEqual({})
    expect(wrapper.emitted('continue')).toBeTruthy()
    expect(wrapper.emitted('continue')).toEqual([
      [
        [
          { barcode: '69', barcodeType: BarcodeTypeEnum.Gtin },
          {
            barcode: BarcodeTestData.Imei.Imei1,
            barcodeType: BarcodeTypeEnum.Imei,
          },
          {
            barcode: BarcodeTestData.Imei.Imei2,
            barcodeType: BarcodeTypeEnum.Imei,
          },
        ] as BarcodeDataType[],
      ],
    ])
  })

  it('should show validation error for multiple scan fields(backend validation)', async () => {
    await mountView(
      getPickingTask(
        10,
        [getBarcode(BarcodeTypeEnum.Gtin), getBarcode(BarcodeTypeEnum.Imei)],
        '',
        true
      )
    )
    await wrapper.findAll('input')[0].setValue('CLIENTERROR')
    await wrapper.findAll('input')[1].setValue('CLIENTERROR')
    await new Promise(process.nextTick)
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-container').exists()).toBeTruthy()
    expect(wrapper.find('.error-icon').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').exists()).toBeTruthy()
    expect(wrapper.find('.error-text').text()).toBe(
      'The entered GTIN, IMEI number does not match the expected item.'
    )
  })

  it('should display client validation error', async () => {
    await mountView(
      getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)], '0815')
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    await wrapper.find('input').setValue('0816')
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    // wait for 100ms to render validation error
    await new Promise((resolve) => setTimeout(resolve, 100))
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-container').exists()).toBeFalsy()
    expect(wrapper.find('.tgw-form-item__error').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-form-item__error').text()).toBe(
      'Entered GTIN does not belong to the expected item.'
    )
  })

  it('should display client validation error for multiple scan fields', async () => {
    await mountView(
      getPickingTask(
        10,
        [
          getBarcode(BarcodeTypeEnum.Gtin),
          getBarcode(BarcodeTypeEnum.Imei),
          getBarcode(BarcodeTypeEnum.Serial),
        ],
        '0815'
      )
    )
    expect(wrapper.vm.isVisible).toBeTruthy()
    await wrapper.findAll('input')[0].setValue('0816')
    await wrapper.findAll('input')[1].setValue('0816')
    await wrapper.findAll('input')[2].setValue('0816')
    const continueButton = wrapper.findAll('.dialog-button')[1]
    expect(continueButton.attributes()).not.toHaveProperty('disabled')
    await continueButton.trigger('click')
    // wait for 200ms to render validation error
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(wrapper.find('.error-container').exists()).toBeFalsy()
    // Should only have 2 because serial won't be validated on client side
    expect(wrapper.findAll('.tgw-form-item__error').length).toBe(2)
    expect(wrapper.findAll('.tgw-form-item__error')[0].text()).toBe(
      'Entered GTIN does not belong to the expected item.'
    )
    expect(wrapper.findAll('.tgw-form-item__error')[1].text()).toBe(
      'Entered IMEI does not belong to the expected item.'
    )
  })

  it('should fill createScanModel', async () => {
    const createScanModel = ref<CreateScanModelRecordType>({})
    await mountView(
      getPickingTask(
        10,
        [
          getBarcode(BarcodeTypeEnum.Gtin),
          getBarcode(BarcodeTypeEnum.Imei),
          getBarcode(BarcodeTypeEnum.Imei),
        ],
        '69',
        false
      ),
      createScanModel.value
    )
    await wrapper.findAll('input')[0].setValue('69')
    await wrapper.findAll('input')[1].setValue(BarcodeTestData.Imei.Imei1)
    await wrapper.findAll('input')[2].setValue(BarcodeTestData.Imei.Imei2)
    expect(
      createScanModel.value[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)
      ]
    ).toBe('69')
    expect(
      createScanModel.value[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 1)
      ]
    ).toBe(BarcodeTestData.Imei.Imei1)
    expect(
      createScanModel.value[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 2)
      ]
    ).toBe(BarcodeTestData.Imei.Imei2)
  })

  it('should pre fill createScanModel', async () => {
    await mountView(
      getPickingTask(
        10,
        [
          getBarcode(BarcodeTypeEnum.Gtin),
          getBarcode(BarcodeTypeEnum.Imei),
          getBarcode(BarcodeTypeEnum.Imei),
        ],
        '69',
        false
      ),
      {
        [buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)]: '69',
        [buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 1)]:
          BarcodeTestData.Imei.Imei1,
        [buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 2)]:
          BarcodeTestData.Imei.Imei2,
      }
    )
    expect(wrapper.findAll<HTMLInputElement>('input')[0].element.value).toBe(
      '69'
    )
    expect(wrapper.findAll<HTMLInputElement>('input')[1].element.value).toBe(
      BarcodeTestData.Imei.Imei1
    )
    expect(wrapper.findAll<HTMLInputElement>('input')[2].element.value).toBe(
      BarcodeTestData.Imei.Imei2
    )
  })
})
