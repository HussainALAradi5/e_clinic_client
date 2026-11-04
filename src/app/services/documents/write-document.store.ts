import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { DocumentTemplate } from '@interfaces/documents/document-template.interface';
import { TemplatePlaceholder } from '@interfaces/documents/template-placeholder.interface';
import { WrittenDocument } from '@interfaces/documents/written-document.interface';
import { DocumentTemplateApi } from '@services/documents/document-template-api.service';
import { WrittenDocumentApi } from '@services/documents/written-document-api.service';
import { EnumService } from '@services/data/enum.service';

/** Page size large enough for every template a user sees (ready-made + own). */
const ALL_TEMPLATES = 100;

/**
 * State of the write-document dialog (one per dialog: provide it in the component). Loads the templates and fields,
 * fills a template from the visit ("auto generate"), and saves the document. The component only renders.
 */
@Injectable()
export class WriteDocumentStore {
  private readonly templatesApi = inject(DocumentTemplateApi);
  private readonly documents = inject(WrittenDocumentApi);
  private readonly enums = inject(EnumService);

  readonly form = new FormGroup({
    kind: new FormControl(WrittenDocumentKind.MedicalReport, { nonNullable: true }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(160)],
    }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly templates = signal<DocumentTemplate[]>([]);
  readonly placeholders = signal<TemplatePlaceholder[]>([]);
  readonly templateId = signal<string | null>(null);
  readonly kind = signal(WrittenDocumentKind.MedicalReport);
  readonly generating = signal(false);
  /** The saved document, once saved (the dialog then offers its PDF). */
  readonly saved = signal<WrittenDocument | null>(null);
  readonly forKind = computed(() => this.templates().filter((t) => t.kind === this.kind()));

  private appointmentId = '';

  async load(appointmentId: string, nurseOnly: boolean): Promise<void> {
    this.appointmentId = appointmentId;
    if (nurseOnly) {
      this.setKind(WrittenDocumentKind.AttendanceCertificate);
    }
    const [page, fields] = await Promise.all([
      firstValueFrom(this.templatesApi.list({ page: 1, perPage: ALL_TEMPLATES, sort: ['name'] })),
      firstValueFrom(this.templatesApi.placeholders()),
    ]);
    this.templates.set(page.data);
    this.placeholders.set(fields);
  }

  setKind(kind: WrittenDocumentKind): void {
    this.kind.set(kind);
    this.form.controls.kind.setValue(kind);
    this.templateId.set(null);
  }

  /** Picks a template (or the blank page) and fills it from the visit at once. */
  async useTemplate(template: DocumentTemplate | null): Promise<void> {
    this.templateId.set(template?.id ?? null);
    this.form.controls.title.setValue(
      template?.name ?? this.enums.label('WrittenDocumentKind', this.kind()),
    );
    await this.generate(template ? null : this.form.controls.body.value);
  }

  /** "Auto generate": the chosen template (or the text written so far) with every field filled from the visit. */
  async generate(ownText: string | null = this.form.controls.body.value): Promise<void> {
    this.generating.set(true);
    try {
      const id = this.templateId();
      const body = await firstValueFrom(
        this.documents.draft(this.appointmentId, this.kind(), id, id ? null : ownText || '<p></p>'),
      );
      this.form.controls.body.setValue(body);
    } finally {
      this.generating.set(false);
    }
  }

  async save(): Promise<WrittenDocument> {
    const v = this.form.getRawValue();
    const document = await firstValueFrom(
      this.documents.write(this.appointmentId, {
        kind: v.kind,
        title: v.title.trim(),
        body: v.body,
        templateId: this.templateId(),
      }),
    );
    this.saved.set(document);
    return document;
  }
}
