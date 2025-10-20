import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import TextWithHighlightedParts from '@/components/TextWithHighlightedParts/TextWithHighlightedParts.vue'

describe('Test TextWithHighlightedParts', () => {
  const wrapper = shallowMount(TextWithHighlightedParts, {
    global: {
      plugins: [],
    },
    props: {
      text: 'NormalText [highlighted]HighlightedText[/highlighted]',
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.text-with-highlighted-parts').exists()).toBeTruthy()
    expect(wrapper.find('.text').exists()).toBeTruthy()
    expect(wrapper.find('.text').text()).toBe('NormalText')
    expect(wrapper.find('.text.highlighted').text()).toBe('HighlightedText')
  })
})
