export enum ThemeEnum {
  dark = 'dark',
  light = 'light',
}

export const colorMode = useColorMode({
  selector: 'html',
  attribute: 'class',
  modes: ThemeEnum,
  storageKey: 'app-container-color-theme',
})

export const isDark = computed(() => {
  return colorMode.value === ThemeEnum.dark
})

export const useTheme = () => {
  const unknownItemUrl = computed(() => {
    return `src/assets/images/item-images/UNKNOWN_ITEM-${colorMode.value}.svg`
  })

  return {
    unknownItemUrl,
  }
}
