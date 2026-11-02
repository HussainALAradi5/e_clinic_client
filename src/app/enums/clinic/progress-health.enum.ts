/** How a treatment plan is going, from its attendance — drives the colour of the progress meter. */
export enum ProgressHealth {
  NotStarted = 'not_started',
  OnTrack = 'on_track',
  Slipping = 'slipping',
  AtRisk = 'at_risk',
  Done = 'done',
  Stopped = 'stopped',
}
