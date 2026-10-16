import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessService } from '@shared/services/auth/access.service';

/** `<button *hasAccess="'refunds.approve'">` — removes the element when the expression is false. */
@Directive({ selector: '[hasAccess]' })
export class HasAccessDirective {
  readonly hasAccess = input.required<string>();

  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly access = inject(AccessService);
  private readonly allowed = this.access.canSignal(() => this.hasAccess());
  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.allowed();
      if (allowed && !this.rendered) {
        this.container.createEmbeddedView(this.template);
      } else if (!allowed && this.rendered) {
        this.container.clear();
      }
      this.rendered = allowed;
    });
  }
}
