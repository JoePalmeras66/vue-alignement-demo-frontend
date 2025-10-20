import { BarcodeDataType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { verifyBarcode } from '@/composables/usePcotsApi'
import { BarcodeValidationResult } from '@/types/BarcodeValidationResult'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const showUnknownItemScanMessageBox = ref(false)

export const useItemScanValidator = () => {
  const {
    getBarcodesFromTask,
    getGtinsFromTask,
    getVerifyBarcodeFromTask,
    isMultiItemCycleCountTask,
  } = useApiDataHelper()

  const validateImei = (barcode: string): boolean => {
    const regExp = /^\d{15}$/
    if (!regExp.test(barcode)) {
      return false
    }
    let sum = 0
    let mul = 2
    const l = 14
    for (let i = 0; i < l; i++) {
      const digit = barcode.substring(l - i - 1, l - i)
      const tp = Number.parseInt(digit, 10) * mul
      if (tp >= 10) {
        sum += (tp % 10) + 1
      } else {
        sum += tp
      }
      if (mul === 1) {
        mul++
      } else {
        mul--
      }
    }
    const chk = (10 - (sum % 10)) % 10
    return chk === Number.parseInt(barcode.substring(14, 15), 10)
  }
  const validateGtins = (barcode: string, gtinsOfItem: string[]): boolean => {
    let isValid = false
    for (const gtin of gtinsOfItem) {
      if (barcode === gtin) {
        isValid = true
        break
      }
    }
    return isValid
  }
  const validateFormat = (barcode: string, format: string): boolean => {
    const regEx = new RegExp(format)
    return regEx.test(barcode)
  }

  const getFormat = (
    task: TaskType,
    barcodeType: BarcodeTypeEnum
  ): string | undefined | null => {
    const barcodes = getBarcodesFromTask(task)
    if (barcodes) {
      const barcode = barcodes.find(
        (barcode) => barcode.barcodeType === barcodeType
      )
      if (barcode) {
        return barcode.format
      }
    }
  }

  const validateSingleItemScan = (
    task: TaskType,
    barcode: BarcodeDataType
  ): BarcodeValidationResult => {
    let isValid = true
    const format = getFormat(task, barcode.barcodeType)
    if (format && format !== '') {
      isValid = validateFormat(barcode.barcode, format)
    } else {
      switch (barcode.barcodeType) {
        case BarcodeTypeEnum.Gtin:
          if (!isMultiItemCycleCountTask(task)) {
            isValid = validateGtins(barcode.barcode, getGtinsFromTask(task))
          } else {
            // scans always valid in multiItemCycleCount as it could be an unknown item which is not in the source load carrier
            isValid = true
          }
          break
        case BarcodeTypeEnum.Imei:
          isValid = validateImei(barcode.barcode)
          break
      }
    }
    return new BarcodeValidationResult(isValid)
  }

  const validateItemScan = async (
    task: TaskType,
    barcodes: BarcodeDataType[]
  ): Promise<BarcodeValidationResult> => {
    let validationResult: BarcodeValidationResult = new BarcodeValidationResult(
      true
    )
    const verifyBarcodeFromTask = getVerifyBarcodeFromTask(task)
    if (verifyBarcodeFromTask) {
      try {
        await verifyBarcode({ taskId: task.id, barcodes })
      } catch (e: any) {
        validationResult.isValid = false
        validationResult.message = e.response.data
      }
    } else {
      for (const barcode of barcodes) {
        validationResult = validateSingleItemScan(task, barcode)
        // When a barcode is wrong skip validation
        if (!validationResult.isValid) {
          return validationResult
        }
      }
    }
    return validationResult
  }

  return {
    validateItemScan,
    validateSingleItemScan,
    showUnknownItemScanMessageBox,
  }
}
