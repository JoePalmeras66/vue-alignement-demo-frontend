import { afterEach, describe, expect, it, vi } from 'vitest'

import { createI18n } from 'vue-i18n'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { mount } from '@vue/test-utils'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { GetLoadCarrierOrdersRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersRequestType'
import LoadCarrierDetailsOrderLines from '@/components/LoadCarrierDetailsOrderlines/LoadCarrierDetailsOrderLines.vue'
import { useApiMock } from '@/helpers/useApiMock'

const { mockGetLoadCarrierOrdersApi } = useApiMock()

vi.mock('@/api/pcotsExtApi', () => ({
  getLoadCarrierOrdersApi: (request: GetLoadCarrierOrdersRequestType) =>
    mockGetLoadCarrierOrdersApi(request),
}))

describe('Test LoadCarrierDetailsOrderLines', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details-order-lines': {
          order_lines_target: 'Orders that are picked into this LC',
          order_lines_source: 'Orders that are picked from this LC',
          col_order_id: 'Order ID',
          col_order_description: 'Order description',
          col_item_id: 'Item ID',
          col_item_image: 'Item image',
          col_item_description: 'Item description',
          col_quantity: 'Quantity',
          col_quantity_unit: 'Quantity unit',
          col_compartment_id: 'Compartment ID',
        },
      },
    },
  })

  let wrapper: VueWrapper

  const mountView = (pcotsLocation: PcotsLocationEnum) => {
    wrapper = mount(LoadCarrierDetailsOrderLines, {
      global: {
        plugins: [i18n],
        stubs: {
          ItemImage: true,
        },
      },
      props: {
        location: pcotsLocation,
      },
    })
  }

  afterEach(() => {
    if (!wrapper) {
      return
    }
    wrapper.unmount()
  })

  const expectHeaderRowGridColumn = (columnNumber: number, text: string) => {
    const selector = `.dx-header-row[role="row"] #dx-col-${columnNumber} .dx-datagrid-text-content`
    expect(wrapper.find(selector).exists()).toBeTruthy()
    expect(wrapper.find(selector).text()).toBe(text)
  }

  const expectDataRowGridColumn = (
    rowNumber: number,
    columnNumber: number,
    text: string
  ) => {
    const selector = `.dx-data-row[role="row"][aria-rowindex="${rowNumber}"] td[role="gridcell"][aria-colindex="${columnNumber}"]`
    expect(wrapper.find(selector).exists()).toBeTruthy()
    expect(wrapper.find(selector).text()).toBe(text)
  }

  it('should render source correctly', async () => {
    mountView(PcotsLocationEnum.Source)
    // Wait for grid init
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(
      wrapper.find('.load-carrier-details-order-lines').exists()
    ).toBeTruthy()
    expect(wrapper.find('.toolbar-title__text').exists()).toBeTruthy()
    expect(wrapper.find('.toolbar-title__text').text()).toBe(
      'Orders that are picked from this LC'
    )
    expect(wrapper.find('.dx-datagrid').exists()).toBeTruthy()
    expectHeaderRowGridColumn(1, 'Order ID')
    expectHeaderRowGridColumn(2, 'Order description')
    expectHeaderRowGridColumn(3, 'Item ID')
    expectHeaderRowGridColumn(4, 'Item image')
    expectHeaderRowGridColumn(5, 'Item description')
    expectHeaderRowGridColumn(6, 'Quantity')
    expectHeaderRowGridColumn(7, 'Quantity unit')
    expectHeaderRowGridColumn(8, 'Compartment ID')
    expectDataRowGridColumn(1, 1, '')
    expectDataRowGridColumn(1, 2, 'Test order line')
    expectDataRowGridColumn(1, 3, '800002')
    expect(wrapper.find('item-image-stub').attributes().itemimageurls).toBe(
      '../../../src/assets/images/item-images/TGW_PEN.png,../../../src/assets/images/item-images/TGW_NOTES.png,../../../src/assets/images/item-images/TGW_MINT.png'
    )
    expectDataRowGridColumn(1, 5, 'TGW Pen')
    expectDataRowGridColumn(1, 6, '10')
    expectDataRowGridColumn(1, 7, 'Pcs')
    expectDataRowGridColumn(1, 8, '1')
  })

  it('should render target correctly', async () => {
    mountView(PcotsLocationEnum.Target)
    await new Promise(process.nextTick)
    expect(
      wrapper.find('.load-carrier-details-order-lines').exists()
    ).toBeTruthy()
    expect(wrapper.find('.toolbar-title__text').exists()).toBeTruthy()
    expect(wrapper.find('.toolbar-title__text').text()).toBe(
      'Orders that are picked into this LC'
    )
    expect(wrapper.find('.dx-datagrid').exists()).toBeTruthy()
  })
})
