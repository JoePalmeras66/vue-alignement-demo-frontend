<script setup lang="ts">
import {
  DxColumn,
  DxDataGrid,
  DxItem,
  DxLoadPanel,
  DxScrolling,
  DxToolbar,
} from 'devextreme-vue/data-grid'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { OrderLineType } from '@/types/Api/pcotsExt/PcotsExtApiModel'
import { getLoadCarrierOrders } from '@/composables/usePcotsExtApi'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

const props = defineProps<Props>()

interface Props {
  location: PcotsLocationEnum
}
const { getTranslation } = useTranslations('load-carrier-details-order-lines')
const { getTranslatedText } = useTextTranslator()
const orderLines = ref<OrderLineType[]>([])
const title = computed(() => {
  if (props.location === PcotsLocationEnum.Source) {
    return getTranslation('order_lines_source')
  }
  return getTranslation('order_lines_target')
})
const loadOrderLines = async () => {
  const response = await getLoadCarrierOrders({ location: props.location })
  if (response) {
    orderLines.value = response.orderLines
  }
}
onMounted(async () => {
  await loadOrderLines()
})
watch(
  () => props.location,
  async () => {
    await loadOrderLines()
  }
)
const onCustomizeText = (cellInfo: {
  groupInterval: string | number
  target: string
  value: any
  valueText: string
}) => {
  return getTranslatedText(cellInfo.value)
}
const getImageUrls = (orderLine: OrderLineType) => {
  if (
    orderLine?.task?.item?.images &&
    orderLine?.task?.item?.images?.length > 0
  ) {
    return orderLine?.task?.item?.images?.map((image) => image.url)
  }
}
const onCalculateCompartmentIdDisplayValue = (orderLine: OrderLineType) => {
  if (props.location === PcotsLocationEnum.Source) {
    return orderLine?.task?.sourceCompartmentId
  } else if (props.location === PcotsLocationEnum.Target) {
    return orderLine?.task?.targetCompartmentId
  }
}
</script>

<template>
  <div class="load-carrier-details-order-lines">
    <DxDataGrid
      :data-source="orderLines"
      key-expr="task.id"
      :show-borders="true"
      height="var(--pcots-details-container-height)"
      class="grid"
      :row-alternation-enabled="true"
      :column-auto-width="true"
    >
      <DxLoadPanel :enabled="true" />
      <DxScrolling show-scrollbar="always" />
      <DxToolbar>
        <DxItem location="before" template="titleToolbarTemplate" />
      </DxToolbar>
      <DxColumn
        data-field="task.id"
        :caption="getTranslation('col_order_id')"
      />
      <DxColumn
        data-field="description"
        :caption="getTranslation('col_order_description')"
        :customize-text="onCustomizeText"
      />
      <DxColumn
        data-field="task.item.id"
        :caption="getTranslation('col_item_id')"
      />
      <DxColumn
        :caption="getTranslation('col_item_image')"
        cell-template="itemImageCellTemplate"
      />
      <DxColumn
        data-field="task.item.description"
        :customize-text="onCustomizeText"
        :caption="getTranslation('col_item_description')"
      />
      <DxColumn
        data-field="quantity.value"
        :caption="getTranslation('col_quantity')"
      />
      <DxColumn
        data-field="quantity.unit"
        :customize-text="onCustomizeText"
        :caption="getTranslation('col_quantity_unit')"
      />
      <DxColumn
        :calculate-display-value="onCalculateCompartmentIdDisplayValue"
        :caption="getTranslation('col_compartment_id')"
      />
      <template #itemImageCellTemplate="{ data }">
        <div class="item-image-container">
          <ItemImage
            :item-image-urls="getImageUrls(data.row.data)"
            :allow-open-gallery="true"
          />
        </div>
      </template>
      <template #titleToolbarTemplate>
        <div class="toolbar-title">
          <span class="toolbar-title__text">{{ title }}</span>
        </div>
      </template>
    </DxDataGrid>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-order-lines {
  :deep(.grid) {
    .dx-header-row td[role='columnheader'],
    .dx-data-row td[role='gridcell'] {
      font-size: 20px;
      line-height: 24px;
    }

    .toolbar-title {
      .toolbar-title__text {
        color: var(--tgw-text-primary);
        font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
    }

    .item-image-container {
      display: flex;
      justify-content: center;
      align-items: center;

      .item-image {
        aspect-ratio: 1/1;
        width: 100px;
        height: 100px;

        .item-image-container {
          .no-image-container,
          .image {
            aspect-ratio: 1/1;

            .no-image-icon {
              --item-picture-no-image-icon-size: 70px;
            }
          }
        }
      }
    }
  }
}
</style>
