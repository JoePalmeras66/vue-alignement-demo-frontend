import { describe, expect, it } from 'vitest'
import {
  getAllLoadCarrierTypes,
  getAllLoadCarrierTypesColRowSpan,
  getAllLoadCarrierTypesWithPaddings,
} from '@/helpers/testDataProvider'
import { useCompartmentStyler } from '@/composables/useCompartmentStyler/useCompartmentStyler'

describe('Test useCompartmentStyler', () => {
  const { getCompartmentStyle } = useCompartmentStyler()
  const loadCarrierTypes = getAllLoadCarrierTypes()
  const loadCarrierTypesWithPaddings = getAllLoadCarrierTypesWithPaddings()
  const colRowSpanLoadCarrierTypes = getAllLoadCarrierTypesColRowSpan()

  const getStyleString = (
    rowStart: number,
    colStart: number,
    rowEnd: number,
    colEnd: number
  ) => {
    return `grid-column: ${colStart} / ${colEnd}; grid-row: ${rowStart} / ${rowEnd};`
  }

  it('should render single compartment with padding values', () => {
    const style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[0],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))
  })

  it('should render two compartments with padding values', () => {
    let style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[1],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[1],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -2, 3))
  })

  it('should render three compartments with padding values', () => {
    let style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[2],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[2],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -2, 3))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[2],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))
  })

  it('should render six compartments with padding values', () => {
    let style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -2, 3))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '4',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 1, -3, 2))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '5',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 2, -3, 3))

    style = getCompartmentStyle(
      loadCarrierTypesWithPaddings[3],
      {
        id: '6',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 3, -3, 4))
  })

  it('should render single compartment with rotation 180', () => {
    const style = getCompartmentStyle(
      loadCarrierTypes[0],
      {
        id: '1',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -1, 2, -2))
  })

  it('should render single compartment without rotation', () => {
    const style = getCompartmentStyle(loadCarrierTypes[0], {
      id: '1',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 1, -2, 2))
  })

  it('should render 3 compartments without rotation', () => {
    let style = getCompartmentStyle(loadCarrierTypes[1], {
      id: '1',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(loadCarrierTypes[1], {
      id: '2',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 2, -2, 3))

    style = getCompartmentStyle(loadCarrierTypes[1], {
      id: '3',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 3, -2, 4))
  })

  it('should render 3 compartments with rotation 180', () => {
    let style = getCompartmentStyle(
      loadCarrierTypes[1],
      {
        id: '1',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -1, 2, -2))

    style = getCompartmentStyle(
      loadCarrierTypes[1],
      {
        id: '2',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -2, 2, -3))

    style = getCompartmentStyle(
      loadCarrierTypes[1],
      {
        id: '3',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -3, 2, -4))
  })

  it('should render 6 compartments without rotation', () => {
    let style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '1',
      items: [],
    })
    expect(style).toBe(getStyleString(-2, 1, -3, 2))

    style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '2',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '3',
      items: [],
    })
    expect(style).toBe(getStyleString(-2, 2, -3, 3))

    style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '4',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 2, -2, 3))

    style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '5',
      items: [],
    })
    expect(style).toBe(getStyleString(-2, 3, -3, 4))

    style = getCompartmentStyle(loadCarrierTypes[2], {
      id: '6',
      items: [],
    })
    expect(style).toBe(getStyleString(-1, 3, -2, 4))
  })

  it('should render 6 compartments with rotation 180', () => {
    let style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '1',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(2, -1, 3, -2))

    style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '2',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -1, 2, -2))

    style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '3',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(2, -2, 3, -3))

    style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '4',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -2, 2, -3))

    style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '5',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(2, -3, 3, -4))

    style = getCompartmentStyle(
      loadCarrierTypes[2],
      {
        id: '6',
        items: [],
      },
      180
    )
    expect(style).toBe(getStyleString(1, -3, 2, -4))
  })

  // Special LoadCarrierTypes with Column and Rowspans
  it('should render 4 compartments with column and rowspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[0],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[0],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 1, -3, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[0],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -2, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[0],
      {
        id: '4',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -3, 4))
  })

  it('should render 3 compartments with 2 columnspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[1],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[1],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 1, -3, 4))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[1],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))
  })

  it('should render 4 compartments with 2 rowspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[2],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -3, 2))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[2],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -3, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[2],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[2],
      {
        id: '4',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 3, -3, 4))
  })
  it('should render 4 compartments with 2 columnspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[3],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[3],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 1, -3, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[3],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[3],
      {
        id: '4',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 3, -3, 4))
  })

  it('should render 3 compartments with column and rowspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[4],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -3, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[4],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[4],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 3, -3, 4))
  })

  it('should render 5 compartments with 1 rowspan layout', () => {
    let style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[5],
      {
        id: '1',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 1, -2, 2))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[5],
      {
        id: '2',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 1, -3, 2))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[5],
      {
        id: '3',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 2, -3, 3))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[5],
      {
        id: '4',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-1, 3, -2, 4))

    style = getCompartmentStyle(
      colRowSpanLoadCarrierTypes[5],
      {
        id: '5',
        items: [],
      },
      0
    )
    expect(style).toBe(getStyleString(-2, 3, -3, 4))
  })
})
