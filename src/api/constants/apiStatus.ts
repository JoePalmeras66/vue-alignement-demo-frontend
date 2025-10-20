const IDLE = Symbol('IDLE')
const PENDING = Symbol('PENDING')
const SUCCESS = Symbol('SUCCESS')
const ERROR = Symbol('ERROR')

export const DEFAULT_API_STATUSES = ['IDLE', 'PENDING', 'SUCCESS', 'ERROR']

export const apiStatus = {
  IDLE,
  PENDING,
  SUCCESS,
  ERROR,
}
