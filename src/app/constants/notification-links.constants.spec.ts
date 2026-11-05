import {
  NOTIFICATION_ROUTES,
  notificationLink,
  notificationLinkLabel,
} from './notification-links.constants';

describe('notification links', () => {
  it('leads to the record and names the place on the button', () => {
    expect(notificationLink({ relatedType: 'clinical_order', relatedId: 'o1' })).toBe(
      '/clinic/clinical-orders/o1',
    );
    expect(notificationLinkLabel('clinical_order')).toBe('Open result');
    expect(notificationLink({ relatedType: 'staff_request', relatedId: 'r1' })).toBe(
      '/hr/requests',
    );
    expect(notificationLinkLabel('appointment')).toBe('Open appointment');
  });

  it('has no link without a record, and a plain "Open" for types without their own label', () => {
    expect(notificationLink({ relatedType: null, relatedId: null })).toBeNull();
    expect(notificationLink({ relatedType: 'appointment', relatedId: null })).toBeNull();
    expect(notificationLinkLabel('something_new')).toBe('Open');
  });

  it('gives every record it can open its own button label', () => {
    for (const type of Object.keys(NOTIFICATION_ROUTES)) {
      expect(notificationLinkLabel(type), type).not.toBe('Open');
    }
  });
});
