import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom, Observable } from 'rxjs';
import { DOCUMENT_ACTIONS_TEXT } from '@constants/documents/document-actions.constants';
import { DocumentType } from '@enums/documents/document-type.enum';
import { GeneratedDocument } from '@interfaces/documents/generated-document.interface';
import { DocumentApi } from '@services/documents/document-api.service';
import { openPendingTab } from '@utilities/download';

/**
 * "Open PDF" and "Download" for any record's branded PDF (made on the server). After the first use it shows the
 * document's code and unique file name. One action at a time; errors are shown inline.
 */
@Component({
  selector: 'ui-document-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './document-actions.component.html',
})
export class DocumentActions {
  readonly type = input.required<DocumentType>();
  readonly recordId = input.required<string>();
  /** Compact icon buttons (lists, cards) instead of labelled ones. */
  readonly compact = input(false);

  private readonly documents = inject(DocumentApi);

  protected readonly text = DOCUMENT_ACTIONS_TEXT;
  protected readonly busy = signal<'open' | 'download' | null>(null);
  protected readonly failed = signal(false);
  protected readonly info = signal<GeneratedDocument | null>(null);

  protected async open(): Promise<void> {
    const tab = openPendingTab();
    await this.run('open', this.documents.open(this.type(), this.recordId(), tab));
    if (this.failed()) {
      tab?.close();
    }
  }

  protected download(): Promise<void> {
    return this.run('download', this.documents.download(this.type(), this.recordId()));
  }

  protected sizeKb(bytes: number): string {
    return this.text.size(Math.max(1, Math.round(bytes / 1024)).toLocaleString('en-GB'));
  }

  private async run(action: 'open' | 'download', request: Observable<void>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(action);
    this.failed.set(false);
    try {
      await firstValueFrom(request);
      this.info.set(await firstValueFrom(this.documents.info(this.type(), this.recordId())));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(null);
    }
  }
}
