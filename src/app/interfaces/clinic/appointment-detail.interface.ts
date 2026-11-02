export /** One step of the status trail. */
interface StatusStep {
  status: string;
  at: string;
  by: string | null;
}
