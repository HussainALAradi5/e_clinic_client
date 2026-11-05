# e-Clinic — Web client (Angular)

[![tests](https://github.com/HussainALAradi5/e_clinic_client/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/HussainALAradi5/e_clinic_client/actions/workflows/tests.yml) [![licence: MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

## Live demo

| | Address |
|---|---|
| Web app (staff and patient portal) | https://e-clinic-web.onrender.com |
| API | https://e-clinic-api.onrender.com |

Free Render instances sleep when idle: the first visit can take about a minute to wake the API. Demo accounts
(one per role: patient, receptionist, doctor, nurse, pharmacist, cashier, accountant, HR, admin) are available on
request.

**Screenshots:** every role and feature in light and dark — [below](#screenshots)
(staff chat, support tickets, notifications, front desk, clinic, billing, pharmacy, HR, accounting, admin).

---

## What it is

The web client of **e-Clinic**, a clinic management system: one Angular app with a **staff workspace** (front desk,
doctors, nurses, pharmacy, cashier, accountant, HR, admin — each sees the pages their role allows) and a **patient
portal** (visits and booking, results, prescriptions, invoices, messages, profile). It talks to the
[Laravel API](https://github.com/HussainALAradi5/e_clinic_server); the [Flutter app](https://github.com/HussainALAradi5/e_clinic_mobile)
uses the same API.

| | |
|---|---|
| Framework | Angular 21 (standalone components, signals, OnPush), Angular Material 21, Tailwind CSS 4, NgRx Signals |
| Structure | Layer first: `components`, `pages`, `services`, `interfaces`, `enums`, `constants`, `utilities`, `validations`, `middlewares`, `config` — each with module folders; one endpoint map (`config/endpoints.ts`), UI text in constants |
| Lists | One generic list page driven by the server's schema: search, filters, saved views, sorting, paging, bulk actions, Excel import / export — all on the server |
| Features | Booking with free slots, check-in by QR code, visit workspace, results with images, pharmacy dispensing, invoices with payment state and paid-by filters, cash desk, journal entries, payroll, staff chat (websockets), support tickets, notifications with browser push and a sound per kind, light and dark themes |
| Quality | Strict TypeScript, unit tests (Vitest), a smoke run over every page for every role |

<!-- hierarchy:start -->
## Hierarchy

### Routes and layouts

```mermaid
flowchart TD
    app["AppComponent · app.routes.ts"]:::root
    app --> pub["PublicLayout  /  (public website, /verify)"]:::layout
    app --> auth["AuthLayout  /login …  (guestGuard)"]:::layout
    app --> print["/print/…  (authGuard) — printable documents"]:::layout
    app --> portal["PortalLayout  /portal  (authGuard · patientGuard)"]:::layout
    app --> shell["ShellLayout  /  (authGuard · staffGuard)"]:::layout
    portal --> pm["modules/portal — visits, booking, results, invoices, profile"]:::module
    shell --> dash["/dashboard"]:::module
    shell --> sys["modules/system  /system — users, roles, audit, scan …"]:::module
    shell --> cli["modules/clinic  /clinic — patients, visits, doctors, rooms …"]:::module
    shell --> bil["modules/billing  /billing — invoices, payments, fees, packages …"]:::module
    shell --> pha["modules/pharmacy  /pharmacy"]:::module
    shell --> hr["modules/hr  /hr — staff, attendance, leaves, payroll, earnings"]:::module
    shell --> acc["modules/accounting  /accounting — journal, reports, month summary"]:::module
    shell --> com["modules/communication  /chat · /support"]:::module
    shell --> ref["modules/reference  /reference"]:::module
    classDef root fill:#0f3d3e,color:#fff,stroke:#0f3d3e
    classDef layout fill:#e6f4f1,stroke:#2f7d6d,color:#0f3d3e
    classDef module fill:#fff,stroke:#9fb8b2,color:#0f3d3e
```

Every area is lazy: its route file is downloaded only when its guard (`accessGuard('<right>')`) lets the user in. Refused →
home page with an "Unauthorized access" toast (see `services/auth/access-notice.service.ts`).

### How a screen reaches the API

```mermaid
flowchart LR
    page["pages/&lt;area&gt;/…page.ts<br/>(route screen)"] --> comp["components/&lt;area&gt;/…<br/>(.ts · .html · .scss)"]
    page --> svc["services/&lt;area&gt;/…-api.service.ts"]
    comp --> svc
    svc --> api["services/api/api-client.service.ts<br/>(one HttpClient)"]
    api --> mw["middlewares/interceptors<br/>url · auth · request id · idempotency · case · loading · errors"]
    mw --> server[("Laravel API")]
    page -. text, options .-> const["constants/"]
    comp -. types .-> ifc["interfaces/ · enums/"]
    svc -. paths .-> cfg["config/endpoints.ts"]
```

### Folders (layer first, then area)

```text
src/app/
├── app.ts · app.html · app.config.ts · app.routes.ts   ← root: providers, interceptors, top routes
├── config/          3 files  ← API base URL, endpoint map, date format
│       date
├── modules/        15 files  ← thin lazy route files per area (no logic)
│       accounting · billing · clinic · communication · hr · pharmacy · portal · public · reference
│       system
├── pages/         258 files  ← routed screens (…Page); compose components
│       accounting · billing · clinic · common · communication · dashboard · dev · hr · pharmacy
│       portal · public · reference · system
├── components/    390 files  ← reusable UI, one folder per component (.ts + .html + .scss)
│       accounting · billing · clinic · common · communication · documents · hr · layout · notification
│       pharmacy · portal · reference · settings · system
├── services/       96 files  ← API calls and state; one ApiClient
│       accounting · api · attachment · auth · billing · clinic · code · communication · data
│       documents · finance · hr · identity · notification · pharmacy · portal · reference · system
│       task · ui · upload · view
├── middlewares/     4 files  ← route guards and HTTP interceptors
│       guards · interceptors
├── interfaces/    399 files  ← one type per file (wire DTOs and UI types)
│       accounting · api · attachment · auth · billing · bulk · clinic · code · common · communication
│       dev · documents · finance · hr · identity · list · notification · pharmacy · portal · public
│       reference · system · task · ui · upload · view
├── enums/         109 files  ← enums mirrored from the server
│       accounting · api · attachment · auth · billing · clinic · code · communication · documents
│       finance · hr · identity · list · notification · pharmacy · reference · shared · task · ui
│       upload
├── constants/     141 files  ← every UI text, option list and limit
│       accounting · billing · clinic · common · communication · dashboard · dev · documents · hr
│       layout · notification · pharmacy · portal · public · reference · settings · system · ui
├── utilities/      45 files  ← pure helpers (money, dates, lists)
│       accounting · billing · clinic · communication · hr · ui
├── validations/     1 files  ← reusable form validators
├── directives/      2 files  ← shared directives (tap motion …)
└── pipes/           7 files  ← shared pipes (money, enum label …)
```
<!-- hierarchy:end -->

## Run it locally

```bash
npm install
npm start          # http://localhost:4200 — expects the API on http://localhost:8000 (see e_clinic_server)
```

## Tests and build

```bash
npx ng test --watch=false
npx ng build
```

## Screenshots

Taken from the running web app (1440 × 900, phone width 390 × 844 where noted) against the local API with the demo data, signed in as each demo user. Every screen is shown in **light** and **dark**. The same images, with notes per feature, are in the [documentation repository](https://github.com/HussainALAradi5/e_clinic_documentation/tree/main/screenshots).

Sections: [Public](#public) · [Patient](#patient) · [Receptionist](#receptionist) · [Doctor](#doctor) · [Nurse](#nurse) · [Pharmacist](#pharmacist) · [Cashier](#cashier) · [Accountant](#accountant) · [HR](#hr) · [Admin](#admin) · [Staff chat](#staff-chat) · [Support tickets](#support-tickets) · [Notifications](#notifications)

### Public

| Screen | Light | Dark |
|---|---|---|
| Landing | ![](docs/screenshots/public/landing-light.png) | ![](docs/screenshots/public/landing-dark.png) |
| Sign in | ![](docs/screenshots/public/sign-in-light.png) | ![](docs/screenshots/public/sign-in-dark.png) |
| Sign in wrong password | ![](docs/screenshots/public/sign-in-wrong-password-light.png) | ![](docs/screenshots/public/sign-in-wrong-password-dark.png) |

### Patient

| Screen | Light | Dark |
|---|---|---|
| Book visit | ![](docs/screenshots/patient/book-visit-light.png) | ![](docs/screenshots/patient/book-visit-dark.png) |
| Invoices | ![](docs/screenshots/patient/invoices-light.png) | ![](docs/screenshots/patient/invoices-dark.png) |
| Portal home | ![](docs/screenshots/patient/portal-home-light.png) | ![](docs/screenshots/patient/portal-home-dark.png) |
| Portal sick leaves | ![](docs/screenshots/patient/portal-sick-leaves-light.png) | ![](docs/screenshots/patient/portal-sick-leaves-dark.png) |
| Treatments | ![](docs/screenshots/patient/treatments-light.png) | ![](docs/screenshots/patient/treatments-dark.png) |

### Receptionist

| Screen | Light | Dark |
|---|---|---|
| Calendar | ![](docs/screenshots/receptionist/calendar-light.png) | ![](docs/screenshots/receptionist/calendar-dark.png) |
| Calendar doctor search | ![](docs/screenshots/receptionist/calendar-doctor-search-light.png) | ![](docs/screenshots/receptionist/calendar-doctor-search-dark.png) |
| Dashboard | ![](docs/screenshots/receptionist/dashboard-light.png) | ![](docs/screenshots/receptionist/dashboard-dark.png) |
| Front desk | ![](docs/screenshots/receptionist/front-desk-light.png) | ![](docs/screenshots/receptionist/front-desk-dark.png) |
| Patient file | ![](docs/screenshots/receptionist/patient-file-light.png) | ![](docs/screenshots/receptionist/patient-file-dark.png) |
| Sick leaves | ![](docs/screenshots/receptionist/sick-leaves-light.png) | ![](docs/screenshots/receptionist/sick-leaves-dark.png) |

### Doctor

| Screen | Light | Dark |
|---|---|---|
| Appointments | ![](docs/screenshots/doctor/appointments-light.png) | ![](docs/screenshots/doctor/appointments-dark.png) |
| Clinical orders | ![](docs/screenshots/doctor/clinical-orders-light.png) | ![](docs/screenshots/doctor/clinical-orders-dark.png) |
| Dashboard | ![](docs/screenshots/doctor/dashboard-light.png) | ![](docs/screenshots/doctor/dashboard-dark.png) |
| Dental xray print | ![](docs/screenshots/doctor/dental-xray-print-light.png) | ![](docs/screenshots/doctor/dental-xray-print-dark.png) |
| Dentist appointments | ![](docs/screenshots/doctor/dentist-appointments-light.png) | ![](docs/screenshots/doctor/dentist-appointments-dark.png) |
| Dentist patients only | ![](docs/screenshots/doctor/dentist-patients-only-light.png) | ![](docs/screenshots/doctor/dentist-patients-only-dark.png) |
| Sick leave dialog | ![](docs/screenshots/doctor/sick-leave-dialog-light.png) | ![](docs/screenshots/doctor/sick-leave-dialog-dark.png) |
| Sick leave print | ![](docs/screenshots/doctor/sick-leave-print-light.png) | ![](docs/screenshots/doctor/sick-leave-print-dark.png) |
| Visit | ![](docs/screenshots/doctor/visit-light.png) | ![](docs/screenshots/doctor/visit-dark.png) |
| Xray report print | ![](docs/screenshots/doctor/xray-report-print-light.png) | ![](docs/screenshots/doctor/xray-report-print-dark.png) |

### Nurse

| Screen | Light | Dark |
|---|---|---|
| Ask excuse dialog | ![](docs/screenshots/nurse/ask-excuse-dialog-light.png) | ![](docs/screenshots/nurse/ask-excuse-dialog-dark.png) |
| Dashboard | ![](docs/screenshots/nurse/dashboard-light.png) | ![](docs/screenshots/nurse/dashboard-dark.png) |
| My patients only | ![](docs/screenshots/nurse/my-patients-only-light.png) | ![](docs/screenshots/nurse/my-patients-only-dark.png) |
| My requests | ![](docs/screenshots/nurse/my-requests-light.png) | ![](docs/screenshots/nurse/my-requests-dark.png) |
| Treatment plan | ![](docs/screenshots/nurse/treatment-plan-light.png) | ![](docs/screenshots/nurse/treatment-plan-dark.png) |
| Treatments | ![](docs/screenshots/nurse/treatments-light.png) | ![](docs/screenshots/nurse/treatments-dark.png) |

### Pharmacist

| Screen | Light | Dark |
|---|---|---|
| Dispense | ![](docs/screenshots/pharmacist/dispense-light.png) | ![](docs/screenshots/pharmacist/dispense-dark.png) |
| Medication | ![](docs/screenshots/pharmacist/medication-light.png) | ![](docs/screenshots/pharmacist/medication-dark.png) |
| Medicine move lot | ![](docs/screenshots/pharmacist/medicine-move-lot-light.png) | ![](docs/screenshots/pharmacist/medicine-move-lot-dark.png) |
| Medicine places | ![](docs/screenshots/pharmacist/medicine-places-light.png) | ![](docs/screenshots/pharmacist/medicine-places-dark.png) |
| Medicines expiry added | ![](docs/screenshots/pharmacist/medicines-expiry-added-light.png) | ![](docs/screenshots/pharmacist/medicines-expiry-added-dark.png) |
| Stock | ![](docs/screenshots/pharmacist/stock-light.png) | ![](docs/screenshots/pharmacist/stock-dark.png) |
| Stock by place | ![](docs/screenshots/pharmacist/stock-by-place-light.png) | ![](docs/screenshots/pharmacist/stock-by-place-dark.png) |

### Cashier

| Screen | Light | Dark |
|---|---|---|
| Cashier desk | ![](docs/screenshots/cashier/cashier-desk-light.png) | ![](docs/screenshots/cashier/cashier-desk-dark.png) |
| Invoice | ![](docs/screenshots/cashier/invoice-light.png) | ![](docs/screenshots/cashier/invoice-dark.png) |
| Invoices | ![](docs/screenshots/cashier/invoices-light.png) | ![](docs/screenshots/cashier/invoices-dark.png) |

### Accountant

| Screen | Light | Dark |
|---|---|---|
| Chart of accounts | ![](docs/screenshots/accountant/chart-of-accounts-light.png) | ![](docs/screenshots/accountant/chart-of-accounts-dark.png) |
| Journal | ![](docs/screenshots/accountant/journal-light.png) | ![](docs/screenshots/accountant/journal-dark.png) |
| Reports | ![](docs/screenshots/accountant/reports-light.png) | ![](docs/screenshots/accountant/reports-dark.png) |

### HR

| Screen | Light | Dark |
|---|---|---|
| Attendance | ![](docs/screenshots/hr/attendance-light.png) | ![](docs/screenshots/hr/attendance-dark.png) |
| Attendance shift | ![](docs/screenshots/hr/attendance-shift-light.png) | ![](docs/screenshots/hr/attendance-shift-dark.png) |
| Employees | ![](docs/screenshots/hr/employees-light.png) | ![](docs/screenshots/hr/employees-dark.png) |
| Leaves | ![](docs/screenshots/hr/leaves-light.png) | ![](docs/screenshots/hr/leaves-dark.png) |
| Payroll run | ![](docs/screenshots/hr/payroll-run-light.png) | ![](docs/screenshots/hr/payroll-run-dark.png) |
| Requests approve dialog | ![](docs/screenshots/hr/requests-approve-dialog-light.png) | ![](docs/screenshots/hr/requests-approve-dialog-dark.png) |
| Requests decided | ![](docs/screenshots/hr/requests-decided-light.png) | ![](docs/screenshots/hr/requests-decided-dark.png) |
| Requests reject dialog | ![](docs/screenshots/hr/requests-reject-dialog-light.png) | ![](docs/screenshots/hr/requests-reject-dialog-dark.png) |
| Requests to review | ![](docs/screenshots/hr/requests-to-review-light.png) | ![](docs/screenshots/hr/requests-to-review-dark.png) |
| Settings switches | ![](docs/screenshots/hr/settings-switches-light.png) | ![](docs/screenshots/hr/settings-switches-dark.png) |
| Shifts board | ![](docs/screenshots/hr/shifts-board-light.png) | ![](docs/screenshots/hr/shifts-board-dark.png) |
| Shifts drag | ![](docs/screenshots/hr/shifts-drag-light.png) | ![](docs/screenshots/hr/shifts-drag-dark.png) |
| Shifts new flexible | ![](docs/screenshots/hr/shifts-new-flexible-light.png) | ![](docs/screenshots/hr/shifts-new-flexible-dark.png) |
| Shifts no shift | ![](docs/screenshots/hr/shifts-no-shift-light.png) | ![](docs/screenshots/hr/shifts-no-shift-dark.png) |

### Admin

| Screen | Light | Dark |
|---|---|---|
| Access matrix | ![](docs/screenshots/admin/access-matrix-light.png) | ![](docs/screenshots/admin/access-matrix-dark.png) |
| Audit log | ![](docs/screenshots/admin/audit-log-light.png) | ![](docs/screenshots/admin/audit-log-dark.png) |
| Dashboard | ![](docs/screenshots/admin/dashboard-light.png) | ![](docs/screenshots/admin/dashboard-dark.png) |
| Users | ![](docs/screenshots/admin/users-light.png) | ![](docs/screenshots/admin/users-dark.png) |

### Staff chat

| Screen | Light | Dark |
|---|---|---|
| Admin deleted chats | ![](docs/screenshots/chat/admin-deleted-chats-light.png) | ![](docs/screenshots/chat/admin-deleted-chats-dark.png) |
| Doctor chat menu | ![](docs/screenshots/chat/doctor-chat-menu-light.png) | ![](docs/screenshots/chat/doctor-chat-menu-dark.png) |
| Doctor chat settings | ![](docs/screenshots/chat/doctor-chat-settings-light.png) | ![](docs/screenshots/chat/doctor-chat-settings-dark.png) |
| Doctor direct chat | ![](docs/screenshots/chat/doctor-direct-chat-light.png) | ![](docs/screenshots/chat/doctor-direct-chat-dark.png) |
| Doctor filter groups | ![](docs/screenshots/chat/doctor-filter-groups-light.png) | ![](docs/screenshots/chat/doctor-filter-groups-dark.png) |
| Doctor filter unread | ![](docs/screenshots/chat/doctor-filter-unread-light.png) | ![](docs/screenshots/chat/doctor-filter-unread-dark.png) |
| Doctor group info | ![](docs/screenshots/chat/doctor-group-info-light.png) | ![](docs/screenshots/chat/doctor-group-info-dark.png) |
| Doctor live messages | ![](docs/screenshots/chat/doctor-live-messages-light.png) | ![](docs/screenshots/chat/doctor-live-messages-dark.png) |
| Doctor mention | ![](docs/screenshots/chat/doctor-mention-light.png) | ![](docs/screenshots/chat/doctor-mention-dark.png) |
| Doctor pharmacy group | ![](docs/screenshots/chat/doctor-pharmacy-group-light.png) | ![](docs/screenshots/chat/doctor-pharmacy-group-dark.png) |
| Doctor react menu | ![](docs/screenshots/chat/doctor-react-menu-light.png) | ![](docs/screenshots/chat/doctor-react-menu-dark.png) |
| Doctor react more | ![](docs/screenshots/chat/doctor-react-more-light.png) | ![](docs/screenshots/chat/doctor-react-more-dark.png) |
| Doctor reply compose | ![](docs/screenshots/chat/doctor-reply-compose-light.png) | ![](docs/screenshots/chat/doctor-reply-compose-dark.png) |
| Doctor reply sent | ![](docs/screenshots/chat/doctor-reply-sent-light.png) | ![](docs/screenshots/chat/doctor-reply-sent-dark.png) |
| Doctor ward group | ![](docs/screenshots/chat/doctor-ward-group-light.png) | ![](docs/screenshots/chat/doctor-ward-group-dark.png) |
| Doctor2 member view | ![](docs/screenshots/chat/doctor2-member-view-light.png) | ![](docs/screenshots/chat/doctor2-member-view-dark.png) |
| Mobile chat | <img src="docs/screenshots/chat/mobile-chat-light.png" width="200"> | <img src="docs/screenshots/chat/mobile-chat-dark.png" width="200"> |
| Mobile list | <img src="docs/screenshots/chat/mobile-list-light.png" width="200"> | <img src="docs/screenshots/chat/mobile-list-dark.png" width="200"> |
| Pharmacist leader view | ![](docs/screenshots/chat/pharmacist-leader-view-light.png) | ![](docs/screenshots/chat/pharmacist-leader-view-dark.png) |
| Reception direct | ![](docs/screenshots/chat/reception-direct-light.png) | ![](docs/screenshots/chat/reception-direct-dark.png) |
| Reception not a member | ![](docs/screenshots/chat/reception-not-a-member-light.png) | ![](docs/screenshots/chat/reception-not-a-member-dark.png) |

### Support tickets

| Screen | Light | Dark |
|---|---|---|
| Admin filter open urgent | ![](docs/screenshots/tickets/admin-filter-open-urgent-light.png) | ![](docs/screenshots/tickets/admin-filter-open-urgent-dark.png) |
| Admin filter opened by | ![](docs/screenshots/tickets/admin-filter-opened-by-light.png) | ![](docs/screenshots/tickets/admin-filter-opened-by-dark.png) |
| Admin filter priority options | ![](docs/screenshots/tickets/admin-filter-priority-options-light.png) | ![](docs/screenshots/tickets/admin-filter-priority-options-dark.png) |
| Admin filter solved | ![](docs/screenshots/tickets/admin-filter-solved-light.png) | ![](docs/screenshots/tickets/admin-filter-solved-dark.png) |
| Admin list | ![](docs/screenshots/tickets/admin-list-light.png) | ![](docs/screenshots/tickets/admin-list-dark.png) |
| Admin list page 2 | ![](docs/screenshots/tickets/admin-list-page-2-light.png) | ![](docs/screenshots/tickets/admin-list-page-2-dark.png) |
| Admin mark solved | ![](docs/screenshots/tickets/admin-mark-solved-light.png) | ![](docs/screenshots/tickets/admin-mark-solved-dark.png) |
| Admin ticket in progress | ![](docs/screenshots/tickets/admin-ticket-in-progress-light.png) | ![](docs/screenshots/tickets/admin-ticket-in-progress-dark.png) |
| Admin ticket pending | ![](docs/screenshots/tickets/admin-ticket-pending-light.png) | ![](docs/screenshots/tickets/admin-ticket-pending-dark.png) |
| Doctor solved ticket | ![](docs/screenshots/tickets/doctor-solved-ticket-light.png) | ![](docs/screenshots/tickets/doctor-solved-ticket-dark.png) |
| Flow 1 · new ticket with photo | ![](docs/screenshots/tickets/flow-1-new-ticket-with-photo-light.png) | ![](docs/screenshots/tickets/flow-1-new-ticket-with-photo-dark.png) |
| Flow 2 · ticket with photo | ![](docs/screenshots/tickets/flow-2-ticket-with-photo-light.png) | ![](docs/screenshots/tickets/flow-2-ticket-with-photo-dark.png) |
| Flow 3 · solve with steps | ![](docs/screenshots/tickets/flow-3-solve-with-steps-light.png) | ![](docs/screenshots/tickets/flow-3-solve-with-steps-dark.png) |
| Flow 4 · solved awaiting | ![](docs/screenshots/tickets/flow-4-solved-awaiting-light.png) | ![](docs/screenshots/tickets/flow-4-solved-awaiting-dark.png) |
| Flow 5 · requester asked | ![](docs/screenshots/tickets/flow-5-requester-asked-light.png) | ![](docs/screenshots/tickets/flow-5-requester-asked-dark.png) |
| Flow 6 · declined | ![](docs/screenshots/tickets/flow-6-declined-light.png) | ![](docs/screenshots/tickets/flow-6-declined-dark.png) |
| Flow 7 · confirmed | ![](docs/screenshots/tickets/flow-7-confirmed-light.png) | ![](docs/screenshots/tickets/flow-7-confirmed-dark.png) |
| Flow 8 · desk awaiting answer | ![](docs/screenshots/tickets/flow-8-desk-awaiting-answer-light.png) | ![](docs/screenshots/tickets/flow-8-desk-awaiting-answer-dark.png) |
| Nurse my tickets | ![](docs/screenshots/tickets/nurse-my-tickets-light.png) | ![](docs/screenshots/tickets/nurse-my-tickets-dark.png) |
| Nurse new ticket | ![](docs/screenshots/tickets/nurse-new-ticket-light.png) | ![](docs/screenshots/tickets/nurse-new-ticket-dark.png) |
| Nurse other ticket | ![](docs/screenshots/tickets/nurse-other-ticket-light.png) | ![](docs/screenshots/tickets/nurse-other-ticket-dark.png) |
| Support desk | ![](docs/screenshots/tickets/support-desk-light.png) | ![](docs/screenshots/tickets/support-desk-dark.png) |

### Notifications

| Screen | Light | Dark |
|---|---|---|
| Admin bell | ![](docs/screenshots/notifications/admin-bell-light.png) | ![](docs/screenshots/notifications/admin-bell-dark.png) |
| Admin support only | ![](docs/screenshots/notifications/admin-support-only-light.png) | ![](docs/screenshots/notifications/admin-support-only-dark.png) |
| Doctor mention | ![](docs/screenshots/notifications/doctor-mention-light.png) | ![](docs/screenshots/notifications/doctor-mention-dark.png) |
| Nurse inbox | ![](docs/screenshots/notifications/nurse-inbox-light.png) | ![](docs/screenshots/notifications/nurse-inbox-dark.png) |
| Nurse open from notification | ![](docs/screenshots/notifications/nurse-open-from-notification-light.png) | ![](docs/screenshots/notifications/nurse-open-from-notification-dark.png) |
| Nurse unread | ![](docs/screenshots/notifications/nurse-unread-light.png) | ![](docs/screenshots/notifications/nurse-unread-dark.png) |
<!-- screenshots:end -->

## Licence

[MIT](LICENSE)
