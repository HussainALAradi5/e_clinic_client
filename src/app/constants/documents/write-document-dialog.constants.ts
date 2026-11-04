/** Text of documents/write-document-dialog/write-document-dialog.component. */
export const WRITE_DOCUMENT_DIALOG_TEXT = {
  title: (patient: string) => `Write a document for ${patient}`,
  kind: 'Document',
  start: 'Start from',
  blank: 'Blank page',
  readyMade: 'Ready-made',
  mine: 'Mine',
  generate: 'Auto generate',
  generateHint: 'Fills the patient, visit, diagnosis and your name into the text.',
  documentTitle: 'Title',
  body: 'Text',
  save: 'Save',
  done: 'Done',
  saved: (code: string) => `${code} saved.`,
};
