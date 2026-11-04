/** Longest one-shot motion; the class is dropped after it even if no animationend arrives (hidden tab). */
const MAX_MOTION_MS = 1500;

/**
 * Plays a one-shot CSS animation class on an element, restarting it when it is already running (removing and
 * re-adding the class after a layout read). The class removes itself when the animation ends.
 */
export function playMotion(el: HTMLElement | null | undefined, className: string): void {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  const clear = () => el.classList.remove(className);
  el.addEventListener('animationend', clear, { once: true });
  setTimeout(clear, MAX_MOTION_MS);
}
