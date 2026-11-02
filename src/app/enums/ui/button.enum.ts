/** AppButton look. Inputs accept the enum or its value (`variant="danger"`). */
export enum ButtonVariant {
  Filled = 'filled',
  Tonal = 'tonal',
  Outlined = 'outlined',
  Text = 'text',
  Danger = 'danger',
}

export enum ButtonSize {
  Small = 'sm',
  Medium = 'md',
}

/** `until-done` = clickable again after success; `once` = stays locked (issue, submit, sign, pay). */
export enum LockMode {
  UntilDone = 'until-done',
  Once = 'once',
}

/** What to do when the permission expression is false. */
export enum AccessMode {
  Hide = 'hide',
  Disable = 'disable',
}
