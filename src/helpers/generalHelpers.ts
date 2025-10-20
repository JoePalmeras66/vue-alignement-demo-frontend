export const generalHelpers = () => {
  const addMultipleListeners = (
    el: Element,
    types: string[],
    listener: () => void
  ) => {
    types.forEach((type) => el.addEventListener(type, listener))
  }

  return {
    addMultipleListeners,
  }
}
