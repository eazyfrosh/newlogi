# NewLogi

A responsive logistics site and customer workspace built with the Next.js App Router, TypeScript, Tailwind CSS 4, Firebase Authentication, Cloud Firestore, Firebase Storage, and the Firebase Admin SDK. It runs as a Next.js app on Vercel; it does not require an Express server or a persistent worker.

## Local setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local` and fill in the Firebase project settings.
3. In Firebase Console, enable Email/Password Authentication, create a Firestore database, and enable Cloud Storage.
4. Create a Firebase service account for server operations. Keep its private key on the server only. In `.env.local`, put the private key in `FIREBASE_PRIVATE_KEY` and replace embedded newlines with `\n`.
5. Set `SUPER_ADMIN_EMAIL` to the email address that will bootstrap the first super admin, then register that exact address at `/register`. Later accounts receive the customer role.
6. Deploy Firestore indexes/rules and Storage rules with `firebase deploy --only firestore,storage` after selecting the intended Firebase project. All database access in this application goes through server-side authorization checks.
7. Replace the production origin in `storage-cors.example.json` with the exact site origin. Configure that CORS policy on the Firebase Storage bucket using Google Cloud Storage bucket CORS settings. The customer authorized-document uploader sends files directly to a short-lived signed URL, so the bucket must allow the site origin to make `PUT` requests.
8. Run `npm install` and `npm run dev`.

See `.env.example` for a description of every application environment variable. Firebase web configuration is public configuration; Firebase Admin credentials and email API keys are private secrets. Never commit `.env.local` or a service account JSON file.

## Vercel deployment

Import this repository into Vercel and set the project’s Node.js runtime to 22.x or newer. Add the variables from `.env.example` in the Vercel project settings. Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS site URL. Deploy the rules to the Firebase project named by `FIREBASE_PROJECT_ID` before enabling customer traffic. The app uses Next.js route handlers and Firebase managed services, so there is no separate API server or local file persistence.

Transactional email is optional. Set `RESEND_API_KEY` and `EMAIL_FROM` to enable quote confirmations and staff invitation messages. Quote requests and contact messages still save to Firestore without an email provider. The sender domain must be configured with Resend before messages can be delivered.

## Product areas

- Public pages: home, about, services and six service pages, shipment tracking, quotes, contact, FAQs, terms, and privacy.
- Authentication: Firebase email/password login and registration with an HTTP-only Firebase session cookie, verified server-side on private API routes.
- Customer workspace: owned shipments, tracking history, pending booking and pickup requests, quote review, invoice PDFs, notifications, support messages, and profile edits.
- Admin workspace: operational dashboard, shipment creation and updates, event history, private document storage, printable labels with QR codes, shipment CSV export, quote workflow, booking/pickup review, account roles, support inbox, and invoices with recorded balances and PDFs.

## Access roles

| Role        | Access                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Super admin | All operations, staff invitations and role changes, service content editing, billing, customer and shipment management |
| Operations  | Dashboard, shipment and quote management, customer read access, invoice creation and payment recording                 |
| Support     | Dashboard, shipment and customer read access, support inbox replies                                                    |
| Customer    | Own shipments, requests, quotes, invoices, visible documents, support conversations, and own profile                   |

The server enforces these permissions. Firestore and Storage client rules deny direct client access. Super admin assignment is restricted to the configured bootstrap email during initial registration; only a super admin can later assign customer, operations, or support roles.

## Important behavior

- Public tracking returns only approved route and event fields. Staff should enter city-level public locations, never a full street address. Tracking events are created only by authorized staff; no GPS or movement is fabricated.
- A quote request does not show an instant price. An administrator reviews shipment details and sends a quote. A quote only converts after customer acceptance.
- Booking and pickup requests remain pending until staff confirm them.
- Dashboard invoice balances are the amount invoiced less recorded payments. They are not presented as revenue.
- Uploaded shipment files are private by default. Staff must explicitly mark a file as customer-visible. Customers only receive short-lived download links for their own approved files.
- Shipment event timestamps are stored and displayed in UTC. Estimated delivery dates are planning estimates, separate from confirmed events.
- Service descriptions are editable by super admins at `/admin/content`.

## Service content

Service descriptions have built-in defaults. Super admins can save edits to the `services` Firestore collection from `/admin/content`; hiding a service makes its detail page unavailable. Public service pages fall back to the built-in copy until a service record is saved.

## Before launch

- Set a real company contact address in the Contact page. The contact form works; public contact details should match the business operating this instance.
- Set the Firebase project and deploy deny-by-default client rules.
- Configure the email sender if transactional confirmations are needed.
- Add operational rates only through reviewed quotes. The app intentionally does not invent rates, carrier connections, locations, certifications, or customer reviews.
