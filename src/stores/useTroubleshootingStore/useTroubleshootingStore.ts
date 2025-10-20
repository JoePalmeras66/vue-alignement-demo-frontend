import { defineStore } from 'pinia'
import {
  LoadCarrierOccupancyType,
  ProblemDefinitionType,
  ProblemType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  PcotsLocationEnum,
  ProblemCategoryEnum,
  ProblemSendToRejectOption,
  ProblemStrategyEnum,
  ProblemTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { LoadCarrierProblemType } from '@/types/LoadCarrierProblemType'
import { PcotsLocationType } from '@/types/PcotsLocationType'

export const useTroubleshootingStore = defineStore({
  id: 'troubleshooting',
  state: () => ({
    allProblems: [] as ProblemDefinitionType[],
    sourceProblems: [] as ProblemTypeEnum[],
    targetProblems: [] as ProblemTypeEnum[],
    taskProblems: [] as ProblemTypeEnum[],
    removedProblems: [] as ProblemType[],
  }),
  getters: {
    getOverallProblemCount: (state) => {
      return (
        state.sourceProblems.length +
        state.targetProblems.length +
        state.taskProblems.length
      )
    },
    shouldSendToReject: (state) => {
      return (location: PcotsLocationType) => {
        const mySendToReject: ProblemSendToRejectOption =
          location === PcotsLocationEnum.Source
            ? ProblemSendToRejectOption.Source
            : ProblemSendToRejectOption.Target

        const problemsWithSendToReject = state.allProblems.filter(
          (p) =>
            p.sendToReject === ProblemSendToRejectOption.Both ||
            p.sendToReject === mySendToReject
        )
        if (problemsWithSendToReject.length > 0) {
          const problemsGroupedByCategory = problemsWithSendToReject.reduce(
            (acc, p) => {
              acc[p.category] = [...(acc[p.category] || []), p]
              return acc
            },
            {} as Record<ProblemCategoryEnum, ProblemDefinitionType[]>
          )

          problemsWithSendToReject.forEach((p) => {
            if (!problemsGroupedByCategory[p.category]) {
              problemsGroupedByCategory[p.category] = []
            }
            problemsGroupedByCategory[p.category].push(p)
          })

          for (const problemCategory of Object.keys(
            problemsGroupedByCategory
          ) as ProblemCategoryEnum[]) {
            const problems = problemsGroupedByCategory[
              problemCategory
            ] as ProblemDefinitionType[]

            let problemListToCheck: ProblemTypeEnum[]

            if (problemCategory === ProblemCategoryEnum.Source) {
              problemListToCheck = state.sourceProblems
            } else if (problemCategory === ProblemCategoryEnum.Target) {
              problemListToCheck = state.targetProblems
            } else {
              problemListToCheck = state.taskProblems
            }

            if (problemListToCheck.length > 0) {
              if (
                problems.some((problem) =>
                  problemListToCheck.includes(problem.type)
                )
              ) {
                return true
              }
            }
          }
          // problem was not found in list --> no sendToRejectCase
          return false
        } else {
          // check if my problems have sendToReject 'None' set
          const myCategory =
            location === PcotsLocationEnum.Source
              ? ProblemCategoryEnum.Source
              : ProblemCategoryEnum.Target
          const problemsWithSendToRejectNone = state.allProblems.filter(
            (p) =>
              p.sendToReject === ProblemSendToRejectOption.None ||
              p.category === ProblemCategoryEnum.Task ||
              p.category === myCategory
          )

          if (problemsWithSendToRejectNone.length > 0) {
            return false
          }
        }

        if (location === PcotsLocationEnum.Source) {
          return (
            state.taskProblems.length > 0 || state.sourceProblems.length > 0
          )
        }

        return state.taskProblems.length > 0 || state.targetProblems.length > 0
      }
    },
  },
  actions: {
    getProblemListByCategory(problemCategory: ProblemCategoryEnum) {
      if (problemCategory === ProblemCategoryEnum.Source) {
        return this.sourceProblems
      } else if (problemCategory === ProblemCategoryEnum.Target) {
        return this.targetProblems
      } else {
        return this.taskProblems
      }
    },
    containsProblem(problem: ProblemType) {
      const problems = this.getProblemListByCategory(problem.problemCategory)
      return problems.includes(problem.problemType)
    },
    addOrRemoveProblem(problem: ProblemType) {
      const problems = this.getProblemListByCategory(problem.problemCategory)
      if (this.containsProblem(problem)) {
        this.removedProblems.push(JSON.parse(JSON.stringify(problem)))
        problems.splice(
          problems.findIndex(
            (problemType) => problemType === problem.problemType
          ),
          1
        )
      } else {
        this.removedProblems.splice(
          this.removedProblems.findIndex(
            (removedProblem) =>
              removedProblem.problemType === problem.problemType &&
              removedProblem.problemCategory === problem.problemCategory
          ),
          1
        )
        problems.push(problem.problemType)
      }
    },
    updateProblemsByOccupancy(loadCarrierOccupancy: LoadCarrierOccupancyType) {
      if (
        (loadCarrierOccupancy.pcotsLocation === PcotsLocationEnum.Source ||
          loadCarrierOccupancy.pcotsLocation === PcotsLocationEnum.Target) &&
        loadCarrierOccupancy.problems &&
        loadCarrierOccupancy.problems.length > 0
      ) {
        for (const problem of loadCarrierOccupancy.problems) {
          if (
            !this.containsProblem(problem) &&
            !this.removedProblems.some(
              (removedProblem) =>
                removedProblem.problemCategory === problem.problemCategory &&
                removedProblem.problemType === problem.problemType
            )
          ) {
            this.addOrRemoveProblem(problem)
          }
        }
      }
    },
    clearProblems(): void {
      this.sourceProblems = [] as ProblemTypeEnum[]
      this.targetProblems = [] as ProblemTypeEnum[]
      this.taskProblems = [] as ProblemTypeEnum[]
      this.removedProblems = [] as ProblemType[]
    },
    getAllProblems(
      sourceLcId: string | undefined,
      targetLcId: string | undefined
    ): LoadCarrierProblemType[] {
      const problems: LoadCarrierProblemType[] = []
      this.sourceProblems.forEach((problem) =>
        problems.push({
          loadCarrierId: sourceLcId,
          problemType: problem,
          problemCategory: ProblemCategoryEnum.Source,
        })
      )
      this.targetProblems.forEach((problem) =>
        problems.push({
          loadCarrierId: targetLcId,
          problemType: problem,
          problemCategory: ProblemCategoryEnum.Target,
        })
      )
      this.taskProblems.forEach((problem) =>
        problems.push({
          loadCarrierId: '',
          problemType: problem,
          problemCategory: ProblemCategoryEnum.Task,
        })
      )

      return problems
    },
    hasProblemWithAbort(
      sourceLcId: string | undefined = undefined,
      targetLcId: string | undefined = undefined
    ): boolean {
      let hasProblemWithAbort = false
      const problems = this.getAllProblems(sourceLcId, targetLcId)
      for (const problem of problems) {
        hasProblemWithAbort =
          this.allProblems.filter(
            (problemDef) =>
              problemDef.type === problem.problemType &&
              problemDef.category === problem.problemCategory &&
              problemDef.strategy === ProblemStrategyEnum.Abort
          ).length > 0
        if (hasProblemWithAbort) {
          return hasProblemWithAbort
        }
      }
      return hasProblemWithAbort
    },
    isTargetFullOnly(): boolean {
      return (
        this.getOverallProblemCount === 1 &&
        this.targetProblems.length === 1 &&
        this.targetProblems[0] === ProblemTypeEnum.TargetFull
      )
    },
  },
})
