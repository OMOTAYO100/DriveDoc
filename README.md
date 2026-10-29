# DriveDoc — web app

React + Vite frontend for DriveDoc: track when your driving documents expire,
get reminded before they do, practise theory-test questions, and request
driving lessons.

The API lives in a separate repository, [`drivedoc-backend`](https://github.com/OMOTAYO100/DriveDoc-backend).

## Running locally

```bash
npm install
cp .env.example .env    # then fill in VITE_GOOGLE_CLIENT_ID
npm run dev             # http://localhost:5173
```

By default `VITE_API_URL=/api`, which Vite proxies to `http://localhost:5000`
in development and Netlify proxies to the Render backend in production. Keeping
the API same-origin matters: it keeps the auth cookie first-party, which
browsers no longer guarantee for third-party cookies.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint — must be clean |
| `npm test` | Vitest unit tests |
| `npm run icons` | Regenerate the PWA icon set |

## Notifications and the PWA

Expiry reminders go out on two channels. **Email is the dependable one** and is
on by default; push is opt-in and best-effort. The account panel holds the email
switch, the header button holds push.

Push has one hard requirement worth knowing:

> **iOS only delivers web push to an installed PWA.** The site must be added to
> the Home Screen *and* serve a manifest with `display: standalone`. Without
> `public/manifest.json` and the icons it references, reminders cannot work on
> iPhone at all.

That is exactly why email exists alongside it — a reminder product that only
reaches users who installed a PWA and granted a permission is not doing its job.

So `public/manifest.json`, the `<link rel="manifest">` in `index.html` and
`public/icons/` are load-bearing, not decoration. The icons are generated from a
vector source by `scripts/generate-icons.mjs` — run `npm run icons` after
changing the mark, and commit the output.

Note that `src/assets/logo.png` and `logo_transparent.png` are actually JPEGs
with a `.png` extension (so the "transparent" one has no transparency). The icon
script does not use them.

Permission is only ever requested from a user gesture — the Reminders button.
On load the app silently refreshes an existing subscription, and only for users
who already turned reminders on, so opting out survives a refresh.

## Layout

```
src/
  components/
    auth/          sign in, sign up, password reset
    schools/       find a driving school nearby
    legal/         privacy policy, terms (shared LegalPage shell)
    ...            dashboard, documents, theory test
  services/
    api.js         every network call; throws ApiError carrying .status
    pushService.js service worker registration and push subscriptions
  utils/           pure helpers — status maths, country data, OCR, categories
  testData.json    1,090 theory questions
public/
  manifest.json    PWA manifest — required for push on iOS
  icons/           generated, committed
  sw.js            service worker: push display and notification clicks
  _redirects       Netlify fallback (netlify.toml is the source of truth)
```

There is no router. Views are state in `App.jsx`; `netlify.toml` rewrites every
path to `index.html` so deep links and refreshes work.

## Things that will bite you

- **Document and lesson dates are calendar days**, stored at UTC midnight.
  Always format them with `timeZone: 'UTC'` or they render a day early for
  anyone west of Greenwich.
- **Don't poll the API.** The dashboard refreshes on window focus. An earlier
  10-second poll sent 90 requests per 15-minute window and tripped the rate
  limiter by itself, which surfaced as the user's documents vanishing.
- **A failed refresh keeps the last good data on screen.** Never clear state in
  a `catch` — that is what made a transient error look like data loss.
- **Google sign-in sends a credential (ID token), not an access token.** The
  backend verifies the token's audience; an access token cannot be verified as
  having been issued for this app.
- **Renewal guidance comes from the API**, not the bundle, so the content can be
  corrected without a frontend deploy. `RenewalGuideModal` caches it per
  country+type for the session. `guidance.tailored` is `false` for a generic
  fallback — the modal must keep saying so rather than implying the advice is
  country-specific, and the `lastReviewed` date stays visible because fees go
  stale.
- **The driving school search is a directory, not a booking flow.** DriveDoc
  lists independent businesses from map data and the user calls them. There is
  no confirmation step because nothing is reserved — don't reintroduce one
  without someone to do the confirming.
- **Location is requested only on an explicit tap** and never stored. If the
  user declines, the place-name search must still work.
- **Question images are hotlinked** from a third-party CDN over https. They can
  disappear without notice, so `QuestionCard` has an `onError` fallback. See the
  licensing note below before relying on them.

## Question bank licensing — unresolved

`src/scripts/importQuestions.js` sourced the bank from the
`adamisntdead/theory-test-questions` GitHub repository, and the images are
hotlinked from a third party's CloudFront distribution. UK DVSA theory-test
material is Crown copyright and licensed.

**Confirm you have the right to use both the text and the images before
charging for the app or advertising it.** Mirroring the images into `public/`
would also remove the dependency on someone else's bandwidth.

## Tests

`npm test` covers the pure helpers and asserts invariants over the question
bank — every answer exists and appears among its options, no duplicate ids,
every image is https, every category maps to one the UI shows, and option
de-duplication never discards the correct answer.
