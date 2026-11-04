import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import {
  SIGNATURE_CARD_TEXT,
  SIGNATURE_MAX_BYTES,
} from '@constants/settings/signature-card.constants';
import { SignatureApi } from '@services/identity/signature-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { SignaturePad } from '@utilities/signature-pad';

/** Account page card (staff): draw a signature on screen or upload one; it prints on the documents they issue. */
@Component({
  selector: 'app-signature-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './signature-card.component.html',
})
export class SignatureCard {
  private readonly api = inject(SignatureApi);
  private readonly notify = inject(NotifyService);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('pad');
  private pad: SignaturePad | null = null;

  protected readonly text = SIGNATURE_CARD_TEXT;
  protected readonly mode = signal<'draw' | 'upload'>('draw');
  protected readonly current = signal<string | null>(null);
  protected readonly busy = signal(false);

  constructor() {
    void this.load();
    afterNextRender(() => this.attachPad());
    inject(DestroyRef).onDestroy(() => {
      this.pad?.dispose();
      this.revoke();
    });
  }

  protected setMode(mode: 'draw' | 'upload'): void {
    this.mode.set(mode);
    if (mode === 'draw') {
      setTimeout(() => this.attachPad());
    }
  }

  protected clear(): void {
    this.pad?.clear();
  }

  protected async saveDrawing(): Promise<void> {
    if (!this.pad || this.pad.isEmpty) {
      this.notify.info(this.text.emptyPad);
      return;
    }
    const blob = await this.pad.toBlob();
    if (blob) {
      await this.save(blob, 'signature.png');
      this.pad.clear();
    }
  }

  protected async upload(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (file && file.size <= SIGNATURE_MAX_BYTES) {
      await this.save(file, file.name);
    } else if (file) {
      this.notify.error(this.text.uploadHint);
    }
  }

  protected async remove(): Promise<void> {
    await firstValueFrom(this.api.remove());
    this.revoke();
    this.current.set(null);
    this.notify.success(this.text.removed);
  }

  private async save(image: Blob, name: string): Promise<void> {
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.save(image, name));
      this.notify.success(this.text.saved);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    this.revoke();
    this.current.set(await firstValueFrom(this.api.current()));
  }

  private attachPad(): void {
    const canvas = this.canvas()?.nativeElement;
    if (canvas) {
      this.pad?.dispose();
      this.pad = new SignaturePad(canvas);
    }
  }

  private revoke(): void {
    const url = this.current();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
