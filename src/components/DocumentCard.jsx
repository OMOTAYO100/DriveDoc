import { Trash2, Pencil, Calendar, AlertCircle, CheckCircle, Clock, FileText, LifeBuoy } from 'lucide-react';
import { calculateStatus, getDaysRemaining, getStatusColor } from '../utils/documentHelpers';

const getStatusIcon = (status) => {
  switch (status) {
    case 'expired': return <AlertCircle className="w-5 h-5" />;
    case 'expiring': return <Clock className="w-5 h-5" />;
    case 'valid': return <CheckCircle className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export default function DocumentCard({ document, onDelete, onEdit, onShowRenewal }) {
  const status = calculateStatus(document.expiryDate);
  const daysRemaining = getDaysRemaining(document.expiryDate);

  // Dates are stored as a calendar day, so render them in UTC. Local
  // formatting shows the previous day for anyone west of Greenwich.
  const expiryLabel = new Date(document.expiryDate).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });

  return (
    <div className="px-6 py-4 transition hover:bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4 min-w-0">
          <div className={`rounded-lg p-3 ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-gray-900">{document.type}</h3>
              <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                {status === 'expired' ? 'EXPIRED' : status === 'expiring' ? 'EXPIRING SOON' : 'VALID'}
              </span>
            </div>

            <p className="mb-2 truncate text-sm text-gray-600">
              {document.country} · No. {document.number}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Expires {expiryLabel}
              </span>

              {status === 'expired' ? (
                <span className="font-medium text-red-600">
                  Expired {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) === 1 ? '' : 's'} ago
                </span>
              ) : (
                <span className={status === 'expiring' ? 'font-medium text-yellow-700' : 'text-green-700'}>
                  {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining
                </span>
              )}
            </div>

            {/* The obvious next question once something is expiring is "so
                what do I do?". Promote the answer when it is urgent. */}
            {status === 'valid' ? (
              <button
                onClick={() => onShowRenewal(document)}
                className="mt-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline cursor-pointer"
              >
                How to renew
              </button>
            ) : (
              <button
                onClick={() => onShowRenewal(document)}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition cursor-pointer ${
                  status === 'expired' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <LifeBuoy className="h-4 w-4" aria-hidden="true" />
                How to renew this
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onEdit(document)}
            aria-label={`Edit ${document.type}`}
            title="Edit"
            className="rounded p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(document._id)}
            aria-label={`Delete ${document.type}`}
            title="Delete"
            className="rounded p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
