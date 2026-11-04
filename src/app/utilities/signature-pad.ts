/**
 * Handwriting on a canvas with mouse, pen or finger (pointer events): smooth round strokes in dark ink on a
 * transparent page, exported as PNG. Call `dispose()` when the canvas goes away.
 */
export class SignaturePad {
  private drawing = false;
  private strokes = 0;
  private readonly context: CanvasRenderingContext2D;
  private readonly listeners: [keyof HTMLElementEventMap, (e: PointerEvent) => void][];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    ink = '#0f2a5c',
  ) {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.scale(ratio, ratio);
    Object.assign(this.context, {
      lineWidth: 2.4,
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: ink,
    });

    this.listeners = [
      ['pointerdown', (e) => this.start(e)],
      ['pointermove', (e) => this.move(e)],
      ['pointerup', () => (this.drawing = false)],
      ['pointerleave', () => (this.drawing = false)],
    ];
    this.listeners.forEach(([name, fn]) => canvas.addEventListener(name, fn as EventListener));
  }

  get isEmpty(): boolean {
    return this.strokes === 0;
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.strokes = 0;
  }

  toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => this.canvas.toBlob(resolve, 'image/png'));
  }

  dispose(): void {
    this.listeners.forEach(([name, fn]) =>
      this.canvas.removeEventListener(name, fn as EventListener),
    );
  }

  private start(e: PointerEvent): void {
    this.drawing = true;
    this.strokes++;
    this.canvas.setPointerCapture(e.pointerId);
    this.context.beginPath();
    this.context.moveTo(e.offsetX, e.offsetY);
  }

  private move(e: PointerEvent): void {
    if (!this.drawing) {
      return;
    }
    this.context.lineTo(e.offsetX, e.offsetY);
    this.context.stroke();
  }
}
