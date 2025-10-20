// noinspection DuplicatedCode
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ItemImage from '@/components/ItemImage/ItemImage.vue'
import { unknownItemUrlLight } from '@/constants/unknownItemUrl'

describe('Test ItemImage', () => {
  const IMAGE_FAIL = 'data:image/png;base64,fail'
  const imageProto = globalThis.Image.prototype
  const oldDescriptor = Object.getOwnPropertyDescriptor(imageProto, 'src')
  beforeAll(() => {
    // eslint-disable-next-line accessor-pairs
    Object.defineProperty(imageProto, 'src', {
      set(src) {
        const evt =
          !src || src === IMAGE_FAIL || src.length < 1 ? 'error' : 'load'
        const event = new Event(evt)
        nextTick(() => this.dispatchEvent(event))
      },
    })
  })
  afterAll(() => {
    Object.defineProperty(imageProto, 'src', oldDescriptor!)
  })

  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'item-image': {
          item_images: 'Item images',
          close: 'Close',
          no_photo_available: 'No photo available',
        },
      },
    },
  })

  const wrapper = mount(ItemImage, {
    global: {
      plugins: [i18n],
    },
    props: { itemImageUrls: ['this/should/be/an/image.png'] },
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.item-image').exists()).toBeTruthy()
    expect(wrapper.find('.item-image-container').exists()).toBeTruthy()
    expect(wrapper.find('.image').exists()).toBeTruthy()
    expect(wrapper.find('.no-image-container').exists()).toBeFalsy()
  })

  it('should not open image gallery when no images available', async () => {
    await wrapper.setProps({ itemImageUrls: [] })
    await new Promise(process.nextTick)
    expect(wrapper.find('.el-dialog__body').exists()).toBeFalsy()
    const itemImageContainer = wrapper.find('.item-image-container')
    await itemImageContainer.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.el-dialog__body').exists()).toBeFalsy()
  })

  it('should open image gallery when images available', async () => {
    await wrapper.setProps({ itemImageUrls: ['this/should/be/an/image.png'] })
    await new Promise(process.nextTick)
    const itemImageContainer = wrapper.find('.item-image-container')
    await itemImageContainer.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.tgw-dialog__body').exists()).toBeTruthy()
    expect(wrapper.find('.item-image-gallery').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-button').exists()).toBeTruthy()
    expect(wrapper.vm.isImageGalleryVisible).toBeTruthy()
  })

  it('should close dialog on cancel', async () => {
    const cancelButton = wrapper.find('.dialog-button')
    await cancelButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.vm.isImageGalleryVisible).toBeFalsy()
  })

  it('should not be allowed to open the image gallery', async () => {
    await wrapper.setProps({
      itemImageUrls: ['this/should/be/an/image.png'],
      allowOpenGallery: false,
    })
    await new Promise(process.nextTick)
    const itemImageContainer = wrapper.find('.item-image-container')
    await itemImageContainer.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.vm.isImageGalleryVisible).toBeFalsy()
  })

  it('should render correctly when no image available', async () => {
    await wrapper.setProps({
      itemImageUrls: [],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.item-image.no-image').exists()).toBeTruthy()
    expect(wrapper.find('.item-image-container').exists()).toBeTruthy()
    expect(wrapper.find('.image').exists()).toBeTruthy()
    expect(wrapper.find('.no-image-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.tgw-icon.no-image-icon.no-item-picture').exists()
    ).toBeTruthy()
    expect(wrapper.find('.no-photo-available').text()).toBe(
      'No photo available'
    )
  })

  it('should render correctly when image could not be loaded', async () => {
    await wrapper.setProps({
      itemImageUrls: [IMAGE_FAIL],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.item-image.no-image').exists()).toBeTruthy()
    expect(wrapper.find('.item-image-container').exists()).toBeTruthy()
    expect(wrapper.find('.image').exists()).toBeTruthy()
    expect(wrapper.find('.no-image-container').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-icon.no-image-icon.image').exists()).toBeTruthy()

    await wrapper.setProps({
      itemImageUrls: undefined,
      allowOpenGallery: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.tgw-icon.no-image-icon.image').exists()).toBeTruthy()
  })

  it('should render unknown item correctly', async () => {
    await wrapper.setProps({
      itemImageUrls: [unknownItemUrlLight],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.item-image.unknown-item').exists()).toBeTruthy()
  })
})
