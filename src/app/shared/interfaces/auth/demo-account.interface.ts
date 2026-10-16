/** A seeded test account offered on the sign-in page in development builds (see DEMO_USERS.md). */
export interface DemoAccount {
  role: string;
  name: string;
  email: string;
  icon: string;
  /** Needs the two-factor step after the password. */
  twoFactor?: boolean;
  /** Sign-in is refused (locked / inactive) — to test the error messages. */
  refused?: boolean;
}

/** Demo sign-in data of a development build (`environment.demoLogins`). */
export interface DemoLogins {
  password: string;
  /** A seeded one-time recovery code for the two-factor step. */
  recoveryCode: string;
  accounts: DemoAccount[];
}
