import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiError } from '@interfaces/api/api-error.interface';
import { isApiError } from '@utilities/guards';

/** Error with retry: what went wrong, in words (the request id stays in the server log). */
@Component({
  selector: 'ui-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './error-state.component.html',
})
export class ErrorState {
  readonly error = input<ApiError | unknown>(null);
  readonly retry = output<void>();
  protected readonly message = computed(() => {
    const e = this.error();
    return isApiError(e) ? e.message : 'Something went wrong.';
  });
}
