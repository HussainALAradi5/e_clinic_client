import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  RICH_TEXT_EDITOR_TEXT,
  RICH_TEXT_TOOLBAR,
} from '@constants/documents/rich-text-editor.constants';
import { RichTextCommand } from '@interfaces/documents/rich-text-command.interface';
import { TemplatePlaceholder } from '@interfaces/documents/template-placeholder.interface';

/**
 * Word-like editor for documents and templates: headings, bold, italic, underline, strike, lists, quote, alignment,
 * undo / redo, and "Insert field" for `{{placeholders}}`. Bound to a FormControl holding HTML; the server cleans the
 * HTML to the same set of tags before saving and printing.
 */
@Component({
  selector: 'ui-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RichTextEditor {
  readonly control = input.required<FormControl<string>>();
  readonly placeholders = input<TemplatePlaceholder[]>([]);
  readonly label = input<string>('');

  protected readonly text = RICH_TEXT_EDITOR_TEXT;
  protected readonly toolbar = RICH_TEXT_TOOLBAR;
  private readonly page = viewChild.required<ElementRef<HTMLDivElement>>('page');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.show(this.control().value);
      // Text set from outside (a template chosen, "Auto generate") replaces what the page shows.
      this.control()
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((html) => this.show(html));
    });
  }

  protected run(item: RichTextCommand): void {
    this.page().nativeElement.focus();
    document.execCommand(item.command, false, item.value);
    this.read();
  }

  protected insert(field: TemplatePlaceholder): void {
    this.page().nativeElement.focus();
    document.execCommand('insertText', false, field.token);
    this.read();
  }

  /** The page changed by typing or a command → the control (without echoing back to the page). */
  protected read(): void {
    const html = this.page().nativeElement.innerHTML;
    if (html !== this.control().value) {
      this.control().setValue(html, { emitEvent: false });
      this.control().markAsDirty();
    }
  }

  private show(html: string): void {
    const page = this.page().nativeElement;
    if (page.innerHTML !== html) {
      page.innerHTML = html;
    }
  }
}
