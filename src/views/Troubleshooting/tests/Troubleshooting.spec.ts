import { describe, expect, it, vi } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import Troubleshooting from '@/views/Troubleshooting/Troubleshooting.vue'
import {
  PcotsLocationEnum,
  ProblemCategoryEnum,
  ProblemTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import {
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { useApiMock } from '@/helpers/useApiMock'

const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: mockRouterBack }),
}))

const { mockGetSupportedProblemsApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  getSupportedProblemsApi: () => mockGetSupportedProblemsApi(),
}))

setActivePinia(createPinia())

describe('Test Troubleshooting', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        troubleshooting: {
          loadcarrier: 'Load Carrier',
          item: 'Item',
          order: 'Order',
          no_problem_available: 'No problem options available',
          'no_problem_available-description':
            'Get in touch with the administrator if you are missing something',
          header: {
            report_problem: 'Report problem',
            sub_heading: 'Please select one or more problems',
          },
          footer: {
            save: 'Save',
            n_problems: '{n} Problem selected | {n} Problems selected',
          },
          tabs: {
            n_problems_selected:
              'No problem selected | 1 problem selected | {n} problems selected',
            source: 'Source',
            task: 'Others',
            target: 'Target',
            problem_name: {
              DirtyLoadCarrier: 'Dirty load carrier',
              DamagedLoadCarrier: 'Damaged load carrier',
              DirtyItem: 'Dirty item',
              DamagedItem: 'Damaged item',
              WrongItem: 'Wrong item',
              MissingQuantity: 'Wrong amount',
              ItemToLarge: 'Wrong size',
              WrongDimensionData: 'Wrong dimensions',
              ItemBarcodeNotReadable: 'Item barcode not readable',
              OtherItemDamaged: 'Other item damaged',
              SectionMismatch: 'Compartment mismatch',
              TargetFull: 'Target full',
            },
          },
        },
        'leave-page-dialog': {
          title: 'Go back without saving?',
          description:
            'You have unsaved changes.[new_line]If you go back, these changes will not be applied.',
          cancel: 'Cancel',
          go_back: 'Go back',
        },
      },
    },
  })
  let wrapper: VueWrapper

  const mountView = () => {
    wrapper = mount(Troubleshooting, {
      global: {
        plugins: [i18n],
        stubs: {
          transition: false, // needs stub because transition will be mocked by default
        },
      },
    })
  }

  mountView()

  const troubleshootingStore = useTroubleshootingStore()
  const loadCarrierStore = useLoadCarrierStore()
  loadCarrierStore.setLoadCarrier(
    PcotsLocationEnum.Source,
    getSourceLoadCarrier()
  )
  loadCarrierStore.setLoadCarrier(
    PcotsLocationEnum.Target,
    getTargetLoadCarrier()
  )

  const getProblemButton = (pageIndex: number, buttonIndex: number) => {
    const pageContent = wrapper.findAll('.troubleshooting-content')[pageIndex]
    return pageContent.findAll('.problem-classification-button')[buttonIndex]
  }

  const expectButton = (
    pageIndex: number,
    buttonIndex: number,
    expectedButtonText: string,
    expectIsChecked: boolean
  ) => {
    const button = getProblemButton(pageIndex, buttonIndex)
    expect(button.find('.el-checkbox')).toBeTruthy()
    expect(button.find('.problem-classification-icon')).toBeTruthy()
    expect(button.find('.problem-classification-text').text()).toBe(
      expectedButtonText
    )
    if (expectIsChecked) {
      expect(button.classes()).includes('active')
    } else {
      expect(button.classes()).not.includes('active')
    }
  }

  it('should render correctly', () => {
    // Heading
    expect(wrapper.find('.troubleshooting-header .heading').text()).toBe(
      'Report problem'
    )
    expect(wrapper.find('.troubleshooting-header .sub-heading').text()).toBe(
      'Please select one or more problems'
    )

    // Tab heading
    expect(wrapper.findAll('.tabs-label-header')[0].text()).toBe('Source #4711')
    expect(wrapper.findAll('.tabs-label-info')[0].text()).toBe(
      'No problem selected'
    )
    expect(wrapper.findAll('.tabs-label-header')[1].text()).toBe('Others')
    expect(wrapper.findAll('.tabs-label-info')[1].text()).toBe(
      'No problem selected'
    )
    expect(wrapper.findAll('.tabs-label-header')[2].text()).toBe('Target #4712')
    expect(wrapper.findAll('.tabs-label-info')[2].text()).toBe(
      'No problem selected'
    )

    // Tab content source
    expect(
      wrapper
        .findAll('.troubleshooting-content .problem-section-title')[0]
        .text()
    ).toBe('Load Carrier')
    expectButton(0, 0, 'Dirty load carrier', false)

    // Tab content item
    expect(
      wrapper
        .findAll('.troubleshooting-content .problem-section-title')[1]
        .text()
    ).toBe('Item')
    expectButton(1, 0, 'Dirty item', false)

    // Tab content target
    expect(
      wrapper
        .findAll('.troubleshooting-content .problem-section-title')[2]
        .text()
    ).toBe('Load Carrier')
    expectButton(2, 0, 'Dirty load carrier', false)

    // Footer
    expect(
      wrapper.find('.troubleshooting-footer .content-left .back-button')
    ).toBeTruthy()
    expect(
      wrapper.find('.troubleshooting-footer .content-mid .save-button').text()
    ).toBe('Save')
  })

  it('should select and deselect source problem', async () => {
    expectButton(0, 0, 'Dirty load carrier', false)

    await getProblemButton(0, 0).trigger('click')

    expect(wrapper.findAll('.tabs-label-info')[0].text()).toBe(
      '1 problem selected'
    )
    expectButton(0, 0, 'Dirty load carrier', true)
    expect(
      troubleshootingStore.containsProblem({
        problemType: ProblemTypeEnum.DirtyLoadCarrier,
        problemCategory: ProblemCategoryEnum.Source,
      })
    ).toBeTruthy()
    expect(troubleshootingStore.removedProblems.length).toBe(0)

    await getProblemButton(0, 0).trigger('click')

    expect(wrapper.findAll('.tabs-label-info')[0].text()).toBe(
      'No problem selected'
    )
    expectButton(0, 0, 'Dirty load carrier', false)
    expect(
      troubleshootingStore.containsProblem({
        problemType: ProblemTypeEnum.DirtyLoadCarrier,
        problemCategory: ProblemCategoryEnum.Source,
      })
    ).toBeFalsy()
    expect(troubleshootingStore.removedProblems.length).toBe(1)
  })

  it('should trigger back', async () => {
    expect(mockRouterBack).not.toHaveBeenCalled
    await wrapper.find('.back-button').trigger('click')
    expect(mockRouterBack).toHaveBeenCalledOnce
  })

  it('should render fallback image and text if no problems are available', () => {
    const returnValue = mockGetSupportedProblemsApi()
    returnValue.data.problems[1].category = ProblemCategoryEnum.Source
    mockGetSupportedProblemsApi.mockReturnValueOnce(returnValue)
    mountView()

    expect(wrapper.find('#pane-Task').exists()).toBeTruthy()
    expect(wrapper.find('#pane-Task .fallback-container').exists()).toBeTruthy()
    expect(wrapper.find('#pane-Task .no-problems-bg').exists()).toBeTruthy()
    expect(wrapper.find('#pane-Task .no-problems-text').exists()).toBeTruthy()
    expect(
      wrapper.find('#pane-Task .no-problems-text-sub').exists()
    ).toBeTruthy()
  })
})
