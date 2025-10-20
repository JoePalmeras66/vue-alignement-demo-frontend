import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import ItemImageGallery from '@/components/ItemImageGallery/ItemImageGallery.vue'

describe('Test ItemImageGallery', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'item-image': {
          no_image: 'No image',
          item_images: 'Item images',
          cancel: 'Cancel',
        },
      },
    },
  })

  let wrapper: VueWrapper<any>
  const mountWrapper = (props: any) => {
    if (wrapper !== undefined) {
      wrapper.unmount()
    }
    wrapper = shallowMount(ItemImageGallery, {
      global: {
        plugins: [i18n],
      },
      props,
    })
  }
  mountWrapper({
    itemImageUrls: [
      'this/should/be/an/image1.png',
      'this/should/be/an/image2.png',
    ],
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.item-image-gallery').exists()).toBeTruthy()
    expect(wrapper.find('.image-container').exists()).toBeTruthy()
    expect(wrapper.find('.selected-item-image').exists()).toBeTruthy()
    expect(wrapper.find('.image-gallery-container').exists()).toBeTruthy()
    expect(wrapper.findAll('.image-gallery-item').length).toBe(2)
  })

  it('should select the first image', async () => {
    const selectedImage = wrapper.find('.selected-item-image')
    expect(selectedImage.attributes().src).toBe('this/should/be/an/image1.png')
  })

  it('should change the selected image on click', async () => {
    const secondImage = wrapper.findAll('.image-gallery-item')[1]
    await secondImage.trigger('click')
    await new Promise(process.nextTick)
    const selectedImage = wrapper.find('.selected-item-image')
    expect(selectedImage.attributes().src).toBe('this/should/be/an/image2.png')
  })
})
