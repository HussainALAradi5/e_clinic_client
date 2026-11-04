/** Text of the co-pay banner in the payment dialog and on invoices. */
export const COVERAGE_TEXT = {
  insurer: (name: string, percent: string) =>
    `${name} covers ${Number(percent)} % of the insured services`,
  insurerShare: 'Claimed from the insurer',
  patientDue: 'Patient pays now',
  payAll: "Patient pays the insurer's share too (no claim)",
  reasons: {
    expired: 'The insurance had expired on the day of the visit — the patient pays it all.',
    claim_rejected: 'The insurer rejected the claim — the patient pays the rest.',
    nothing_insurable: 'None of these services is covered by insurance.',
  } as Record<string, string>,
};
