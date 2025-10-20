import { afterEach, describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { VueWrapper, mount } from '@vue/test-utils'
import QuantityInput from '@/components/QuantityInput/QuantityInput.vue'

setActivePinia(createPinia())

describe('Test QuantityInput', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        quantity_input: {
          clear: 'C',
          enter_a_number: 'Please enter a number.',
          validation_error_min: 'Number can not be lower than {min}.',
          validation_error_max: 'Number can not be bigger than {max}.',
        },
      },
    },
  })

  let wrapper: VueWrapper<InstanceType<typeof QuantityInput>>

  const mountView = async () => {
    wrapper = mount(QuantityInput, {
      global: {
        plugins: [i18n],
        stubs: {
          transition: false,
        },
      },
      props: {
        isVisible: true,
        title: 'my title',
        subtitle: 'my subtitle',
        quantity: 5,
        min: 0,
        max: 5,
      },
    })
    await new Promise(process.nextTick)
  }

  afterEach(() => {
    if (!wrapper) {
      return
    }
    wrapper.unmount()
  })

  it('should render correctly', async () => {
    await mountView()
    expect(wrapper.find('QuantityInput')).toBeTruthy()
    expect(wrapper.find('.quantity-input-title').text()).toBe('my title')
    expect(wrapper.find('.quantity-input-subtitle').text()).toBe('my subtitle')
    expect(wrapper.find('.quantity-input-element')).toBeTruthy()
    const input = wrapper.find('.quantity-input-element input')
    expect((input.element as HTMLInputElement).value).toBe('5')
    expect(wrapper.find('.error-message').text()).toBe('')
    expect(wrapper.find('.quantity-input-buttons')).toBeTruthy()
    expect(wrapper.findAll('.quantity-input-button').length).toBe(11)
    expect(wrapper.find('.button-zero')).toBeTruthy()
    expect(wrapper.find('.button-clear')).toBeTruthy()
    expect(wrapper.find('.close-button')).toBeTruthy()
    expect(wrapper.find('.submit-button')).toBeTruthy()
  })

  it('should not allow values larger than max', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('6')
    expect((input.element as HTMLInputElement).value).toBe('6')
    const confirmButton = wrapper.find('.submit-button')
    await confirmButton.trigger('click')
    expect(wrapper.find('.error-message').text()).toBe(
      'Number can not be bigger than 5.'
    )
  })

  it('should not allow values smaller than min', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('-1')
    expect((input.element as HTMLInputElement).value).toBe('-1')
    const confirmButton = wrapper.find('.submit-button')
    await confirmButton.trigger('click')
    expect(wrapper.find('.error-message').text()).toBe(
      'Number can not be lower than 0.'
    )
  })

  it('should not allow letters or blanks in the input', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('-1two3')
    expect((input.element as HTMLInputElement).value).toBe('-1two3')
    const confirmButton = wrapper.find('.submit-button')
    await confirmButton.trigger('click')
    expect(wrapper.find('.error-message').text()).toBe('Please enter a number.')
    await input.setValue('1 1')
    expect((input.element as HTMLInputElement).value).toBe('1 1')
    await confirmButton.trigger('click')
    expect(wrapper.find('.error-message').text()).toBe('Please enter a number.')
    await input.setValue(' ')
    expect((input.element as HTMLInputElement).value).toBe(' ')
    await confirmButton.trigger('click')
    expect(wrapper.find('.error-message').text()).toBe('Please enter a number.')
  })

  it('clear button sets value to 0', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('123')
    expect((input.element as HTMLInputElement).value).toBe('123')
    const clearButton = wrapper.find('.button-clear')
    await clearButton.trigger('click')
    expect((input.element as HTMLInputElement).value).toBe('0')
  })

  it('limits maxlength to 8', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('0')
    expect((input.element as HTMLInputElement).value).toBe('0')
    const numbers = wrapper.findAll('.quantity-input-button')
    for (let i = 0; i < 10; i++) {
      await numbers[i].trigger('click')
    }
    expect((input.element as HTMLInputElement).value.length).toBe(8)
  })

  it('number buttons add the value to the input field', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('0')
    expect((input.element as HTMLInputElement).value).toBe('0')
    const numbers = wrapper.findAll('.quantity-input-button')
    for (let i = 0; i < 5; i++) {
      await numbers[i].trigger('click')
    }
    expect((input.element as HTMLInputElement).value).toBe('12345')
    await input.setValue('0')
    expect((input.element as HTMLInputElement).value).toBe('0')
    for (let i = 5; i < 10; i++) {
      await numbers[i].trigger('click')
    }
    expect((input.element as HTMLInputElement).value).toBe('67890')
  })

  it('closes dialog on cancel button', async () => {
    await mountView()
    const closeButton = wrapper.find('.close-button')
    expect(wrapper.emitted('update:isVisible')).toBe(undefined)
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:isVisible')![0]).toEqual([false])
  })

  it('closes dialog when submit button press was successful', async () => {
    await mountView()
    const input = wrapper.find('.quantity-input-element input')
    await input.setValue('2')
    expect((input.element as HTMLInputElement).value).toBe('2')
    const submitButton = wrapper.find('.submit-button')
    await submitButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted('quantityChanged')![0]).toEqual([2])
  })
})
