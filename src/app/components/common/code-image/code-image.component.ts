import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CodeApi } from '@services/code/code-api.service';
import { CODE_IMAGE_TEXT } from '@constants/common/code-image.constants';

/**
 * Signed QR code of a record (`entity` alias + id), loaded from the API as an image. Size it with classes on the host
 * (e.g. `class="size-24"`); `pixels` is the resolution requested. A soft placeholder shows while it loads.
 */
@Component({
  selector: 'ui-code-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './code-image.component.html',
})
export class CodeImage {
  readonly entity = input.required<string>();
  readonly recordId = input.required<string>();
  readonly pixels = input(240);
  readonly label = input(CODE_IMAGE_TEXT.qrCode);

  private readonly codes = inject(CodeApi);
  protected readonly url = signal<string | null>(null);

  constructor() {
    effect(async () => {
      const [entity, id, size] = [this.entity(), this.recordId(), this.pixels()];
      const image = await firstValueFrom(this.codes.image(entity, id, { size })).catch(() => null);
      this.replace(image?.url ?? null);
    });
    inject(DestroyRef).onDestroy(() => this.replace(null));
  }

  private replace(next: string | null): void {
    const previous = this.url();
    if (previous) URL.revokeObjectURL(previous);
    this.url.set(next);
  }
}
