import {
  CompartmentDefinitionType,
  CompartmentType,
  LoadCarrierTypeType,
} from '@/types/Api/pcots/PcotsApiModel'

export const useCompartmentStyler = () => {
  const getCompartmentDefinition = (
    loadCarrierType: LoadCarrierTypeType,
    compartment: CompartmentType
  ) => {
    return loadCarrierType.compartments.find(
      (compartmentDefinition) => compartmentDefinition.id === compartment.id
    )
  }

  const getCompartmentDefinitionInternal = (
    compartmentDefinition: CompartmentDefinitionType | undefined,
    compartment: CompartmentType | undefined,
    loadCarrierType: LoadCarrierTypeType
  ) => {
    let compartmentDefinitionInternal = compartmentDefinition
    // Get compartment definition by compartment if not set as parameter
    if (
      compartmentDefinitionInternal === undefined &&
      compartment !== undefined
    ) {
      compartmentDefinitionInternal = getCompartmentDefinition(
        loadCarrierType,
        compartment
      )
    }
    return compartmentDefinitionInternal
  }

  const getMinCompartmentSize = (
    loadCarrierType: LoadCarrierTypeType,
    direction: 'column' | 'row'
  ): number => {
    if (direction === 'column') {
      return Math.min(
        ...new Set(loadCarrierType.compartments.map((comp) => comp.length))
      )
    } else {
      return Math.min(
        ...new Set(loadCarrierType.compartments.map((comp) => comp.width))
      )
    }
  }

  const getSpanValueByDirection = (
    compartmentDefinition: CompartmentDefinitionType,
    minValue: number,
    direction: 'column' | 'row'
  ): number => {
    const compDefDimensionValue =
      direction === 'column'
        ? compartmentDefinition.length
        : compartmentDefinition.width

    return Math.ceil(compDefDimensionValue / minValue)
  }

  const getGridStartPointByDirection = (
    compartmentDefinition: CompartmentDefinitionType,
    minValue: number,
    direction: 'column' | 'row'
  ): number => {
    const compDefCoordinate =
      direction === 'column' ? compartmentDefinition.x : compartmentDefinition.y

    return Math.floor(compDefCoordinate / minValue)
  }

  const calculateGridRange = (
    loadCarrierType: LoadCarrierTypeType,
    compartmentDefinition: CompartmentDefinitionType,
    direction: 'column' | 'row'
  ): { startGrid: number; endGrid: number } => {
    let startGrid = -1
    let endGrid = -1

    // get minimum compartment size value per direction (Column: min. length, Row: min. width)
    const minCompDimensionValue = getMinCompartmentSize(
      loadCarrierType,
      direction
    )

    // get column or rowspan value
    const spanValue = getSpanValueByDirection(
      compartmentDefinition,
      minCompDimensionValue,
      direction
    )

    startGrid =
      getGridStartPointByDirection(
        compartmentDefinition,
        minCompDimensionValue,
        direction
      ) + 1

    endGrid = startGrid + spanValue

    return {
      startGrid,
      endGrid,
    }
  }

  const getCompartmentStyle = (
    loadCarrierType: LoadCarrierTypeType | undefined,
    compartment: CompartmentType | undefined,
    rotation = 0,
    compartmentDefinition?: CompartmentDefinitionType
  ) => {
    let compartmentStyles = ''
    if (loadCarrierType !== undefined) {
      const compartmentDefinitionInternal = getCompartmentDefinitionInternal(
        compartmentDefinition,
        compartment,
        loadCarrierType
      )

      if (compartmentDefinitionInternal) {
        const loadCarrierTypeInternal: LoadCarrierTypeType = JSON.parse(
          JSON.stringify(loadCarrierType)
        )
        loadCarrierTypeInternal.compartments.sort(
          (comp1, comp2) => comp1.x - comp2.x
        )
        loadCarrierTypeInternal.compartments.sort(
          (comp1, comp2) => comp1.y - comp2.y
        )

        let rowStart: number
        let rowEnd: number
        let colStart: number
        let colEnd: number

        const rowGridRange = calculateGridRange(
          loadCarrierTypeInternal,
          compartmentDefinitionInternal,
          'row'
        )

        const columnGridRange = calculateGridRange(
          loadCarrierTypeInternal,
          compartmentDefinitionInternal,
          'column'
        )

        rowStart = rowGridRange.startGrid * -1
        rowEnd = rowGridRange.endGrid * -1
        colStart = columnGridRange.startGrid
        colEnd = columnGridRange.endGrid

        if (rotation === 180) {
          colStart = colStart * -1
          colEnd = colEnd * -1
          rowStart = rowStart * -1
          rowEnd = rowEnd * -1
        }
        compartmentStyles = `grid-column: ${colStart} / ${colEnd}; grid-row: ${rowStart} / ${rowEnd};`
      }
    }
    return compartmentStyles
  }
  return { getCompartmentStyle }
}
