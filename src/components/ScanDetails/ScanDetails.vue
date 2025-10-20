<script setup lang="ts">
import {
  BarcodeDataType,
  ItemType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'
import { useTranslations } from '@/composables/useTranslations'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'

const props = defineProps<Props>()
const {
  getBarcodesFromTask,
  getQuantityFromTask,
  isMultiItemCycleCountTask,
  isCycleCountTask,
} = useApiDataHelper()
const { getTranslatedText } = useTextTranslator()
const { getTranslation } = useTranslations('scan-details')
interface Props {
  barcodes: BarcodeDataType[]
  item?: ItemType | undefined
  task?: TaskType
}

const quantity = computed(() => {
  const barcodes = getBarcodesFromTask(props.task as TaskType)
  if (barcodes && !isMultiItemCycleCountTask(props.task)) {
    let scanOnce = true
    barcodes.forEach((barcode) => {
      if (barcode.scanRule !== ScanRuleEnum.ScanOnce) {
        scanOnce = false
      }
    })

    if (scanOnce && !isCycleCountTask(props.task)) {
      return getQuantityFromTask(props.task as TaskType, props.barcodes)
    } else {
      return 1
    }
  }
  return 1
})
const isItemUnknown = computed(() => {
  // cant check with the isUnknownItem function because we have not created the item at this point
  return props.item === undefined
})
const itemName = computed(() => {
  if (isItemUnknown.value) {
    const scanModificationStore = useScanModificationStore()
    return `${getTranslation('unknown_item_type')} ${
      scanModificationStore.unknownItemTypeCount
    }`
  }
  return getTranslatedText(`${props.item?.description}`)
})
const unknownItemDescription = computed(() => {
  return getTranslation('unknown_item_description')
})
const itemImageUrls = computed(() => {
  if (props.item) {
    return props.item.images?.map((image) => image.url)
  } else if (isItemUnknown.value) {
    const { unknownItemUrl } = useTheme()
    return [unknownItemUrl.value]
  }
})
</script>

<template>
  <div class="scan-details">
    <div class="header">
      <span class="quantity">{{ quantity }}x </span>
      <span class="item-name">{{ itemName }}</span>
    </div>
    <div class="content">
      <div v-if="isItemUnknown" class="content-top">
        <TgwIcon
          icon="status-warning-triangle"
          color="var(--tgw-status-warning)"
          size="32px"
        />
        <span class="unknown-item-description">{{
          unknownItemDescription
        }}</span>
      </div>
      <div class="content-bottom">
        <div class="content-left">
          <div
            v-for="barcode in barcodes"
            :key="barcode.barcodeType"
            class="scan-item"
          >
            <span class="barcode-type">{{
              BarcodeTypeEnum[barcode.barcodeType]
            }}</span>
            <span class="barcode-text">{{ barcode.barcode }}</span>
          </div>
        </div>
        <div class="content-right">
          <ItemImage
            :item-image-urls="itemImageUrls"
            :allow-open-gallery="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scan-details {
  display: flex;
  flex-direction: column;
  box-shadow: var(--tgw-dropshadow-soft);
  background-color: var(--tgw-bg-10);
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  border-radius: 4px;

  .header {
    border-bottom: 1px solid var(--tgw-line-10);
    padding: 16px 16px 11px 16px;
    box-sizing: border-box;
    width: 100%;

    .quantity {
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      color: var(--tgw-primary);
    }

    .item-name {
      font-weight: 700;
      font-size: 20px;
      line-height: 23px;
      color: var(--tgw-primary);
    }
  }

  .content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .content-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 16px;
      padding: 12px;
      border-radius: 2px;
      border: 2px dashed var(--tgw-status-warning);
      background: var(--tgw-status-warning-alpha10);

      .unknown-item-description {
        font-size: 16px;
        color: var(--tgw-text-primary);
      }
    }
    .content-bottom {
      display: flex;
      padding: 16px;

      .content-left {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        width: 100%;
        gap: 16px;

        .scan-item {
          display: flex;
          flex-direction: column;

          .barcode-type {
            color: var(--tgw-text-secondary);
            font-size: 14px;
            line-height: 16px;
            text-transform: uppercase;
          }

          .barcode-text {
            color: var(--tgw-text-primary);
            font-size: 16px;
            line-height: 18px;
            font-weight: 700;
          }
        }
      }

      .content-right {
        display: flex;
        align-items: center;
        justify-content: space-evenly;

        :deep(.item-image) {
          max-width: 148px;
          width: 148px;
          max-height: 100%;

          &.unknown-item {
            max-width: 92px;

            .item-image-container {
              max-height: 92px;

              .el-image__inner {
                max-height: 92px;
                width: 92px;
              }
            }
          }
        }

        .item-image-container {
          .unknown-item-image {
            box-shadow: var(--tgw-dropshadow-soft);
            background: var(--tgw-bg-40);
            border: 1px solid var(--tgw-line-00);
            border-radius: 4px;
          }
        }
      }
    }
  }
}
</style>
