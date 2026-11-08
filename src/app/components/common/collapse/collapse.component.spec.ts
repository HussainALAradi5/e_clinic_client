import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Collapse } from '@components/common/collapse/collapse.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Collapse],
  template: `<ui-collapse label="2 more" [(expanded)]="open"><p id="inside">Body</p></ui-collapse>`,
})
class Host {
  readonly open = signal(false);
}

function header(fixture: ComponentFixture<Host>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button');
}

function panel(fixture: ComponentFixture<Host>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="region"]');
}

async function setup(): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return fixture;
}

describe('Collapse', () => {
  it('starts collapsed, shows the label and projects the content', async () => {
    const fixture = await setup();
    expect(header(fixture).textContent).toContain('2 more');
    expect(header(fixture).getAttribute('aria-expanded')).toBe('false');
    expect(panel(fixture).classList.contains('panel-open')).toBe(false);
    expect(panel(fixture).querySelector('#inside')?.textContent).toBe('Body');
  });

  it('toggles from a native button, so Enter and Space work', async () => {
    const fixture = await setup();
    expect(header(fixture).type).toBe('button');

    header(fixture).click();
    await fixture.whenStable();
    expect(header(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(panel(fixture).classList.contains('panel-open')).toBe(true);
    expect(fixture.componentInstance.open()).toBe(true);

    header(fixture).click();
    await fixture.whenStable();
    expect(header(fixture).getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('follows the expanded input', async () => {
    const fixture = await setup();
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(header(fixture).getAttribute('aria-expanded')).toBe('true');
  });

  it('ties the header and the panel together', async () => {
    const fixture = await setup();
    expect(header(fixture).getAttribute('aria-controls')).toBe(panel(fixture).id);
    expect(panel(fixture).getAttribute('aria-labelledby')).toBe(header(fixture).id);
  });
});
