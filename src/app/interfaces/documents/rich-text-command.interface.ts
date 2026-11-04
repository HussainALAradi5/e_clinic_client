/** One toolbar button of the rich-text editor: a browser editing command (and its value, e.g. `h2`). */
export interface RichTextCommand {
  command: string;
  value?: string;
  icon: string;
  label: string;
}
