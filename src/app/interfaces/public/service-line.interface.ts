/** A service line shown on the public website. */
export interface ServiceLine {
  icon: string;
  title: string;
  description: string;
  /** Shown as the large tile of the services grid. */
  featured?: boolean;
}
