<script setup lang="ts">
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { BarcodeDataType } from '@/types/Api/pcots/PcotsApiModel'

interface Props {
  barcodes: BarcodeDataType[]
  isSelected: boolean
  scanNumber: number
  maxScans?: number
}
defineProps<Props>()
</script>

<template>
  <div class="scan-item" :class="{ 'is-selected': isSelected }">
    <div class="header">
      <TgwIcon
        class="header-icon"
        icon="barcode"
        color="var(--tgw-icon-secondary)"
      />
      <div class="scan-number-container">
        <span class="scan-number">{{ scanNumber }}</span>
        <span class="max-scans">/{{ maxScans }}</span>
      </div>
    </div>
    <div class="barcodes">
      <div
        v-for="barcode in barcodes"
        :key="barcode.barcodeType"
        class="barcode"
      >
        <span class="barcode-type">{{
          BarcodeTypeEnum[barcode.barcodeType]
        }}</span>
        <span class="barcode-text">{{ barcode.barcode }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scan-item {
  display: flex;
  flex-direction: column;
  background-color: var(--tgw-bg-30);
  border-radius: 4px;
  box-shadow: var(--tgw-dropshadow-soft);
  width: 200px;
  min-height: 200px;
  padding: 16px 12px;
  cursor: pointer;
  box-sizing: border-box;
  transition: 0.3s;

  &:hover {
    box-shadow: var(--tgw-dropshadow-soft-elevated);
  }

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--tgw-line-10);

    .header-icon {
      margin-bottom: 10px;
      --header-icon-size: 22px;
      width: var(--dialog-header-icon-size) !important;
      height: var(--dialog-header-icon-size) !important;

      :deep(svg) {
        width: var(--dialog-header-icon-size);
        height: var(--dialog-header-icon-size);
      }
    }

    .scan-number-container {
      text-align: right;
      margin-bottom: 10px;
      width: 100%;

      .max-scans,
      .scan-number {
        font-size: 16px;
        font-weight: 700;
        line-height: 19px;
        letter-spacing: 0;
      }

      .max-scans {
        font-weight: 400;
      }
    }
  }

  .barcodes {
    flex: 1;

    .barcode {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      gap: 4px;

      .barcode-type {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        text-transform: uppercase;
        color: var(--tgw-text-secondary);
      }
      .barcode-text {
        font-weight: 700;
        font-size: 16px;
        line-height: 19px;
        color: var(--tgw-text-primary);
        word-wrap: break-word;
      }
    }
  }

  &.is-selected {
    box-shadow: 0 2px 28px -2px rgba(82, 89, 102, 0.1),
      0px 2px 8px -2px rgba(82, 89, 102, 0.2),
      inset 0 0 0 4px var(--tgw-primary);
  }
}
</style>
