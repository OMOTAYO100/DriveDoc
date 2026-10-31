import { useNavigate } from 'react-router-dom';
import LegalPage from './LegalPage';

const EFFECTIVE_DATE = '7 October 2026';
const CONTACT = 'support@drivedoc.org';

export default function TermsOfService() {
  const navigate = useNavigate();
  // Works whether the reader came from the landing page, the signup
  // form or a direct link.
  const onBack = () => navigate(-1);

  return (
    <LegalPage title="Terms of Service" effectiveDate={EFFECTIVE_DATE} onBack={onBack}>
      <section>
        <h2>1. Acceptance</h2>
        <p>
          By creating a DriveDoc account or using the service, you agree to these terms. If you
          do not agree, please do not use DriveDoc.
        </p>
      </section>

      <section>
        <h2>2. What DriveDoc does</h2>
        <p>DriveDoc is a personal reminder tool. It lets you:</p>
        <ul>
          <li>record the details of your driving and vehicle documents and their expiry dates;</li>
          <li>receive notifications before those documents expire, if you enable them;</li>
          <li>practise multiple-choice driving theory questions;</li>
          <li>find independent driving schools near you.</li>
        </ul>
        <p>
          DriveDoc does not store copies of your documents, does not renew anything on your
          behalf, and is not connected to any licensing authority, insurer or government agency.
        </p>
      </section>

      <section>
        <h2>3. Reminders are a convenience, not a guarantee</h2>
        <p>
          This is the most important thing on this page. Reminders depend on things outside our
          control — the accuracy of the dates you enter, your browser's notification permissions,
          your device being on and connected, and third-party push services delivering the
          message. <strong>Notifications may be delayed, duplicated or not arrive at all.</strong>
        </p>
        <p>
          Keeping your documents valid remains entirely your responsibility. Do not rely on
          DriveDoc as your only reminder for anything that carries a legal or financial
          consequence.
        </p>
      </section>

      <section>
        <h2>4. Finding a driving school</h2>
        <p>
          DriveDoc shows driving schools from public map data so you can contact them yourself.
          We are <strong>a directory, not a booking service</strong>. We do not book lessons,
          take payment, act as an agent, or have any commercial relationship with the schools
          listed.
        </p>
        <p>
          We do not vet, endorse, licence or inspect any school that appears in a search, and we
          cannot guarantee a listing is accurate, current, or that the business is properly
          licensed where it operates. Any lesson you arrange is a contract between you and that
          school alone. Check their credentials and insurance before you pay anything.
        </p>
      </section>

      <section>
        <h2>5. Theory test practice</h2>
        <p>
          The practice questions are study material only. They are not official examination
          questions, are not endorsed by any testing authority, and your score here does not
          predict or affect the result of a real theory test. Always check the current official
          materials for your country.
        </p>
      </section>

      <section>
        <h2>6. Your account</h2>
        <ul>
          <li>You must give accurate information and keep it up to date.</li>
          <li>You are responsible for keeping your password secure and for activity on your account.</li>
          <li>One account per person. Don't share your login.</li>
          <li>Tell us promptly at <a href={`mailto:${CONTACT}`}>{CONTACT}</a> if you think someone else has accessed your account.</li>
        </ul>
      </section>

      <section>
        <h2>7. Acceptable use</h2>
        <p>Don't use DriveDoc to:</p>
        <ul>
          <li>store someone else's document details without their knowledge and permission;</li>
          <li>break any law, or help anyone else do so;</li>
          <li>attempt to access other users' data, or probe, scan or overload the service;</li>
          <li>copy, scrape or redistribute the practice question bank or the school listings.</li>
        </ul>
      </section>

      <section>
        <h2>8. Availability</h2>
        <p>
          DriveDoc is provided free of charge and "as is". We may change, suspend or discontinue
          any part of it, and we do not promise uninterrupted or error-free operation. We will
          give reasonable notice before discontinuing the service entirely so you can export your
          data.
        </p>
      </section>

      <section>
        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent the law allows, DriveDoc is not liable for any loss arising from
          an expired document, a missed renewal, a reminder that did not arrive, a fine or penalty,
          or anything arising from your dealings with a driving school you found through DriveDoc.
        </p>
        <p>
          Nothing in these terms limits liability for death or personal injury caused by
          negligence, for fraud, or for anything else that cannot lawfully be excluded. If you
          are a consumer, your statutory rights are unaffected.
        </p>
      </section>

      <section>
        <h2>10. Ending your use</h2>
        <p>
          You can delete your account at any time from <strong>Your account</strong> in the app,
          which removes your data as described in the Privacy Policy. We may suspend or close an
          account that breaches these terms, and will tell you why unless the law prevents us.
        </p>
      </section>

      <section>
        <h2>11. Changes to these terms</h2>
        <p>
          We may update these terms. If a change is material we will update the effective date
          above and notify you in the app. Continuing to use DriveDoc after a change means you
          accept the updated terms.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
