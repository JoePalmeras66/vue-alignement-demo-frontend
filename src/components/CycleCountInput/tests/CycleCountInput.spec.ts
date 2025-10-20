import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import CycleCountInput from '@/components/CycleCountInput/CycleCountInput.vue'

describe('Test CycleCountInput', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'cycle-count-input': {
          quantity_input_title: 'Please enter the counted quantit',
          enter_count: 'Enter count',
        },
        'delete-count-message-box': {
          delete_count_title: 'Delete count',
          delete_count_description:
            'This action will delete the selected count. To count the items again you can do it from the main view as a normal new count.',
          delete: 'Delete',
          cancel: 'Cancel',
        },
      },
    },
  })
  const wrapper = mount(CycleCountInput, {
    global: {
      plugins: [i18n],
    },
    props: {
      modelValue: 123,
    },
  })
  it('should render correctly', () => {
    expect(wrapper.find('.cycle-count-input')).toBeTruthy()
    expect(wrapper.findAll('.cycle-count-input__button').length).toBe(2)
    expect(wrapper.find('.reduce-button')).toBeTruthy()
    expect(wrapper.find('.input-field')).toBeTruthy()
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('123')
    expect(wrapper.find('.increase-button')).toBeTruthy()
  })

  it('should open quantity input', async () => {
    expect(wrapper.find('.quantity-input-dialog').exists()).toBeFalsy()
    const openInputDialog = wrapper.find('.input-field')
    await openInputDialog.trigger('click')
    expect(wrapper.find('.quantity-input-dialog').exists()).toBeTruthy()
  })

  it('should change input text', async () => {
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('123')
    await wrapper.setProps({
      modelValue: 111,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('111')
  })

  it('should change on increase button', async () => {
    await wrapper.setProps({
      modelValue: 111,
    })
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('111')
    expect(wrapper.emitted()).not.toHaveProperty('update:modelValue')
    const increaseButton = wrapper.find('.increase-button')
    await increaseButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(1)
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([112])
  })

  it('should change on reduce button', async () => {
    await wrapper.setProps({
      modelValue: 111,
    })
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('111')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(1)
    const reduceButton = wrapper.find('.reduce-button')
    await reduceButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(2)
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted('update:modelValue')![1]).toEqual([110])
  })

  it('should not change to negative number on reduce button', async () => {
    await wrapper.setProps({
      modelValue: 0,
    })
    expect(wrapper.find('.input-field .input-field__text').text()).toBe('0')
    expect(wrapper.find('.reduce-button').classes()).toContain('is-disabled')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(2)
    const reduceButton = wrapper.find('.reduce-button')
    await reduceButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(2)
  })

  it('should disable everything', async () => {
    await wrapper.setProps({
      modelValue: 0,
      disabled: true,
    })
    expect(wrapper.find('.cycle-count-input')).toBeTruthy()
    expect(wrapper.findAll('.cycle-count-input__button').length).toBe(2)
    expect(wrapper.find('.reduce-button').classes()).toContain('is-disabled')
    expect(wrapper.find('.input-field').classes()).toContain('is-disabled')
    expect(wrapper.find('.increase-button').classes()).toContain('is-disabled')
  })

  it('should not be modifiable', async () => {
    await wrapper.setProps({
      modelValue: 0,
      disabled: false,
      modifiable: false,
    })
    expect(wrapper.find('.reduce-button').classes()).toContain('is-disabled')
    expect(wrapper.find('.input-field').classes()).toContain(
      'is-not-modifiable'
    )
    expect(wrapper.find('.increase-button').classes()).toContain('is-disabled')
  })

  it('should render placeholder', async () => {
    await wrapper.setProps({
      modelValue: 0,
    })
    expect(wrapper.find('.input-field__text').text()).toBe('0')
  })
})
