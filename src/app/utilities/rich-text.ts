/** Rich text (HTML written in the document editor) as plain text: previews and searches. */
export const RichText = {
  /** The text without tags, block ends as spaces, at most `max` characters. */
  excerpt(html: string, max = 220): string {
    const plain = html
      .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/blockquote)[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain;
  },
};
