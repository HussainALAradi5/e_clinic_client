import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DemoAccount, DemoLogins } from '@shared/interfaces/auth/demo-account.interface';

/** Development builds: the seeded test accounts; picking one fills the sign-in form. */
@Component({
  selector: 'app-demo-accounts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule],
  host: { class: 'block' },
  templateUrl: './demo-accounts.component.html',
  styleUrl: './demo-accounts.component.scss',
})
export class DemoAccounts {
  readonly demo = input.required<DemoLogins>();
  readonly picked = output<DemoAccount>();
}
