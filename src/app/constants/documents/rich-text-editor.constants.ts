import { RichTextCommand } from '@interfaces/documents/rich-text-command.interface';

/** Toolbar of documents/rich-text-editor, in groups (separated by a divider). */
export const RICH_TEXT_TOOLBAR: readonly (readonly RichTextCommand[])[] = [
  [
    { command: 'undo', icon: 'undo', label: 'Undo' },
    { command: 'redo', icon: 'redo', label: 'Redo' },
  ],
  [
    { command: 'formatBlock', value: 'h2', icon: 'title', label: 'Heading' },
    { command: 'formatBlock', value: 'h3', icon: 'text_fields', label: 'Subheading' },
    { command: 'formatBlock', value: 'p', icon: 'notes', label: 'Paragraph' },
  ],
  [
    { command: 'bold', icon: 'format_bold', label: 'Bold' },
    { command: 'italic', icon: 'format_italic', label: 'Italic' },
    { command: 'underline', icon: 'format_underlined', label: 'Underline' },
    { command: 'strikeThrough', icon: 'strikethrough_s', label: 'Strikethrough' },
  ],
  [
    { command: 'insertUnorderedList', icon: 'format_list_bulleted', label: 'Bulleted list' },
    { command: 'insertOrderedList', icon: 'format_list_numbered', label: 'Numbered list' },
    { command: 'formatBlock', value: 'blockquote', icon: 'format_quote', label: 'Quote' },
  ],
  [
    { command: 'justifyLeft', icon: 'format_align_left', label: 'Align left' },
    { command: 'justifyCenter', icon: 'format_align_center', label: 'Center' },
    { command: 'justifyRight', icon: 'format_align_right', label: 'Align right' },
    { command: 'justifyFull', icon: 'format_align_justify', label: 'Justify' },
  ],
  [{ command: 'removeFormat', icon: 'format_clear', label: 'Clear formatting' }],
];

/** Text of documents/rich-text-editor/rich-text-editor.component. */
export const RICH_TEXT_EDITOR_TEXT = {
  insertField: 'Insert field',
  placeholder: 'Write here…',
  toolbar: 'Formatting',
};
