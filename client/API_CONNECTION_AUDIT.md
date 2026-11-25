# Frontend API connection audit

Date: 25 November 2026

Existing frontend and backend routes were compared. Backend files were not changed.

## Corrected existing UI connections

- Owner dashboard uses `/dashboard/owner` and the actual nested `dashboard` response.
- Doctor/admin dashboards read their actual totals and appointmentStats response.
- Owner appointment, prescription and medical lists use `/mine` routes.
- Medical and model lists read `medicalRecords` and `aiModels` response keys.
- Doctor appointment and prescription forms use `/appointments/doctor`.
- Appointment confirmation precedes completion; prescription payload uses
  `appointmentId`, `advice`, and medicine `name`.
- AI chat uses `/ai/chat/message`, registered selection IDs, owned pet IDs,
  conversation IDs and `response.content`. Emergency notices and disclaimers display.
- Public booking submits to `/appointments`; success requires a real backend result.
  Pet name must match an owned registered pet. Online visit types are not supported.
- Admin doctor listing uses `/doctors/admin`; create form sends existing vet user ID,
  qualifications, experienceYears, consultationFee, license and clinic address fields.
- Doctor cards and appointment cards use actual response fields.

## Full API client coverage

`src/services/backend.js` exports clients for every registered backend route:
authentication, pets, doctors, appointments, prescriptions, medical history,
dashboards, model registry, refresh/history/recommendations, provider status,
chat, suggestions, conversations and archive. These share the existing fetch
helper and Bearer token. Some administrative/detail operations are service-ready
but do not yet have dedicated UI controls.

## Verification and remaining limits

- Production build passed (Vite 6.4.6).
- Live `/api/health` returned 200.
- Protected `/api/appointments/mine` returned 401 without credentials, as expected.
- Authenticated CRUD, role/ownership workflows and AI completions are not verified
  end-to-end. No test credentials were supplied, and no database writes or paid
  AI requests were executed. No Postman testing was performed.
- Doctor registration requires an existing vet-role user. Current signup creates
  petOwner accounts; admin cannot provision a vet through the current backend API.
- Marketing contact form/statistics are not backend endpoints and are outside
  registered API coverage.
