<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

interface Props {
  itemImageUrls?: string[]
  allowOpenGallery?: boolean
}
const props = withDefaults(defineProps<Props>(), { allowOpenGallery: true })
const isImageGalleryVisible = ref<boolean>(false)
const imageError = ref<boolean>(false)
const { getTranslation } = useTranslations('item-image')

const hasImages = computed((): boolean => {
  return props.itemImageUrls !== undefined && props.itemImageUrls.length > 0
})
const firstImageUrl = computed((): string | undefined => {
  if (
    props.itemImageUrls?.length &&
    props.itemImageUrls?.length > 0 &&
    props.itemImageUrls?.[0]
  ) {
    return props.itemImageUrls[0]
  }
})
const isUnknownItemImage = computed(() => {
  const { hasUnknownItemUrl } = useApiDataHelper()

  if (firstImageUrl.value) {
    return hasUnknownItemUrl([firstImageUrl.value])
  }
  return false
})
const fallbackImage = computed(() => {
  if (hasImages.value || props.itemImageUrls === undefined) {
    return 'image'
  }
  return 'no-item-picture'
})

const itemImageClicked = () => {
  if (!props.allowOpenGallery) {
    return
  }

  if (!imageError.value && hasImages.value) {
    isImageGalleryVisible.value = true
  }
}
const closeImageGalleryDialog = () => {
  isImageGalleryVisible.value = false
}
const onImageError = () => {
  imageError.value = true
}
const onLoad = () => {
  imageError.value = false
}
defineExpose({ isImageGalleryVisible })
</script>

<template>
  <div
    class="item-image"
    :class="{
      'no-image': !hasImages || imageError,
      'unknown-item': isUnknownItemImage,
    }"
  >
    <div
      class="item-image-container"
      :class="{
        'allow-open-gallery': allowOpenGallery,
      }"
      @click="itemImageClicked"
    >
      <ElImage
        class="image"
        :src="firstImageUrl"
        :alt="firstImageUrl"
        fit="cover"
        draggable="false"
        @error="onImageError"
        @load="onLoad"
      >
        <template #error>
          <div class="no-image-container">
            <TgwIcon
              class="no-image-icon"
              :class="fallbackImage"
              :icon="fallbackImage"
              color="var(--tgw-icon-fallback)"
            />
            <span
              v-if="fallbackImage === 'no-item-picture'"
              class="no-photo-available"
              >{{ getTranslation('no_photo_available') }}</span
            >
          </div>
        </template>
      </ElImage>
    </div>
  </div>
  <TgwDialog
    v-model="isImageGalleryVisible"
    width="690px"
    modal
    class="item-image-gallery-dialog"
    :destroy-on-close="true"
    :close-icon="false"
    :smart-overflow="false"
    @close="closeImageGalleryDialog"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-text">{{
          getTranslation('item_images')
        }}</span>
      </div>
    </template>
    <template #default>
      <div class="dialog-body">
        <ItemImageGallery :item-image-urls="itemImageUrls" />
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <TgwButton
          plain
          type="primary"
          class="dialog-button"
          @click="closeImageGalleryDialog"
        >
          {{ getTranslation('close') }}
        </TgwButton>
      </div>
    </template>
  </TgwDialog>
</template>

<style scoped lang="scss">
.item-image {
  border-radius: 4px;
  box-shadow: var(--pcots-innershadow-load-carrier-section);
  max-width: 30vh;
  width: 250px;
  background: white;

  &.unknown-item {
    background: transparent;
    border: 2px dashed var(--tgw-line-20);

    .item-image-container :deep(.image) .el-image__inner {
      width: 128px;
      height: 128px;
    }
  }

  .item-image-container {
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--tgw-dropshadow-soft);

    .image {
      user-select: none;
      aspect-ratio: 50/60;
      height: auto;
      width: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.allow-open-gallery {
      cursor: pointer;
    }

    .no-image-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      aspect-ratio: 50/60;
      height: auto;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;

      .no-image-icon {
        margin-bottom: 12px;
        --item-picture-no-image-icon-size: 128px;
        width: var(--item-picture-no-image-icon-size) !important;
        height: var(--item-picture-no-image-icon-size) !important;

        :deep(svg) {
          width: var(--item-picture-no-image-icon-size);
          height: var(--item-picture-no-image-icon-size);
        }
      }

      .no-photo-available {
        font-size: 28px;
        text-align: center;
        color: var(--tgw-icon-fallback);
      }
    }
  }

  &.no-image {
    background: transparent;

    .item-image-container {
      cursor: auto;
      border: 2px dashed var(--tgw-line-20);
      border-radius: 4px;
    }
  }
}

.item-image-gallery-dialog {
  .dialog-header {
    .dialog-header-text {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-size: 32px;
      line-height: 42px;
      letter-spacing: 1px;
      font-weight: 700;
      user-select: none;
    }
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    margin: 30px -24px;
  }

  .dialog-footer {
    .dialog-button {
      font-size: 24px;
      line-height: 28px;
      font-weight: 700;
      width: 100%;
      height: 88px !important;
    }
  }
}
</style>

<style lang="scss">
.item-image-gallery-dialog {
  max-width: 756px;
}
</style>
