import { beforeEach, describe, expect, it } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import {
  PcotsLocationEnum,
  ProblemCategoryEnum,
  ProblemSendToRejectOption,
  ProblemStrategyEnum,
  ProblemSubCategoryEnum,
  ProblemTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { LoadCarrierProblemType } from '@/types/LoadCarrierProblemType'
import {
  LoadCarrierOccupancyType,
  ProblemType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  addCriticalProblem,
  addProblemWithSendToReject,
  addTargetFull,
  getSourceLoadCarrier,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import { PcotsLocationType } from '@/types/PcotsLocationType'

setActivePinia(createPinia())

describe('Test useTroubleshootingStore', () => {
  const troubleshootingStore = useTroubleshootingStore()
  beforeEach(() => {
    troubleshootingStore.$reset()
  })

  it('should return overall problem count', () => {
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedItem)
    troubleshootingStore.targetProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    troubleshootingStore.taskProblems.push(ProblemTypeEnum.MissingQuantity)
    expect(troubleshootingStore.getOverallProblemCount).toBe(3)
  })

  it('should clear problems', () => {
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedItem)
    troubleshootingStore.targetProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    troubleshootingStore.taskProblems.push(ProblemTypeEnum.MissingQuantity)
    troubleshootingStore.clearProblems()
    expect(troubleshootingStore.sourceProblems.length).toBe(0)
    expect(troubleshootingStore.targetProblems.length).toBe(0)
    expect(troubleshootingStore.taskProblems.length).toBe(0)
  })

  it('should get all problems', () => {
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedItem)
    troubleshootingStore.targetProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    troubleshootingStore.taskProblems.push(ProblemTypeEnum.MissingQuantity)
    const problems = troubleshootingStore.getAllProblems('4711', '4712')
    expect(problems.length).toBe(3)
    expect(problems[0]).toStrictEqual({
      loadCarrierId: '4711',
      problemCategory: ProblemCategoryEnum.Source,
      problemType: ProblemTypeEnum.DamagedItem,
    } as LoadCarrierProblemType)
    expect(problems[1]).toStrictEqual({
      loadCarrierId: '4712',
      problemCategory: ProblemCategoryEnum.Target,
      problemType: ProblemTypeEnum.DamagedLoadCarrier,
    } as LoadCarrierProblemType)
    expect(problems[2]).toStrictEqual({
      loadCarrierId: '',
      problemCategory: ProblemCategoryEnum.Task,
      problemType: ProblemTypeEnum.MissingQuantity,
    } as LoadCarrierProblemType)
  })

  it('should not have problem with abort without problems', () => {
    expect(troubleshootingStore.hasProblemWithAbort('4711', '4712')).toBeFalsy()
  })

  it('should not have problem with abort with problems', () => {
    troubleshootingStore.allProblems = [
      {
        name: '',
        category: ProblemCategoryEnum.Source,
        subCategory: ProblemSubCategoryEnum.LoadCarrier,
        type: ProblemTypeEnum.DamagedItem,
        strategy: ProblemStrategyEnum.Continue,
      },
    ]
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedItem)
    expect(troubleshootingStore.hasProblemWithAbort('4711', '4712')).toBeFalsy()
  })

  it('should have problem with abort', () => {
    troubleshootingStore.allProblems = [
      {
        name: '',
        category: ProblemCategoryEnum.Source,
        subCategory: ProblemSubCategoryEnum.LoadCarrier,
        type: ProblemTypeEnum.DamagedItem,
        strategy: ProblemStrategyEnum.Abort,
      },
    ]
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedItem)
    expect(
      troubleshootingStore.hasProblemWithAbort('4711', '4712')
    ).toBeTruthy()
  })

  it('should update problems correctly', () => {
    const loadCarrierOccupancies = [
      {
        pcotsLocation: PcotsLocationEnum.Source,
        loadCarrier: getSourceLoadCarrier(),
        problems: [
          {
            problemCategory: ProblemCategoryEnum.Source,
            problemType: ProblemTypeEnum.DamagedLoadCarrier,
          },
          {
            problemCategory: ProblemCategoryEnum.Task,
            problemType: ProblemTypeEnum.MissingQuantity,
          },
        ],
      } as LoadCarrierOccupancyType,
      {
        pcotsLocation: PcotsLocationEnum.Target,
        loadCarrier: getTargetLoadCarrier(),
        problems: [
          {
            problemCategory: ProblemCategoryEnum.Target,
            problemType: ProblemTypeEnum.DirtyLoadCarrier,
          },
          {
            problemCategory: ProblemCategoryEnum.Task,
            problemType: ProblemTypeEnum.WrongItem,
          },
        ],
      } as LoadCarrierOccupancyType,
    ]
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0])
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[1])
    expect(troubleshootingStore.getOverallProblemCount).toBe(4)
    expect(troubleshootingStore.sourceProblems[0]).toBe(
      ProblemTypeEnum.DamagedLoadCarrier
    )
    expect(troubleshootingStore.targetProblems[0]).toBe(
      ProblemTypeEnum.DirtyLoadCarrier
    )
    expect(troubleshootingStore.taskProblems[0]).toBe(
      ProblemTypeEnum.MissingQuantity
    )
    expect(troubleshootingStore.taskProblems[1]).toBe(ProblemTypeEnum.WrongItem)
  })

  it('should return correct target full only', () => {
    addTargetFull()
    expect(troubleshootingStore.isTargetFullOnly()).toBeTruthy()
    addCriticalProblem()
    expect(troubleshootingStore.isTargetFullOnly()).toBeFalsy()
  })

  it('should not add same problem', () => {
    const loadCarrierOccupancies = [
      {
        pcotsLocation: PcotsLocationEnum.Source,
        loadCarrier: getSourceLoadCarrier(),
        problems: [
          {
            problemCategory: ProblemCategoryEnum.Source,
            problemType: ProblemTypeEnum.DamagedLoadCarrier,
          },
        ],
      } as LoadCarrierOccupancyType,
    ]
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0])
    expect(troubleshootingStore.getOverallProblemCount).toBe(1)
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0])
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0])
    expect(troubleshootingStore.getOverallProblemCount).toBe(1)
  })

  it('should handle problem correctly from backend ', () => {
    const problem: ProblemType = {
      problemCategory: ProblemCategoryEnum.Source,
      problemType: ProblemTypeEnum.DamagedLoadCarrier,
    }
    const loadCarrierOccupancies = [
      {
        pcotsLocation: PcotsLocationEnum.Source,
        loadCarrier: getSourceLoadCarrier(),
        problems: [problem],
      } as LoadCarrierOccupancyType,
    ]
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0]) // Update problems from backend
    expect(troubleshootingStore.getOverallProblemCount).toBe(1)
    troubleshootingStore.addOrRemoveProblem(problem) // Remove problem from frontend
    expect(troubleshootingStore.getOverallProblemCount).toBe(0)
    expect(troubleshootingStore.removedProblems[0]).toStrictEqual(problem)
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0]) // Backend problem should be ignored, because it was removed on frontend
    expect(troubleshootingStore.getOverallProblemCount).toBe(0)
    troubleshootingStore.addOrRemoveProblem(problem) // Re add problem on frontend
    expect(troubleshootingStore.getOverallProblemCount).toBe(1)
    troubleshootingStore.updateProblemsByOccupancy(loadCarrierOccupancies[0])
    expect(troubleshootingStore.getOverallProblemCount).toBe(1)
  })

  it('should return false when no problems match for sending to reject', () => {
    let location: PcotsLocationType = PcotsLocationEnum.Source
    addProblemWithSendToReject(ProblemCategoryEnum.Source)
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(ProblemCategoryEnum.Task)
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    location = PcotsLocationEnum.Target
    addProblemWithSendToReject(ProblemCategoryEnum.Target)
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(ProblemCategoryEnum.Task)
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
  })

  it('should return false when problems match for sending NONE to reject', () => {
    let location: PcotsLocationType = PcotsLocationEnum.Source
    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.None
    )

    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()
    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.None
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    location = PcotsLocationEnum.Target
    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.None
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()
    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.None
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
  })

  it('should return false when problems send to reject do not match location', () => {
    let location: PcotsLocationType = PcotsLocationEnum.Target
    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.Source
    )
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.Source
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Source
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    location = PcotsLocationEnum.Source
    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(false)
  })

  it('should return true when problems send source load carrier to reject', () => {
    const location: PcotsLocationType = PcotsLocationEnum.Source

    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.Source
    )
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.Source
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Source
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
  })

  it('should return true when problems send target load carrier to reject', () => {
    const location: PcotsLocationType = PcotsLocationEnum.Target

    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.Target
    )
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
  })

  it('should return true when task problems match for sending to reject', () => {
    let location: PcotsLocationType = PcotsLocationEnum.Source

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Source
    )
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    location = PcotsLocationEnum.Target
    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Target
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
  })

  it('should return true when problems send both load carriers to reject', () => {
    let location: PcotsLocationType = PcotsLocationEnum.Source

    addProblemWithSendToReject(
      ProblemCategoryEnum.Source,
      ProblemSendToRejectOption.Both
    )
    let sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    location = PcotsLocationEnum.Target
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    location = PcotsLocationEnum.Source
    addProblemWithSendToReject(
      ProblemCategoryEnum.Target,
      ProblemSendToRejectOption.Both
    )
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    location = PcotsLocationEnum.Target
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    troubleshootingStore.clearProblems()

    addProblemWithSendToReject(
      ProblemCategoryEnum.Task,
      ProblemSendToRejectOption.Both
    )
    location = PcotsLocationEnum.Source
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
    location = PcotsLocationEnum.Target
    sendToReject = troubleshootingStore.shouldSendToReject(location)
    expect(sendToReject).toBe(true)
  })
})
