import { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  ClipboardList,
  Wallet,
  Clock,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { getDaysRemaining } from '../utils/documentHelpers';

// Guidance is static editorial content, so one fetch per country+type lasts
// the whole session.
const cache = new Map();

const Row = (props) => {
  const Icon = props.icon;
  const { label, children } = props;
  return (
  <div className="flex gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-gray-700">{children}</dd>
    </div>
  </div>
  );
};

export default function RenewalGuideModal({ document: doc, onClose }) {
  const cacheKey = `${doc.country}|${doc.type}`;
  // Seed from the cache synchronously. Doing it in an effect would render an
  // unnecessary loading state and cascade a second render.
  const [guidance, setGuidance] = useState(() => cache.get(cacheKey) ?? null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  const daysLeft = getDaysRemaining(doc.expiryDate);
  const expired = daysLeft < 0;

  useEffect(() => {
    if (cache.has(cacheKey)) return;

    let cancelled = false;
    api
      .getRenewalGuidance(doc.country, doc.type)
      .then((res) => {
        cache.set(cacheKey, res.guidance);
        if (!cancelled) setGuidance(res.guidance);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [cacheKey, doc.country, doc.type]);

  // Close on Escape, like every other dialog people have used.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const leadTime = guidance?.startBefore;
  const behindSchedule = typeof leadTime === 'number' && daysLeft < leadTime;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <div className="min-w-0">
            <h3 id="guide-title" className="text-lg font-semibold text-gray-900">
              Renewing your {doc.type}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {doc.country}
              {expired ? (
                <span className="ml-2 font-medium text-red-600">
                  Expired {Math.abs(daysLeft)} day{Math.abs(daysLeft) === 1 ? '' : 's'} ago
                </span>
              ) : (
                <span className={`ml-2 font-medium ${daysLeft <= 30 ? 'text-amber-700' : 'text-gray-600'}`}>
                  {daysLeft} day{daysLeft === 1 ? '' : 's'} left
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading guidance…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Couldn't load the renewal guidance: {error}
            </div>
          )}

          {guidance && (
            <>
              {behindSchedule && (
                <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-amber-900">
                    {expired
                      ? 'This has already expired — start the renewal now.'
                      : `Most people start this about ${leadTime} days ahead. You have ${daysLeft}, so get moving.`}
                  </p>
                </div>
              )}

              <dl className="space-y-4">
                <Row icon={Building2} label="Renew with">
                  {guidance.authority}
                </Row>

                {guidance.where && (
                  <Row icon={MapPin} label="Where">
                    {guidance.where}
                  </Row>
                )}

                {guidance.bring?.length > 0 && (
                  <Row icon={ClipboardList} label="What to bring">
                    <ul className="space-y-1">
                      {guidance.bring.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-gray-400" aria-hidden="true">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}

                {guidance.cost && (
                  <Row icon={Wallet} label="Cost">
                    {guidance.cost}
                  </Row>
                )}

                {guidance.processingTime && (
                  <Row icon={Clock} label="How long it takes">
                    {guidance.processingTime}
                  </Row>
                )}

                {guidance.penalty && (
                  <Row icon={AlertTriangle} label="If you let it lapse">
                    {guidance.penalty}
                  </Row>
                )}

                {guidance.notes && (
                  <Row icon={Lightbulb} label="Worth knowing">
                    {guidance.notes}
                  </Row>
                )}
              </dl>

              {guidance.officialUrl && (
                <a
                  href={guidance.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
                >
                  Official information
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}

              {/* Be straight about how reliable this is. Fees and processes
                  change, and generic guidance is not the same as researched
                  country-specific guidance. */}
              <p className="mt-4 text-xs leading-relaxed text-gray-500">
                {guidance.tailored
                  ? `Guidance for ${doc.country}, last reviewed ${guidance.lastReviewed}.`
                  : `We don't have ${doc.country}-specific guidance yet, so this is general advice.`}{' '}
                Fees, requirements and processing times change and vary by office — always confirm
                with the official source before you travel or pay.
              </p>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
