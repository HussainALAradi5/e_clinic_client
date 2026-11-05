import { ClinicImage } from '@enums/reference/clinic-image.enum';

/** Text of system/clinic-profile page and its image fields. */
export const CLINIC_PROFILE_TEXT = {
  title: 'Clinic profile',
  subtitle:
    'The name, contacts, logo and stamp printed on every PDF — certificates, results, invoices, exports.',
  details: 'Letterhead',
  name: 'Clinic name',
  tagline: 'Tagline',
  taglineHint: 'e.g. Family medicine · Imaging · Laboratory',
  address: 'Address',
  country: 'Country',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  save: 'Save letterhead',
  saved: 'Clinic profile saved.',
  imageHint: 'PNG or JPEG, up to 1 MB, at least 64 × 64 px.',
  upload: 'Upload',
  replace: 'Replace',
  remove: 'Remove',
  uploaded: 'Image saved.',
  removed: 'Image removed.',
  images: {
    [ClinicImage.Logo]: { label: 'Logo', empty: 'The e-Clinic mark is used.' },
    [ClinicImage.Stamp]: { label: 'Clinic stamp', empty: 'No stamp: the stamp box stays empty.' },
  },
};

/** Largest image the server accepts (bytes). */
export const CLINIC_IMAGE_MAX_BYTES = 1024 * 1024;
