import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { LoadingService } from '@shared/services/ui/loading.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the global progress bar only while requests are pending', async () => {
    const fixture = TestBed.createComponent(App);
    const loading = TestBed.inject(LoadingService);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();

    loading.start();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).not.toBeNull();
  });
});
