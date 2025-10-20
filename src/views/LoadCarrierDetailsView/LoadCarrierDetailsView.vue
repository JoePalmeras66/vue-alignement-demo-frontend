<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Ref } from 'vue'
import LoadCarrierDetailsFooter from '@/components/LoadCarrierDetailsFooter/LoadCarrierDetailsFooter.vue'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import LoadCarrierDetails from '@/components/LoadCarrierDetails/LoadCarrierDetails.vue'
import LoadCarrierItemDetails from '@/components/LoadCarrierItemDetails/LoadCarrierItemDetails.vue'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { CompartmentType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { LoadCarrierDetailsPageEnum } from '@/types/LoadCarrierDetailsPageEnum'

const { getItemIdsFromStocks } = useApiDataHelper()

const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
const { sourceLoadCarrier, targetLoadCarrier } = storeToRefs(
  useLoadCarrierStore()
)
const { loadCarrier, pcotsLocation } = storeToRefs(loadCarrierDetailsStore)

const taskStore = useTaskStore()
const { task }: { task: Ref<TaskType | undefined> } = storeToRefs(taskStore)

const router = useRouter()
const selectedCompartment: Ref<CompartmentType | undefined> = ref<
  CompartmentType | undefined
>(undefined)
const currentPage = ref<LoadCarrierDetailsPageEnum>(
  LoadCarrierDetailsPageEnum.item_details
)
const { getTranslation } = useTranslations('load-carrier-details')
const { locale } = useI18n()

const textMinWidth = computed(() => {
  if (locale.value === 'de') {
    return '276px'
  }
  return '206px'
})

const headerText = computed(() => {
  const lcType =
    pcotsLocation.value === PcotsLocationEnum.Source ? 'source' : 'target'
  return `${getTranslation(lcType)} - #${loadCarrier.value?.id}`
})

const compartments = computed(() => {
  const compartmentCount =
    loadCarrier?.value?.compartments.length &&
    loadCarrier?.value?.compartments.length > 0
      ? loadCarrier.value?.compartments.length
      : 0
  return getTranslation('compartment', compartmentCount)
})

const items = computed(() => {
  let itemCount = 0

  if (
    loadCarrier?.value?.compartments &&
    loadCarrier?.value?.compartments?.length > 0
  ) {
    for (const compartment of loadCarrier.value.compartments) {
      for (const stock of compartment.items) {
        if (stock?.quantity) {
          itemCount += stock.quantity
        }
      }
    }
  }
  return getTranslation('item', itemCount)
})

const itemTypes = computed(() => {
  const itemIds = new Set()
  if (
    loadCarrier?.value?.compartments &&
    loadCarrier?.value?.compartments?.length > 0
  ) {
    for (const compartment of loadCarrier.value.compartments) {
      if (compartment) {
        for (const stockItemIds of getItemIdsFromStocks(compartment.items)) {
          itemIds.add(stockItemIds)
        }
      }
    }
  }
  return getTranslation('item_type', itemIds.size)
})

const showOppositeLcButtonText = computed(() => {
  if (pcotsLocation.value === PcotsLocationEnum.Source) {
    return getTranslation('show_target')
  }
  return getTranslation('show_source')
})

const isShowOppositeLcButtonDisabled = computed(() => {
  if (pcotsLocation.value === PcotsLocationEnum.Source) {
    return targetLoadCarrier.value === undefined
  }
  return sourceLoadCarrier.value === undefined
})

const onSelectedCompartmentChanged = (compartment: CompartmentType) => {
  selectedCompartment.value = compartment
}
const onShowOppositeLcButtonClicked = () => {
  if (isShowOppositeLcButtonDisabled.value) {
    return
  }
  loadCarrierDetailsStore.swapPcotsLocation()
}

onMounted(async () => {
  // Navigate back in case of refresh and no lc
  if (loadCarrier.value === undefined) {
    await router.push('/')
  }
})
defineExpose({ textMinWidth, currentPage, selectedCompartment })
</script>

<template>
  <div class="load-carrier-details-view-container">
    <div class="load-carrier-details-view-content">
      <div class="header-container">
        <HeaderWithDetails
          :text="headerText"
          :sub-texts="[compartments, items, itemTypes]"
          class="header-with-details"
          :class="{
            'order-lines-displayed':
              currentPage === LoadCarrierDetailsPageEnum.order_lines,
          }"
        />
        <IconButton
          plain
          type="primary"
          class="show-opposite-lc-button"
          icon="double-arrow-right"
          icon-alignment="left"
          :disabled="isShowOppositeLcButtonDisabled"
          :text="showOppositeLcButtonText"
          @click="onShowOppositeLcButtonClicked"
        />
      </div>

      <div
        v-if="currentPage === LoadCarrierDetailsPageEnum.item_details"
        class="details-container"
      >
        <div class="aspect-ratio-container left">
          <LoadCarrierDetails
            class="load-carrier-details"
            :load-carrier="loadCarrier"
            :pcots-location="pcotsLocation"
            :task="task"
            :selected-compartment="selectedCompartment"
            @selected-compartment-changed="onSelectedCompartmentChanged"
          />
        </div>
        <div class="aspect-ratio-container right">
          <LoadCarrierItemDetails
            class="load-carrier-item-details"
            :task="task"
            :load-carrier="loadCarrier"
            :selected-compartment="selectedCompartment"
          />
        </div>
      </div>
      <div v-else class="order-lines">
        <LoadCarrierDetailsOrderLines :location="pcotsLocation!" />
      </div>
    </div>
    <LoadCarrierDetailsFooter v-model="currentPage" />
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;

  .load-carrier-details-view-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;

    :deep(.header-with-details).order-lines-displayed {
      .sub-text-item {
        //Hide but reserve space
        visibility: hidden;
      }
    }

    .header-container {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 42px;
      position: relative;

      :deep(.show-opposite-lc-button) {
        position: absolute;
        margin-top: 32px;
        min-width: v-bind('textMinWidth');
        height: 54px;
        right: 80px;
        text-transform: uppercase;

        span {
          flex: 1;
        }

        .flex-container {
          flex: 1;

          .button-text {
            flex: 1;
            font-family: Roboto, Helvetica, sans-serif;
            font-weight: 700;
            font-size: 16px;
            text-align: right;
          }
        }
      }
    }

    --pcots-details-container-height: calc(
      100vh - var(--pcots-footer-height) - 48px /*header-text line-height*/ -
        32px /*header-text margin-top*/ - 16px /*header-text margin-bottom*/ -
        42px /*dot-text-container margin-bottom*/ - 28px
        /*header-sub-text line-height*/ - 42px
        /*details-container margin-bottom*/
    );
    .details-container {
      display: grid;
      justify-items: center;
      grid-template-columns: 50% 50%;
      width: calc(
        100% - 80px
      ); // to have a margin on the right and left of 40px
      margin-bottom: 42px;
      height: var(--pcots-details-container-height);

      .aspect-ratio-container {
        container-type: size;
        container-name: aspectRatioContainer;
        display: inline-flex;
        width: 100%;
        height: 100%;
        aspect-ratio: var(--pcots-lc-aspect-ratio);
        max-height: var(--pcots-details-container-height);
        max-width: calc(
          100% - 80px
        ); // to have a margin on the right and left of 40px

        &.left {
          justify-content: flex-end;
        }

        .load-carrier-details,
        .load-carrier-item-details {
          grid-row: 1;
          aspect-ratio: var(--pcots-lc-aspect-ratio);
          box-sizing: border-box;
          width: 100%;
        }

        @container aspectRatioContainer (height < 1000px) or (width < 1456px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 1311px;
            max-height: 920px;
          }
        }
        @container aspectRatioContainer (height < 900px) or (width < 1311px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 1165px;
            max-height: 820px;
          }
        }
        @container aspectRatioContainer (height < 800px) or (width < 1165px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 1019px;
            max-height: 720px;
          }
        }
        @container aspectRatioContainer (height < 700px) or (width < 1019px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 874px;
            max-height: 620px;
          }
        }
        @container aspectRatioContainer (height < 600px) or (width < 874px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 728px;
            max-height: 520px;
          }
        }
        @container aspectRatioContainer (height < 500px) or (width < 728px) {
          .load-carrier-details,
          .load-carrier-item-details {
            max-width: 583px;
            max-height: 420px;
          }
        }
      }
    }

    .order-lines {
      height: var(--pcots-details-container-height);
      width: 100%;
      box-sizing: border-box;
      padding: 0 80px;
    }
  }
}
</style>
