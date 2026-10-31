import { useNavigate } from 'react-router-dom';
import LegalPage from './LegalPage';

const EFFECTIVE_DATE = '7 October 2026';
const CONTACT = 'privacy@drivedoc.org';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  // Works whether the reader came from the landing page, the signup
  // form or a direct link.
  const onBack = () => navigate(-1);

  return (
    <LegalPage title="Privacy Policy" effectiveDate={EFFECTIVE_DATE} onBack={onBack}>
      <section>
        <h2>1. Who we are</h2>
        <p>
          DriveDoc is a service that helps drivers keep track of when their driving documents
          expire. In this policy, "we" and "us" means the operator of DriveDoc. You can reach us
          at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <p>We only hold what the service needs to work:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address, phone number and country,
            given when you sign up. If you sign in with Google, we receive your name and email
            address from Google.
          </li>
          <li>
            <strong>Document records</strong> — the country, type, reference number, issue date and
            expiry date of each document you add.
          </li>
          <li>
            <strong>Location, only while you search</strong> — if you ask us to find driving
            schools near you, your device's approximate coordinates are sent to our server and
            on to the map provider to run that one search. We do not store them, and we do not
            track your location in the background. You can search by typing a town instead.
          </li>
          <li>
            <strong>Notification settings</strong> — whether you want email reminders, and, if
            you turn push notifications on, the push endpoint your browser issues so we can send
            them.
          </li>
          <li>
            <strong>Consent record</strong> — the date you accepted these terms, and which version.
          </li>
        </ul>
        <p>
          <strong>We do not store images or scans of your documents.</strong> If you use the
          "Scan" feature, the photograph is read entirely inside your own browser to pre-fill the
          form; the image is never uploaded to us and is discarded when you close the page.
        </p>
      </section>

      <section>
        <h2>3. Why we hold it, and on what basis</h2>
        <ul>
          <li>
            To provide the service you asked for — storing your documents, showing your
            dashboard and running driving school searches.{' '}
            <em>Basis: performance of a contract with you.</em>
          </li>
          <li>
            To send expiry reminders by email. Being told before a document expires is the
            service you signed up for, so these are on by default — every one carries a
            one-click unsubscribe link, and you can turn them off in your account at any time.{' '}
            <em>Basis: performance of a contract with you.</em>
          </li>
          <li>
            To send expiry reminders as push notifications to your browser, where you have
            switched them on. <em>Basis: your consent, which you can withdraw at any time.</em>
          </li>
          <li>
            To keep the service secure — rate limiting and abuse prevention.{' '}
            <em>Basis: our legitimate interest in running the service safely.</em>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Who we share it with</h2>
        <p>
          We do not sell your personal information and we do not share it for advertising. We use
          a small number of providers who process data on our behalf:
        </p>
        <ul>
          <li><strong>MongoDB Atlas</strong> — database hosting.</li>
          <li><strong>Render</strong> — application hosting.</li>
          <li><strong>Netlify</strong> — serving the website.</li>
          <li><strong>Resend</strong> — sending password reset and reminder emails.</li>
          <li>
            <strong>Google Maps Platform and OpenStreetMap</strong> — only when you search for a
            driving school, to find schools near the location or place name you gave.
          </li>
          <li>
            <strong>Google</strong> — only if you choose to sign in with Google, and only to verify
            that sign-in.
          </li>
          <li>
            <strong>Your browser's push service</strong> (Google, Mozilla or Apple, depending on
            your browser) — to deliver reminder notifications, if you turn them on.
          </li>
        </ul>
        <p>We may also disclose information where the law requires it.</p>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <p>
          We keep your account and documents for as long as your account exists. When you delete
          your account, your profile, documents and notification subscriptions
          are removed from our database immediately. Routine backups may retain a copy for up to
          30 days, after which they are overwritten.
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          You can exercise all of the following yourself from <strong>Your account</strong> in the
          app, or by emailing us:
        </p>
        <ul>
          <li>
            <strong>Access and portability</strong> — "Download my data" gives you everything we
            hold about you as a JSON file.
          </li>
          <li>
            <strong>Correction</strong> — edit your name, phone and country in your account, and
            any document from your dashboard.
          </li>
          <li>
            <strong>Erasure</strong> — "Delete my account" permanently removes your account and
            everything attached to it.
          </li>
          <li>
            <strong>Turning reminders off</strong> — unsubscribe from any reminder email, or use
            the switches in your account (email) and the Reminders button in the header (push).
          </li>
        </ul>
        <p>
          If you are in the UK or EEA and believe we have handled your data improperly, you have
          the right to complain to your local data protection authority.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          Passwords are stored only as salted bcrypt hashes — we cannot read them. Traffic is
          encrypted in transit with HTTPS, and the database is encrypted at rest by our hosting
          provider. Document reference numbers are stored as ordinary text within that database:
          they are protected by access controls and encryption at rest, but we do not apply
          additional per-field encryption. Please bear that in mind when deciding what to record.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          DriveDoc is not intended for children under 16, and we do not knowingly collect their
          information.
        </p>
      </section>

      <section>
        <h2>9. Changes to this policy</h2>
        <p>
          If we make a material change we will update the date at the top of this page and, where
          the change affects how we use your information, tell you in the app.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about this policy or your data: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
