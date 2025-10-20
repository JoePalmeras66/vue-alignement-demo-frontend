import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import LoadCarrier from '@/components/LoadCarrier/LoadCarrier.vue'
import LoadCarrierHeader from '@/components/LoadCarrierHeader/LoadCarrierHeader.vue'
import { BarcodeDataType } from '@/types/Api/pcots/PcotsApiModel'
import { Position } from '@/types/Position'
import {
  addCriticalProblem,
  getAllLoadCarrierTypes,
  getCompartment,
  getNoReadLoadCarrier,
  getPickingTask,
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import LoadCarrierNoRead from '@/components/LoadCarrierNoRead/LoadCarrierNoRead.vue'
import { LoadCarrierAction } from '@/types/LoadCarrierAction'
import {
  PcotsLocationEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'

const { getCompartmentInfos } = useApiDataHelper()
setActivePinia(createPinia())

describe('Test LoadCarrier', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier': {
          no_transports: 'No open transports',
          waiting_for_load_carrier: 'Waiting for load carrier',
          reject: 'Reject',
          view_details: 'View details',
          source: 'source',
          target: 'target',
          send_away_title: 'Send away load carrier',
          send_away_description_1: 'Are you sure you want to send away',
          send_away_description_2: 'load carrier',
          send_away_description_3: 'already?',
          cancel: 'Cancel',
          send_away: 'Send away',
          drive_through: 'Load carrier drive through',
          no_read: 'NOREAD',
        },
        'load-carrier-header': {
          source: 'Source',
          target: 'Target',
          no_read_header: 'NOREAD',
        },
        'message-box': {
          show_again: 'Diesen Dialog nicht mehr anzeigen',
        },
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
  const wrapper = mount(LoadCarrier, {
    global: {
      plugins: [i18n],
      stubs: {
        LoadCarrierCompartment: true,
        LoadCarrierHeader: true,
        TgwIcon: true,
        LottieAnimation: true,
        LoadCarrierNoRead: true,
        IconButton: true,
      },
    },
    props: {
      pcotsLocation: PcotsLocationEnum.Source,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      headerData: '0815',
      showZeroCrossing: false,
      task: undefined,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      workstationMode: WorkStationModeEnum.None,
      countedCompartments: {} as CountedCompartmentsType,
      showViewContent: true,
      showDummyLoadCarrier: false,
      appendDialogToBody: false,
    },
  })

  const rovoflexStore = useRovoflexStore()
  rovoflexStore.hasConfirmedError = false

  it('should render correctly', () => {
    expect(wrapper.find('.send-away-load-carrier-dialog').exists()).toBeFalsy()
    expect(wrapper.find('.load-carrier').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content-info').exists()).toBeTruthy()
    expect(wrapper.findComponent(LoadCarrierNoRead).exists()).toBeFalsy()
    const loadCarrierHeader = wrapper.findComponent(LoadCarrierHeader)
    expect(loadCarrierHeader.exists()).toBeTruthy()
    expect(loadCarrierHeader.attributes()).toHaveProperty('headerdata')
    expect(loadCarrierHeader.attributes().headerdata).toBe('0815')
    expect(wrapper.find('.footer').exists()).toBeFalsy()
  })

  it('should render correctly when showZeroCrossing', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      headerData: '0815',
      showZeroCrossing: true,
      task: undefined,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      workstationMode: WorkStationModeEnum.None,
      countedCompartments: {} as CountedCompartmentsType,
      showViewContent: true,
      showDummyLoadCarrier: false,
    })
    expect(wrapper.find('.load-carrier').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('load-carrier-header-stub').exists()).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content-info').exists()).toBeTruthy()
    expect(wrapper.find('.view-content-button').exists()).toBeFalsy()
    expect(wrapper.find('.footer').exists()).toBeFalsy()
  })

  it('should show load carrier on the way', async () => {
    const contentText = wrapper.find('.content-text')
    expect(contentText.text()).toBe('Waiting for load carrier')
    const content = wrapper.find('.content')
    expect(content.classes()).toContain('dashed-border')
    expect(content.classes().includes('warning')).toBeFalsy()
    expect(wrapper.find('.lottie-player').exists()).toBeTruthy()
    expect(wrapper.find('.footer').exists()).toBeFalsy()
  })

  it('should render noRead correctly', async () => {
    const noReadLoadCarrier = getNoReadLoadCarrier()
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: noReadLoadCarrier,
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: true,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    expect(wrapper.find('.content-text').exists()).toBeFalsy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.lottie-player').exists()).toBeFalsy()
    expect(wrapper.find('load-carrier-no-read-stub').exists()).toBeTruthy()
    expect(wrapper.find('.footer').exists()).toBeTruthy()
    expect(wrapper.find('.footer .load-carrier-number').text()).toBe('#NOREAD')
  })

  it('should show load carrier arrived', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: true,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    const content = wrapper.find('.content')
    expect(content.classes()).toContain('load-carrier-arrived')
    expect(wrapper.find('.footer').exists()).toBeTruthy()
    expect(wrapper.find('.footer .view-content-button').exists()).toBeFalsy()
    expect(
      wrapper.find('.footer .load-carrier-number.bottom').exists()
    ).toBeTruthy()
  })

  it('should emit active compartment', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: getPickingTask(10),
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
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
    expect(wrapper.emitted()).toHaveProperty('activeCompartmentChanged')
    expect(wrapper.emitted().activeCompartmentChanged.length).toBe(1)
    expect(wrapper.emitted('activeCompartmentChanged')).toEqual([
      [getCompartment()],
    ])
    expect(wrapper.find('.footer').exists()).toBeTruthy()
    expect(wrapper.find('.footer .view-content-button').exists()).toBeTruthy()
    expect(wrapper.find('.footer .load-carrier-number').exists()).toBeTruthy()
  })

  it('should render robot paused correctly - Source', async () => {
    const loadCarrier = getSourceLoadCarrier()
    const task = getPickingTask(4)
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier,
      task,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Consolidation,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      compartmentInfos: getCompartmentInfos(
        loadCarrier,
        task,
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      ),
    })
    rovoflexStore.hasConfirmedError = true
    await new Promise(process.nextTick)
    expect(
      wrapper.find('.load-carrier-occupation-indicator').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-occupation-indicator tgw-icon-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.load-carrier-occupation-indicator .circle-indicator-text')
        .exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.load-carrier-occupation-indicator .circle-indicator-text')
        .text()
    ).toBe('6')
  })

  it('should render robot paused correctly - Target', async () => {
    const loadCarrier = getTargetLoadCarrier()
    const task = getPickingTask(4)
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      loadCarrier,
      task,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Consolidation,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      compartmentInfos: getCompartmentInfos(
        loadCarrier,
        task,
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      ),
    })
    rovoflexStore.hasConfirmedError = true
    await new Promise(process.nextTick)
    expect(
      wrapper.find('.load-carrier-occupation-indicator').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-occupation-indicator tgw-icon-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.load-carrier-occupation-indicator .circle-indicator-text')
        .exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.load-carrier-occupation-indicator .circle-indicator-text')
        .text()
    ).toBe('14')
  })

  it('should show send to reject indicator', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Consolidation,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      sendToReject: true,
    })
    expect(wrapper.find('.send-to-reject-information').exists()).toBeTruthy()
    expect(
      wrapper.find('.send-to-reject-information tgw-icon-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.send-to-reject-information .circle-indicator-text')
        .exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.send-to-reject-information .circle-indicator-text').text()
    ).toBe('Reject')
  })

  it('should emit view content', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Consolidation,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    expect(wrapper.find('.view-content-button').exists()).toBeTruthy()
    await wrapper.find('.view-content-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('viewContentClicked')
  })

  it('should not render view content', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: true,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    expect(wrapper.find('.view-content-button').exists()).toBeFalsy()
  })

  it('should render modification menu', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: true,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      showModificationMenu: true,
    })
    expect(wrapper.find('.modification-menu-container').exists()).toBeTruthy()
  })

  it('should render send away message box correctly', async () => {
    expect(wrapper.find('.send-away-load-carrier-dialog').exists()).toBeFalsy()
    const sendAwayButton = wrapper.findAll('.modification-button')[0]
    await sendAwayButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.send-away-load-carrier-dialog').exists()).toBeTruthy()
    const description = wrapper.find('.send-away-description')
    expect(description.exists()).toBeTruthy()
    expect(description.text()).toBe(
      'Are you sure you want to send away source load carrier #4711 already?'
    )
    expect(wrapper.find('.dialog-footer').exists()).toBeTruthy()
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
  })

  it('should close dialog on cancel button', async () => {
    expect(wrapper.find('.send-away-load-carrier-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    const cancelButton = wrapper.findAll('.dialog-button')[0]
    await cancelButton.trigger('click')
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeFalsy()
  })

  it('should emit on send away click and close dialog', async () => {
    await wrapper.findAll('.modification-button')[0].trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.send-away-load-carrier-dialog').exists()).toBeTruthy()

    expect(wrapper.emitted()).not.toHaveProperty('sendAway')
    const sendAwayButton = wrapper.findAll('.dialog-button')[1]
    await sendAwayButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted('loadCarrierAction')).toEqual([
      [
        {
          loadCarrierAction: LoadCarrierAction.send_away,
        },
      ],
    ])
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeFalsy()
  })

  it('should open dialog on click', async () => {
    expect(wrapper.find('.convert-load-carrier-dialog').exists()).toBeFalsy()
    const convertLoadCarrierButton = wrapper.findAll('.modification-button')[1]
    await convertLoadCarrierButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.convert-load-carrier-dialog').exists()).toBeTruthy()
  })

  it('should not render modification menu', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: true,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      isDriveThrough: true,
      showModificationMenu: false,
    })
    expect(wrapper.find('.modification-menu-container').exists()).toBeFalsy()
  })

  it('should render drive through', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: undefined,
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: false,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      isDriveThrough: true,
    })
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content').classes()).toContain('drive-through')
    expect(wrapper.findAll('lottie-animation-stub').length).toBe(1)
    expect(wrapper.find('lottie-animation-stub').attributes()).toHaveProperty(
      'animation-link'
    )
    expect(
      wrapper.find('lottie-animation-stub').attributes()['animation-link']
    ).toBe('src/assets/animations/lottie/waiting_LC_animation_orange.json')
  })

  it('should render dummy load carrier', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: false,
      showDummyLoadCarrier: true,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    expect(wrapper.find('.load-carrier').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-header-placeholder').exists()
    ).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content').classes()).toContain('dummy-load-carrier')
    expect(wrapper.find('.dummy-load-carrier-container').exists()).toBeTruthy()
    expect(wrapper.findAll('lottie-animation-stub').length).toBe(0)
  })

  it('should disable view content in rovoflex picking', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
      isRovoflexPicking: true,
    })
    expect(wrapper.find('.view-content-button').exists()).toBeTruthy()
    expect(
      wrapper.find('.view-content-button').attributes().disabled
    ).toBeTruthy()
  })

  it('should disable view content when problem with abort is selected', async () => {
    addCriticalProblem()
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      task: undefined,
      position: Position.left,
      scannedBarcodes: [] as BarcodeDataType[],
      showZeroCrossing: false,
      showViewContent: true,
      showDummyLoadCarrier: false,
      workstationMode: WorkStationModeEnum.Picking,
      loadCarrierTypes: getAllLoadCarrierTypes(),
      countedCompartments: {},
    })
    expect(wrapper.find('.view-content-button').exists()).toBeTruthy()
    expect(
      wrapper.find('.view-content-button').attributes().disabled
    ).toBeTruthy()
  })
})
