/** Text of public/verify/verify.page (labels, messages, confirmations). */
export const VERIFY_TEXT = {
  at: 'At',
  date: 'Date',
  openFull: 'Signed in: open the full document (only if you may see this record).',
  signInToOpen: 'Staff and the patient can sign in to open the full document.',
  noDocumentWithThisCode: 'No document with this code exists.',
  thisCodeWasNotIssued:
    'This code was not issued by the clinic, or it was mistyped. Check it and try again.',
  genuineCode: 'Genuine clinic code',
  /** What a genuine code for staff only is for (its details stay hidden). */
  hiddenHint: (entity: string): string =>
    entity === 'appointment'
      ? 'This is the check-in code of a visit. Show it at the front desk when you arrive; staff scan it to check you in. Visit details are not shown here.'
      : 'This code is for clinic staff, so its details are not shown here.',
  openScanStation: 'Open the scan station',
  verifyADocument: 'Verify a document',
  scanTheQrCode:
    'Scan the QR code on an invoice, receipt, payslip or certificate from the clinic, or type the code printed under it. We only confirm that the document is genuine; no personal or medical details are shown.',
  documentCode: 'Document code',
  checkDocument: 'Check document',
  genuineDocument: 'Genuine document',
  type: 'Type',
};
