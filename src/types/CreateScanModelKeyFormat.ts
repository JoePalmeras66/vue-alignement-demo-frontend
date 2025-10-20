import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const separator = '_'

export type CreateScanModelKeyFormat =
  `${BarcodeTypeEnum}${typeof separator}${number}`

export type CreateScanModelRecordType = Record<CreateScanModelKeyFormat, string>

export function getBarcodeTypeFromKey(
  key: CreateScanModelKeyFormat
): BarcodeTypeEnum {
  return key.substring(0, key.lastIndexOf(separator)) as BarcodeTypeEnum
}

export function buildCreateScanModelKeyFormat(
  barcodeType: BarcodeTypeEnum,
  fieldNumber: number
): CreateScanModelKeyFormat {
  return `${barcodeType}${separator}${fieldNumber}`
}
