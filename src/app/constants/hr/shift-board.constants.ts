/** Text of hr/shift-board/shift-board.page (labels, messages, confirmations). */
export const SHIFT_BOARD_TEXT = {
  onlyAnEmptyShiftCan:
    'Only an empty shift can be deleted. Move its people to another shift first.',
  deleteShift: 'Delete shift',
  shiftCreated: (p0: unknown, p1: unknown) => `Shift ${p0} · ${p1} created.`,
  delete: (p0: unknown, p1: unknown) => `Delete ${p0} · ${p1}?`,
  newShift: 'New shift',
  shifts: 'shifts ·',
  people: 'people',
  dropToPutOn: 'Drop to put on',
  noShift: 'No shift',
  aShift: 'a shift',
  dropToTakeOff: 'Drop to take off the shift',
  editHours: 'Edit hours',
  withoutAShiftLateness:
    "Without a shift, lateness and overtime use the person's own working hours. Drag them onto a shift.",
  takeOffThisShift: 'Take off this shift',
  shiftsTitle: 'Shifts',
  fixedOrFlexibleHours:
    'Fixed or flexible hours, and who works them. Drag someone onto a shift card, or add them by name.',
  shiftActions: 'Shift actions',
  addSomeoneToThis: 'Add someone to this shift',
  peopleOnThisShift: 'People on this shift',
  personNeeds: 'person needs',
  peopleNeed: 'people need',
  move: 'Move ',
  everyoneHasAShift: 'Everyone has a shift',
  nobodyOnThisShift: 'Nobody on this shift yet',
  addSomeoneByName: 'Add someone by name above, or drag them here from another shift.',
};
