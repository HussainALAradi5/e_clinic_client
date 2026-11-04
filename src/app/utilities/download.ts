import { HttpResponse } from '@angular/common/http';

/** Saves a blob using the server's Content-Disposition filename. */
export function downloadBlob(response: HttpResponse<Blob> | Blob, fallbackName = 'download'): void {
  const blob = response instanceof Blob ? response : response.body;
  if (!blob) {
    return;
  }
  const disposition = response instanceof Blob ? null : response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const name = match ? decodeURIComponent(match[1] ?? match[2]) : fallbackName;

  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * An empty tab opened right on the user's click, to show a file that is still downloading (a tab opened after the
 * download is blocked as a popup). Null when the browser blocks it anyway.
 */
export function openPendingTab(): Window | null {
  return window.open('', '_blank');
}

/** Shows a blob (e.g. a PDF) with the browser's own viewer, in the pending tab or else a new one. */
export function openBlob(blob: Blob, tab: Window | null = null): void {
  const url = URL.createObjectURL(blob);
  if (tab && !tab.closed) {
    tab.location.href = url;
  } else {
    window.open(url, '_blank');
  }
  // The tab keeps its own reference; release ours after it has loaded.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Opens a short-lived signed link (task result / attachment); the browser downloads it directly. */
export function openSignedLink(link: { url: string }, inline = false): void {
  const anchor = Object.assign(document.createElement('a'), {
    href: link.url,
    rel: 'noopener',
    target: inline ? '_blank' : '_self',
  });
  anchor.click();
}

/** Text of a Blob (FileReader works in every browser and in the test DOM). */
export function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
