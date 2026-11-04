import { Directive, ElementRef, inject, input } from '@angular/core';
import { TapMotion } from '@enums/ui/tap-motion.enum';
import { playMotion } from '@utilities/ui/motion';

/**
 * Plays a short motion when the element is clicked: `<button tapMotion="ring">` (bell), `spin` (theme toggle),
 * `bounce` (messages), `pop` (default), `nudge` (back / reply). The keyframes live in styles/_motion.scss and
 * stop under reduced motion; a fast second click restarts the motion instead of being ignored.
 */
@Directive({
  selector: '[tapMotion]',
  host: { '(click)': 'play()' },
})
export class TapMotionDirective {
  readonly tapMotion = input<TapMotion | `${TapMotion}` | ''>(TapMotion.Pop);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  play(): void {
    playMotion(this.el, `motion-${this.tapMotion() || TapMotion.Pop}`);
  }
}
