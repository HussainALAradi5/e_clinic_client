/** One line of the portal home page: an area of the portal with what is waiting there. */
export interface Glance {
  label: string;
  icon: string;
  route: string;
  detail: string;
  /** Something needs the patient's attention. */
  flag: boolean;
}
