/** A record page's event log: which kind of record it is and who may read the log on that page. */
export interface ActivityRouteData {
  entity: string;
  access: string;
}
