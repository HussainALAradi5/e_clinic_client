import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  SolveTicketData,
  TicketSolution,
} from '@interfaces/communication/solve-ticket-dialog.interface';

const MAX_STEPS = 20;

/**
 * Mark a ticket solved: the solution in words (required — what was wrong and what was done) and, optionally, the
 * steps that fixed it, in order (add, remove, move). The requester sees both and is asked to confirm it works.
 */
@Component({
  selector: 'app-solve-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon>task_alt</mat-icon>Mark {{ data.code }} solved
    </h2>
    <mat-dialog-content>
      <p class="mt-0 mb-4 text-sm text-on-surface-variant">
        {{ data.requester }} sees what you write here and is asked to confirm it works.
      </p>
      <label class="field">
        <span>Solution <b aria-hidden="true">*</b></span>
        <textarea
          rows="4"
          maxlength="1000"
          required
          aria-label="Solution"
          placeholder="What was wrong and what you did, e.g. The print head was dirty; I cleaned it and printed a test label."
          [ngModel]="resolution()"
          (ngModelChange)="resolution.set($event)"
        ></textarea>
        <small>{{ resolution().length }} / 1000</small>
      </label>

      <p class="mt-4 mb-2 text-sm font-medium">
        Steps
        <span class="font-normal text-on-surface-variant">(optional — for a step-by-step fix)</span>
      </p>
      <ol class="steps">
        @for (step of steps(); track $index; let i = $index; let last = $last) {
          <li>
            <span class="num">{{ i + 1 }}</span>
            <input
              [attr.aria-label]="'Step ' + (i + 1)"
              [placeholder]="i === 0 ? 'e.g. Cleaned the print head' : 'Next step'"
              maxlength="500"
              [ngModel]="step"
              (ngModelChange)="set(i, $event)"
              (keydown.enter)="$event.preventDefault(); add(i)"
            />
            <button
              matIconButton
              type="button"
              matTooltip="Move up"
              aria-label="Move up"
              [disabled]="i === 0"
              (click)="move(i, -1)"
            >
              <mat-icon>arrow_upward</mat-icon>
            </button>
            <button
              matIconButton
              type="button"
              matTooltip="Move down"
              aria-label="Move down"
              [disabled]="last"
              (click)="move(i, 1)"
            >
              <mat-icon>arrow_downward</mat-icon>
            </button>
            <button
              matIconButton
              type="button"
              matTooltip="Remove step"
              aria-label="Remove step"
              [disabled]="steps().length === 1"
              (click)="remove(i)"
            >
              <mat-icon>close</mat-icon>
            </button>
          </li>
        }
      </ol>
      <button
        matButton
        type="button"
        [disabled]="steps().length >= max"
        (click)="add(steps().length - 1)"
      >
        <mat-icon>add</mat-icon> Add a step
      </button>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancel</button>
      <button matButton="filled" [disabled]="!resolution().trim()" (click)="done()">
        <mat-icon>task_alt</mat-icon> {{ label() }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .field b {
      color: var(--mat-sys-error);
    }
    .field textarea {
      padding: 0.65rem 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.6rem;
      background: var(--mat-sys-surface-container-lowest);
      color: var(--mat-sys-on-surface);
      font: inherit;
      font-size: 0.9rem;
      font-weight: 400;
      resize: vertical;
      outline: none;
    }
    .field textarea:focus,
    input:focus {
      border-color: var(--mat-sys-primary);
    }
    .field small {
      align-self: flex-end;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 400;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0 0 0.5rem;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .num {
      display: grid;
      width: 1.75rem;
      height: 1.75rem;
      flex-shrink: 0;
      place-items: center;
      margin-right: 0.35rem;
      border-radius: 9999px;
      background: var(--color-pine-700);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.6rem;
      background: var(--mat-sys-surface-container-lowest);
      color: var(--mat-sys-on-surface);
      font: inherit;
      font-size: 0.9rem;
      outline: none;
    }
  `,
})
export class SolveTicketDialog {
  protected readonly ref = inject(MatDialogRef<SolveTicketDialog, TicketSolution>);
  protected readonly data = inject<SolveTicketData>(MAT_DIALOG_DATA);
  protected readonly max = MAX_STEPS;

  protected readonly resolution = signal('');
  protected readonly steps = signal<string[]>(['']);
  protected readonly filled = computed(() =>
    this.steps()
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
  protected readonly label = computed(() => {
    const n = this.filled().length;
    return n ? `Mark solved (${n} ${n === 1 ? 'step' : 'steps'})` : 'Mark solved';
  });

  protected done(): void {
    this.ref.close({ resolution: this.resolution().trim(), steps: this.filled() });
  }

  protected set(i: number, value: string): void {
    this.steps.update((list) => list.map((s, j) => (j === i ? value : s)));
  }

  protected add(after: number): void {
    if (this.steps().length >= MAX_STEPS) return;
    this.steps.update((list) => [...list.slice(0, after + 1), '', ...list.slice(after + 1)]);
    // Focus the new step.
    queueMicrotask(() =>
      document.querySelectorAll<HTMLInputElement>('.steps input')[after + 1]?.focus(),
    );
  }

  protected remove(i: number): void {
    this.steps.update((list) => list.filter((_, j) => j !== i));
  }

  protected move(i: number, by: number): void {
    this.steps.update((list) => {
      const next = [...list];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });
  }
}
