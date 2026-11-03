import {
  emergencyContactForm,
  emergencyContactLine,
  emergencyContactsForm,
  toEmergencyContacts,
} from './emergency-contacts-form';

describe('emergency contacts form', () => {
  it('trims rows, keeps blanks as null and needs a phone once a row is added', () => {
    const form = emergencyContactsForm([{ name: ' Sara ', relation: '', phone: ' +97336001122 ' }]);
    form.push(emergencyContactForm());
    expect(form.at(1).controls.phone.hasError('required')).toBe(true);
    form.at(1).controls.phone.setValue('+97339002233');
    expect(toEmergencyContacts(form)).toEqual([
      { name: 'Sara', relation: null, phone: '+97336001122' },
      { name: null, relation: null, phone: '+97339002233' },
    ]);
  });

  it('reads as one line per contact', () => {
    expect(
      emergencyContactLine({ name: 'Sara Yousif', relation: 'Sister', phone: '+97336001122' }),
    ).toBe('Sara Yousif (Sister) +97336001122');
    expect(emergencyContactLine({ name: null, relation: null, phone: '+97339002233' })).toBe(
      '+97339002233',
    );
  });
});
