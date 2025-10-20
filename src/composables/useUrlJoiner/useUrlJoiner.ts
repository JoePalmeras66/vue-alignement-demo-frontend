export const useUrlJoiner = () => {
  const joinUrls = (...urls: string[]): string => {
    const joinedUrl = urls.join('/')
    const regex = /([^:])\/{2,}/g
    return joinedUrl.replace(regex, '$1/')
  }
  return { joinUrls }
}
