/** State machine behind AppButton (ActionLock). */
export enum ActionState {
  Idle = 'idle',
  Busy = 'busy',
  Success = 'success',
  Locked = 'locked',
}
