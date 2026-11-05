import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolveTicketData } from '@interfaces/communication/solve-ticket-dialog.interface';
import { TicketSolution } from '@interfaces/communication/ticket-solution.interface';
import { SOLVE_TICKET_DIALOG_TEXT } from '@constants/communication/solve-ticket-dialog.constants';

const MAX_STEPS = 20;

/**
 * Mark a ticket solved: the solution in words (required — what was wrong and what was done) and, optionally, the
 * steps that fixed it, in order (add, remove, move). The requester sees both and is asked to confirm it works.
 */
@Component({
  selector: 'app-solve-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
  templateUrl: './solve-ticket-dialog.component.html',
  styleUrl: './solve-ticket-dialog.component.scss',
})
export class SolveTicketDialog {
  protected readonly ref = inject(MatDialogRef<SolveTicketDialog, TicketSolution>);

  protected readonly text = SOLVE_TICKET_DIALOG_TEXT;
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
    return n
      ? SOLVE_TICKET_DIALOG_TEXT.markSolved2(n, n === 1 ? 'step' : 'steps')
      : SOLVE_TICKET_DIALOG_TEXT.markSolved;
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
