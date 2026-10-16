import { computed, signal } from '@angular/core';
import { isObservable, lastValueFrom } from 'rxjs';
import { MIN_BUSY_MS, SUCCESS_MS } from '@shared/constants/limits.constants';
import { ActionState } from '@shared/enums/ui/action-state.enum';
import { LockMode } from '@shared/enums/ui/button.enum';
import { ActionResult } from '@shared/interfaces/ui/action.interface';

export function toPromise(result: ActionResult): Promise<unknown> {
  return isObservable(result)
    ? lastValueFrom(result, { defaultValue: undefined })
    : Promise.resolve(result);
}

/** Resolves / rejects no earlier than `ms` after the call. */
export async function minDuration<T>(promise: Promise<T>, ms = MIN_BUSY_MS): Promise<T> {
  const [outcome] = await Promise.allSettled([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
  if (outcome.status === 'rejected') {
    throw outcome.reason;
  }
  return outcome.value;
}

/**
 * State machine behind AppButton: idle → busy → success (→ idle) | locked (`once`).
 * A second trigger while busy / locked is ignored — no double submit, Enter repeat or double tap.
 */
export class ActionLock {
  private readonly _state = signal<ActionState>(ActionState.Idle);
  readonly state = this._state.asReadonly();
  readonly busy = computed(() => this._state() === ActionState.Busy);
  readonly accepting = computed(
    () => this._state() === ActionState.Idle || this._state() === ActionState.Success,
  );

  /** Runs `task` unless already running; returns undefined when ignored or cancelled (`task` returned CANCELLED). */
  async run<T>(
    task: () => Promise<T>,
    lock: LockMode | `${LockMode}` = LockMode.UntilDone,
  ): Promise<T | undefined> {
    if (!this.accepting()) {
      return undefined;
    }
    this._state.set(ActionState.Busy);
    try {
      const result = await task();
      if (result === CANCELLED) {
        this._state.set(ActionState.Idle);
        return undefined;
      }
      this._state.set(lock === LockMode.Once ? ActionState.Locked : ActionState.Success);
      if (lock !== LockMode.Once) {
        setTimeout(
          () => this._state() === ActionState.Success && this._state.set(ActionState.Idle),
          SUCCESS_MS,
        );
      }
      return result;
    } catch (error) {
      this._state.set(ActionState.Idle);
      throw error;
    }
  }

  reset(): void {
    this._state.set(ActionState.Idle);
  }
}

/** Return this from a task to go back to idle without success (e.g. confirm dialog dismissed). */
export const CANCELLED = Symbol('cancelled');
