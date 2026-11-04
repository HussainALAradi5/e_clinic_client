import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TemplateDialog } from '@components/documents/template-dialog/template-dialog.component';
import { DOCUMENT_TEMPLATES_TEXT } from '@constants/documents/document-templates.constants';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { DocumentTemplate } from '@interfaces/documents/document-template.interface';
import { TemplateDialogData } from '@interfaces/documents/template-dialog-data.interface';
import { TemplatePlaceholder } from '@interfaces/documents/template-placeholder.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { EnumService } from '@services/data/enum.service';
import { DocumentTemplateApi } from '@services/documents/document-template-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { RichText } from '@utilities/rich-text';

/** Page size large enough for every template a user sees (ready-made + own). */
const ALL_TEMPLATES = 100;

/**
 * `/clinic/document-templates` — ready-made templates (copy to change) and the user's own (write from scratch,
 * edit, delete), filtered by kind, each with a preview of its wording.
 */
@Component({
  selector: 'app-document-templates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EnumLabelPipe, MatButtonModule, MatChipsModule, MatIconModule, PageHeader],
  templateUrl: './document-templates.page.html',
})
export class DocumentTemplatesPage implements OnInit {
  private readonly api = inject(DocumentTemplateApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly enums = inject(EnumService);

  protected readonly text = DOCUMENT_TEMPLATES_TEXT;
  protected readonly templates = signal<DocumentTemplate[]>([]);
  protected readonly kind = signal<WrittenDocumentKind | null>(null);
  protected readonly kinds = computed(() =>
    this.enums.options('WrittenDocumentKind').map((o) => o.value as WrittenDocumentKind),
  );
  protected readonly shown = computed(() =>
    this.templates().filter((t) => this.kind() === null || t.kind === this.kind()),
  );
  private placeholders: TemplatePlaceholder[] = [];

  async ngOnInit(): Promise<void> {
    this.placeholders = await firstValueFrom(this.api.placeholders());
    await this.load();
  }

  protected preview(t: DocumentTemplate): string {
    return RichText.excerpt(t.body);
  }

  protected async edit(template: DocumentTemplate | null): Promise<void> {
    const saved = await this.dialogs.open<TemplateDialog, TemplateDialogData, DocumentTemplate>(
      TemplateDialog,
      { template, placeholders: this.placeholders },
      { width: '920px', disableClose: true },
    );
    if (saved) {
      this.notify.success(this.text.saved);
      await this.load();
    }
  }

  protected async copy(template: DocumentTemplate): Promise<void> {
    const copy = await firstValueFrom(this.api.duplicate(template.id));
    this.notify.success(this.text.copied(copy.name));
    await this.load();
    await this.edit(copy);
  }

  protected async remove(template: DocumentTemplate): Promise<void> {
    if (await this.dialogs.confirm(this.text.deleteConfirm(template.name))) {
      await firstValueFrom(this.api.delete(template.id));
      this.notify.success(this.text.deleted);
      await this.load();
    }
  }

  private async load(): Promise<void> {
    const page = await firstValueFrom(
      this.api.list({ page: 1, perPage: ALL_TEMPLATES, sort: ['name'] }),
    );
    this.templates.set(page.data);
  }
}
