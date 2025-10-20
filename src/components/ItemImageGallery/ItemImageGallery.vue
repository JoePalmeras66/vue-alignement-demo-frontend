<script setup lang="ts">
interface Props {
  itemImageUrls?: string[]
}
const props = defineProps<Props>()
const selectedImageIndex = ref<number>(0)
const selectedImageUrl = computed((): string | undefined => {
  return props.itemImageUrls?.[selectedImageIndex.value]
})
const imageClicked = (itemImageUrl: string) => {
  if (props.itemImageUrls!.includes(itemImageUrl)) {
    selectedImageIndex.value = props.itemImageUrls!.indexOf(itemImageUrl)
  }
}
const isImageSelected = (itemImageUrl: string): boolean => {
  return selectedImageIndex.value === props.itemImageUrls!.indexOf(itemImageUrl)
}
</script>

<template>
  <div class="item-image-gallery">
    <div class="image-container">
      <img
        v-if="selectedImageUrl"
        :src="selectedImageUrl"
        :alt="selectedImageUrl"
        class="selected-item-image"
        :draggable="false"
      />
    </div>
    <div
      v-if="itemImageUrls && itemImageUrls.length > 1"
      class="image-gallery-container"
    >
      <img
        v-for="itemImageUrl in itemImageUrls"
        :key="itemImageUrl"
        :class="{ selected: isImageSelected(itemImageUrl) }"
        class="image-gallery-item"
        :src="itemImageUrl"
        :alt="itemImageUrl"
        :draggable="false"
        @click="imageClicked(itemImageUrl)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.item-image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;

  .image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid var(--tgw-line-00);
    box-sizing: border-box;

    .selected-item-image {
      width: 400px;
      height: 400px;
      user-select: none;
    }
  }

  .image-gallery-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;

    width: 100%;
    background: var(--tgw-bg-10);

    .image-gallery-item {
      cursor: pointer;
      border: 4px solid var(--tgw-line-00);
      margin: 8px;
      box-sizing: border-box;
      max-width: 100px;
      max-height: 100px;
      user-select: none;
      aspect-ratio: 1/1;

      &.selected {
        border: 4px solid var(--tgw-primary);
      }
    }
  }
}
</style>

<style lang="scss">
:root .el-overlay .el-dialog.item-image-gallery-dialog {
  background-color: var(--tgw-bg-00);
}
</style>
