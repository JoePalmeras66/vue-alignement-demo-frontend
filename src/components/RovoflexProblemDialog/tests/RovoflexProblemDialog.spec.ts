import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import RovoflexProblemDialog from '@/components/RovoflexProblemDialog/RovoflexProblemDialog.vue'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import UndoSplitPickMessageBox from '@/components/UndoSplitPickMessageBox/UndoSplitPickMessageBox.vue'

setActivePinia(createPinia())

describe('Test RovoflexProblemDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'rovoflex-problem-dialog': {
          ok: 'Ok',
          press_ok_and_finish_pick:
            'Please press [highlighted]OK[/highlighted] and finish the pick manually.',
          n_problems_occurred: '{n} Problems occurred',
          complete_pick_manually: 'Complete pick manually',
          handle_possible_problems:
            'Please handle possible problems before moving the robot to the home position.',
        },
        'rovoflex-errors': {
          ItemLost_title: 'Item lost',
          ItemLost_description: 'An item got lost during the dropping process.',
          SourceOverheight_title: 'Source overheight',
          SourceOverheight_description:
            'An overheight was detected at the source LC after finalizing the order.',
          TargetFull_title: 'Target full',
          TargetFull_description:
            'The item can not be placed into the target LC because it would lead to overheight.',
          UnknownMovementError_title: 'Unknown movement error',
          UnknownMovementError_description:
            "The robot's movement was stopped unexpectedly, e.g. because the gripper crashed into an object.",
        },
      },
    },
  })
  const wrapper = mount(RovoflexProblemDialog, {
    global: {
      plugins: [i18n],
      stubs: {
        transition: false,
      },
    },
    props: {
      errors: ['ItemLost'],
      appendToBody: false,
    },
  })

  const taskStore = useTaskStore()
  taskStore.setTask(undefined)

  let submitted: boolean | undefined = false
  it('should render one error correctly', async () => {
    setTimeout(async () => {
      submitted = await (
        wrapper.vm as InstanceType<typeof UndoSplitPickMessageBox>
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(wrapper.find('.rovoflex-problem-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Complete pick manually'
    )
    expect(
      wrapper.find('.rovoflex-problem-dialog__error-description').text()
    ).toBe('An item got lost during the dropping process.')
    expect(
      wrapper.find('.rovoflex-problem-dialog__error-hint').exists()
    ).toBeTruthy()
    expect(wrapper.findAll('.tgw-button').length).toBe(1)
  })

  it('should render multiple errors correctly', async () => {
    await wrapper.setProps({
      errors: ['ItemLost', 'SourceOverheight', 'TargetFull'],
    })
    expect(wrapper.find('.rovoflex-problem-dialog').exists()).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-problem-dialog').classes().includes('align-left')
    ).toBeTruthy()

    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Complete pick manually'
    )
    expect(
      wrapper.find('.problem-collapse-item__header-text').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-problem-dialog__error-list').exists()
    ).toBeTruthy()
    expect(
      wrapper.findAll('.rovoflex-problem-dialog__error-list-item').length
    ).toBe(3)

    const allTitles = wrapper.findAll('.rovoflex-problem-dialog__error-title')
    expect(allTitles.length).toBe(3)
    expect(allTitles[0].text()).toBe('Item lost')
    expect(allTitles[1].text()).toBe('Source overheight')
    expect(allTitles[2].text()).toBe('Target full')

    const allDescriptions = wrapper.findAll(
      '.rovoflex-problem-dialog__error-description'
    )
    expect(allDescriptions.length).toBe(3)
    expect(allDescriptions[0].text()).toBe(
      'An item got lost during the dropping process.'
    )
    expect(allDescriptions[1].text()).toBe(
      'An overheight was detected at the source LC after finalizing the order.'
    )
    expect(allDescriptions[2].text()).toBe(
      'The item can not be placed into the target LC because it would lead to overheight.'
    )
    expect(
      wrapper.find('.rovoflex-problem-dialog__error-hint').exists()
    ).toBeTruthy()
    expect(wrapper.findAll('.tgw-button').length).toBe(1)
  })

  it('should emit on OK button click', async () => {
    expect(wrapper.emitted('onSubmit')).toBe(undefined)
    await wrapper.find('.tgw-button').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeTruthy()
  })

  it('should change title for UnknownMovementError without task', async () => {
    await wrapper.setProps({
      errors: ['UnknownMovementError'],
    })
    setTimeout(async () => {
      submitted = await (
        wrapper.vm as InstanceType<typeof UndoSplitPickMessageBox>
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Please handle possible problems before moving the robot to the home position.'
    )
  })
})
