export interface SolveTicketData {
  code: string;
  requester: string;
}

/** What the person who solved it wrote: the solution in words, and the steps when the fix was step by step. */
export interface TicketSolution {
  resolution: string;
  steps: string[];
}
