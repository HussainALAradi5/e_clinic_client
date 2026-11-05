import { DatePipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CodeImage } from '@components/common/code-image/code-image.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TIME_FORMAT } from '@constants/app.constants';
import { ScanPurpose } from '@enums/code/scan-purpose.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { BarcodeDetectorConstructor } from '@interfaces/code/barcode-detector-constructor.interface';
import { BarcodeDetectorLike } from '@interfaces/code/barcode-detector-like.interface';
import { ScanHistoryEntry } from '@interfaces/code/scan-history-entry.interface';
import { ScanResult } from '@interfaces/code/scan-result.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AccessService } from '@services/auth/access.service';
import { CodeApi } from '@services/code/code-api.service';
import { humanise } from '@utilities/text';
import { SCAN_STATION_TEXT } from '@constants/system/scan-station.constants';

const DETECT_EVERY_MS = 250;
const HISTORY_SIZE = 10;

/**
 * `/system/scan` — scan station: USB / Bluetooth scanners type into the field and press Enter (keyboard wedge);
 * on phones and tablets the camera reads QR / Code 128 / Data Matrix through the BarcodeDetector API.
 */
@Component({
  selector: 'app-scan-station-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    CodeImage,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    DatePipe,
    KeyValuePipe,
    EnumLabelPipe,
  ],
  templateUrl: './scan-station.page.html',
})
export class ScanStationPage {
  private readonly codes = inject(CodeApi);
  private readonly access = inject(AccessService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly text = SCAN_STATION_TEXT;
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  protected readonly purposes = Object.values(ScanPurpose);
  protected readonly purpose = new FormControl(ScanPurpose.Identify, { nonNullable: true });
  protected readonly payload = new FormControl('', { nonNullable: true });

  protected readonly result = signal<ScanResult | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly history = signal<ScanHistoryEntry[]>([]);
  protected readonly cameraOn = signal(false);
  protected readonly codeShown = signal(false);
  protected readonly cameraSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  protected readonly canShowCode = computed(() =>
    this.access.can('(codes.read_all | codes.read_own) & codes.generate'),
  );
  protected readonly timeFormat = `${TIME_FORMAT}:ss`;
  protected readonly label = humanise;

  private stream: MediaStream | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopCamera());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const value = this.payload.value.trim();
    if (value) {
      this.resolve(value);
    }
  }

  protected async startCamera(): Promise<void> {
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
      .BarcodeDetector;
    if (!Detector) {
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch {
      this.error.set(SCAN_STATION_TEXT.cameraAccessWasDenied);
      return;
    }
    this.cameraOn.set(true);
    queueMicrotask(() => {
      const video = this.video()?.nativeElement;
      if (video && this.stream) {
        video.srcObject = this.stream;
        void video.play();
        this.detectLoop(new Detector({ formats: ['qr_code', 'code_128', 'data_matrix'] }), video);
      }
    });
  }

  protected stopCamera(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.cameraOn.set(false);
  }

  protected isScalar(value: unknown): boolean {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
  }

  private detectLoop(detector: BarcodeDetectorLike, video: HTMLVideoElement): void {
    const tick = async (): Promise<void> => {
      if (!this.cameraOn()) {
        return;
      }
      try {
        const [code] = video.readyState >= 2 ? await detector.detect(video) : [];
        if (code?.rawValue) {
          this.stopCamera();
          this.payload.setValue(code.rawValue);
          this.resolve(code.rawValue);
          return;
        }
      } catch {
        // frame not ready — try the next one
      }
      this.timer = setTimeout(() => void tick(), DETECT_EVERY_MS);
    };
    void tick();
  }

  private resolve(payload: string): void {
    this.busy.set(true);
    this.error.set(null);
    this.codeShown.set(false);
    this.codes.scan(payload, this.purpose.value).subscribe({
      next: (result) => {
        this.busy.set(false);
        this.result.set(result);
        this.remember(payload, true, `${humanise(result.entity)} ${result.code}`);
        this.payload.setValue('');
      },
      error: (e: ApiError) => {
        this.busy.set(false);
        this.result.set(null);
        this.error.set(e.message);
        this.remember(payload, false, e.message);
        this.payload.setValue('');
      },
    });
  }

  private remember(payload: string, ok: boolean, label: string): void {
    this.history.update((list) =>
      [{ at: Date.now(), payload, ok, label }, ...list].slice(0, HISTORY_SIZE),
    );
  }
}
