/** Text of the reaction bar a long-press or right-click opens on a message. */
export const REACTION_PICKER_TEXT = {
  react: 'React',
  reply: 'Reply',
  copy: 'Copy text',
  fewer: 'Fewer emojis',
  more: 'More emojis',
  emoji: (emoji: string, chosen: boolean) => `${chosen ? 'Remove reaction ' : 'React '}${emoji}`,
};
