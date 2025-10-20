<script setup lang="ts">
import { Ref } from 'vue'
import { useTranslations } from '@/composables/useTranslations'

const emit = defineEmits<{
  identifyLoadCarrier: [loadCarrierNumber: string]
}>()
const { getTranslation } = useTranslations('load-carrier-no-read')

const showLoadCarrierIdentificationDialog: Ref<boolean> = ref<boolean>(false)
const openLoadCarrierIdentificationDialog = () => {
  showLoadCarrierIdentificationDialog.value = true
}

const identifyLoadCarrierNumber = (loadCarrierNumber: number) => {
  emit('identifyLoadCarrier', loadCarrierNumber.toString())
}
</script>

<template>
  <div class="no-read-container">
    <TgwIcon
      icon="status-error-circle"
      size="100px"
      color="var(--tgw-status-error)"
    />
    <span class="no-read-text">{{
      getTranslation('load_carrier_no_read')
    }}</span>
    <TgwButton
      type="primary"
      class="no-read-button"
      @click="openLoadCarrierIdentificationDialog"
    >
      {{ getTranslation('enter_load_carrier_number') }}
    </TgwButton>
  </div>
  <QuantityInput
    v-if="showLoadCarrierIdentificationDialog"
    v-model:is-visible="showLoadCarrierIdentificationDialog"
    :title="getTranslation('enter_load_carrier_number')"
    @quantity-changed="identifyLoadCarrierNumber"
  />
</template>

<style scoped lang="scss">
.no-read-container {
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  height: 100%;
  max-height: 400px;

  .no-read-text {
    color: var(--tgw-status-error);
    font-size: 28px;
    line-height: 33px;
    margin-top: 8px;
    margin-bottom: 32px;
    text-align: center;
  }

  .no-read-button {
    border-radius: 8px;
    height: 88px;
    font-size: 24px;
    padding: 30px 28px;
  }
}
</style>
