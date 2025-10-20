<script setup lang="ts">
import {
  CompartmentType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CycleCountState } from '@/types/CycleCountState'
import { useTranslations } from '@/composables/useTranslations'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

const props = defineProps<Props>()
const { isCompartmentEmpty, getStockFromCompartment, getItemNumberDisplay } =
  useApiDataHelper()
interface Props {
  task?: TaskType
  loadCarrier?: LoadCarrierType
  selectedCompartment: CompartmentType | undefined
}

const { selectedCompartment } = toRefs(props)
const itemDetails = ref<{ name: string; value: string }[]>([])
const { getTranslatedText } = useTextTranslator()
const { getTranslation } = useTranslations('load-carrier-item-details')

const hasItems = computed(() => {
  // noinspection RedundantIfStatementJS
  if (
    selectedCompartment.value &&
    !isCompartmentEmpty(selectedCompartment.value)
  ) {
    return true
  }
  return false
})

const stock = computed(() => {
  if (selectedCompartment.value?.items) {
    return getStockFromCompartment(selectedCompartment.value, props.task)
  }
})
const item = computed(() => {
  return stock.value?.item
})

const headerText = computed(() => {
  return getTranslation('header_text')
})

const itemDescriptionName = computed(() => {
  return getTranslation('item_description')
})

const itemDescriptionValue = computed(() => {
  // We have no description yet
  return ''
})

const itemImageUrls = computed(() => {
  if (item.value?.images && item.value?.images.length > 0) {
    return item.value?.images?.map((images) => images.url)
  }
})

const noItemsImage = computed(() => {
  if (isDark.value) {
    return `src/assets/images/item-details/Empty-LC-Dark.svg`
  } else {
    return `src/assets/images/item-details/Empty-LC-Light.svg`
  }
})

const noItemsBackground = computed(() => {
  if (isDark.value) {
    return `src/assets/fallback_bg_decoration-dark.svg`
  } else {
    return `src/assets/fallback_bg_decoration-light.svg`
  }
})

const noItemsText = computed(() => {
  if (
    props.loadCarrier?.compartments &&
    props.loadCarrier?.compartments.length > 1
  ) {
    return getTranslation('no_items_compartment')
  } else {
    return getTranslation('no_items_loadcarrier')
  }
})

const addItemDetail = (name: string, value: string | undefined | null) => {
  if (value) {
    itemDetails.value.push({ name, value })
  }
}

const refreshItemDetails = () => {
  itemDetails.value = []
  if (selectedCompartment.value) {
    addItemDetail('item_name', getTranslatedText(item.value?.name))
    addItemDetail('compartment', selectedCompartment.value?.id)
    addItemDetail(
      'item_number',
      getTranslatedText(getItemNumberDisplay(item.value?.id))
    )

    if (
      selectedCompartment.value?.cycleCountState === CycleCountState.inProgress
    ) {
      // noinspection PointlessBooleanExpressionJS
      addItemDetail(
        'quantity',
        selectedCompartment.value.countedQuantity !== undefined &&
          selectedCompartment.value.countedQuantity !== null
          ? selectedCompartment.value.countedQuantity.toString()
          : '?'
      )
    } else {
      addItemDetail('quantity', stock.value?.quantity.toString())
    }

    addItemDetail('gtins', item.value?.gtins.join(', '))
    if (item.value?.weight !== undefined) {
      addItemDetail('weight', `${item.value?.weight} g`)
    }
  }
}

// For refreshing countedQuantity
watch(
  selectedCompartment,
  () => {
    refreshItemDetails()
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="load-carrier-item-details-container">
    <span class="header-text">{{ headerText }}</span>
    <div v-if="hasItems" class="details-image-container">
      <div v-if="selectedCompartment" class="item-details-container">
        <div
          v-for="itemDetail in itemDetails"
          :key="itemDetail.name"
          class="item-details-entry"
        >
          <span class="name">{{ getTranslation(itemDetail.name) }}</span>
          <span class="value">{{ itemDetail.value }}</span>
        </div>
      </div>
      <ItemImageGallery
        v-if="itemImageUrls"
        class="item-image"
        :item-image-urls="itemImageUrls"
      />
    </div>
    <div
      v-if="selectedCompartment && hasItems && itemDescriptionValue !== ''"
      class="description-container"
    >
      <span class="item-description-name">{{ itemDescriptionName }}</span>
      <span class="item-description-value">{{ itemDescriptionValue }}</span>
    </div>
    <div v-if="!hasItems" class="no-item-container">
      <img
        class="no-items-bg"
        :src="noItemsBackground"
        :alt="noItemsBackground"
      />
      <img class="no-items-image" :src="noItemsImage" :alt="noItemsImage" />
      <span class="no-items-text">{{ noItemsText }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-item-details-container {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: var(--tgw-bg-30);
  box-shadow: var(--tgw-dropshadow-soft);
  padding: 24px;

  .header-text {
    font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 26px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--tgw-text-secondary);
    margin-bottom: 40px;
    user-select: none;
  }

  .details-image-container {
    display: grid;
    grid-template-columns: 60% 40%;

    .item-details-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-row-gap: 40px;

      .item-details-entry {
        display: flex;
        flex-direction: column;

        .name {
          font-weight: 500;
          font-size: 18px;
          line-height: 21px;
          color: var(--tgw-text-secondary);
          margin-bottom: 4px;
          user-select: none;
        }

        .value {
          font-weight: 700;
          font-size: 24px;
          line-height: 28px;
          color: var(--tgw-text-primary);
          // used to make new line after specific length for each value
          white-space: break-spaces;
          // needed to short values after specific length
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }
      }
    }

    .item-image {
      justify-self: flex-end;
    }

    :deep(.item-image) {
      .image-container {
        .selected-item-image {
          width: 22vh;
          height: 22vh;
          max-width: 224px;
          max-height: 224px;
        }
      }
      .image-gallery-container {
        background: var(--tgw-bg-30);

        .image-gallery-item {
          max-width: 40px;
          max-height: 40px;
          height: 40px;
          width: 40px;

          &.selected {
            border: 2px solid var(--tgw-primary);
          }
        }
      }
    }
  }

  .description-container {
    .item-description-name {
      font-weight: 500;
      font-size: 18px;
      line-height: 21px;
      color: var(--tgw-text-secondary);
      margin-bottom: 4px;
      user-select: none;
    }

    .item-description-value {
      font-style: italic;
      font-weight: 700;
      font-size: 20px;
      line-height: 23px;
      color: var(--tgw-text-primary);
    }
  }

  .no-item-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: calc(
      100% - 26px /*header line-height*/ - 40px /*header margin*/ - 16%
        /*no-item-container margin*/
    );

    .no-items-bg {
      position: absolute;
      height: 100%;
      width: 100%;
    }
    .no-items-text {
      font-weight: 700;
      font-size: 32px;
      line-height: 36px;
      color: var(--tgw-icon-fallback);
      margin-top: 4%;
      text-align: center;
    }

    .no-items-image {
      width: auto;
      height: auto;
    }
  }
}
</style>
