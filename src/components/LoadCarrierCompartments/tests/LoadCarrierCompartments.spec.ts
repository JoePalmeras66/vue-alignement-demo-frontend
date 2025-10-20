import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierCompartments from '@/components/LoadCarrierCompartments/LoadCarrierCompartments.vue'
import LoadCarrierCompartment from '@/components/LoadCarrierCompartment/LoadCarrierCompartment.vue'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  getBarcode,
  getCompartment,
  getCycleCountTask,
  getItem2,
  getMultiItemLoadCarrier,
  getPickingTask,
  getSourceLoadCarrier,
  getSourceLoadCarrierWithCompartments,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { CompartmentState } from '@/types/CompartmentState'

const { getCompartmentInfos } = useApiDataHelper()

describe('Test LoadCarrierCompartments', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-compartment': {
          take: 'Take',
          put: 'Put',
          scanned: 'Scanned',
        },
      },
    },
  })
  const wrapper = shallowMount(LoadCarrierCompartments, {
    global: {
      plugins: [i18n],
    },
    props: {
      loadCarrier: getSourceLoadCarrier(),
      task: getPickingTask(2),
      pcotsLocation: PcotsLocationEnum.Source,
      showZeroCrossing: false,
      scannedBarcodes: [],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    expect(wrapper.findComponent(LoadCarrierCompartment).exists()).toBeTruthy()
  })

  it('should display the compartment as active for source', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: getPickingTask(2),
      compartmentInfos: getCompartmentInfos(
        getSourceLoadCarrier(),
        getPickingTask(2),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('active')
  })

  it('should display the compartment as active for target', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      loadCarrier: getTargetLoadCarrier(),
      task: getPickingTask(2),
      compartmentInfos: getCompartmentInfos(
        getTargetLoadCarrier(),
        getPickingTask(2),
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('active')
  })

  it('should not display the compartment as active', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      compartmentInfos: getCompartmentInfos(
        getSourceLoadCarrier(),
        undefined,
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('none')
    expect(
      loadCarrierCompartment.classes().includes('compartment-1')
    ).toBeTruthy()
  })

  it('should not display an active compartment as no compartmentState is active in compartmentInfos', async () => {
    const compartmentInfos = getCompartmentInfos(
      getTargetLoadCarrier(),
      getPickingTask(2),
      PcotsLocationEnum.Target,
      undefined,
      undefined,
      undefined,
      undefined
    )
    compartmentInfos[0].state = CompartmentState.selectable
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      loadCarrier: getTargetLoadCarrier(),
      task: getPickingTask(2),
      compartmentInfos,
      showZeroCrossing: false,
    })
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('selectable')
  })

  it('should rotate lc', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(180),
      task: getPickingTask(2),
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.load-carrier-compartments').exists()).toBeTruthy()
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('style')
    expect(loadCarrierCompartment.attributes().style).toBe(
      'grid-column: -1 / -2; grid-row: 1 / 2;'
    )
  })

  it('should set the first compartment to active when not defined in task', async () => {
    const pickingTaskWithoutTargetCompartment = getPickingTask(10)
    pickingTaskWithoutTargetCompartment.targetCompartmentId = ''
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      loadCarrier: getTargetLoadCarrier(),
      task: pickingTaskWithoutTargetCompartment,
      compartmentInfos: getCompartmentInfos(
        getTargetLoadCarrier(),
        pickingTaskWithoutTargetCompartment,
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('active')
  })

  it('should show zero crossing', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: getPickingTask(10),
      showZeroCrossing: true,
      compartmentInfos: getCompartmentInfos(
        getSourceLoadCarrier(),
        getPickingTask(10),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
    })
    await new Promise(process.nextTick)
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('active')
    expect(loadCarrierCompartment.attributes()).toHaveProperty(
      'showzerocrossing'
    )
    expect(loadCarrierCompartment.attributes().showzerocrossing).toBe('true')
  })

  it('should return compartment state none on target if scanning required and first scan not finished', async () => {
    const cycleCountTask = getCycleCountTask('S2T', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
    ])
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      loadCarrier: getTargetLoadCarrier(),
      task: cycleCountTask,
      compartmentInfos: getCompartmentInfos(
        getTargetLoadCarrier(),
        cycleCountTask,
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    const loadCarrierCompartment = wrapper.findComponent(LoadCarrierCompartment)
    expect(loadCarrierCompartment.attributes()).toHaveProperty('state')
    expect(loadCarrierCompartment.attributes().state).toBe('none')
  })

  it('should change activeCompartment when clicking on an compartment', async () => {
    const compartments = [getCompartment(), getCompartment()]
    compartments[1].id = '2'
    compartments[1].items[0].item = getItem2()
    const sourceLoadCarrier = getSourceLoadCarrierWithCompartments(compartments)
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: sourceLoadCarrier,
      task: getPickingTask(2),
      compartmentInfos: getCompartmentInfos(
        sourceLoadCarrier,
        getPickingTask(2),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
    })

    expect((wrapper.vm as any).activeCompartment.id).toBe('1')
    await wrapper.vm.onCompartmentClicked(sourceLoadCarrier.compartments[1])
    expect((wrapper.vm as any).activeCompartment.id).toBe('2')
  })

  it('should return correct amount of counted compartments', async () => {
    const sourceLoadCarrier = getMultiItemLoadCarrier()
    const countedCompartments = {
      '1': ['700001', '700002'],
    }
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: sourceLoadCarrier,
      task: getPickingTask(2),
      compartmentInfos: getCompartmentInfos(
        sourceLoadCarrier,
        getPickingTask(2),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      showZeroCrossing: false,
      countedCompartments,
    })

    expect(wrapper.vm.getCountedCompartmentAmount('1')).toBe(2)
    expect(wrapper.vm.showCompartmentIndicator('1')).toBeTruthy()
  })
})
