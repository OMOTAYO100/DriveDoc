import { ArrowLeft } from 'lucide-react';

/**
 * Shared shell for the Privacy Policy and Terms pages, so both carry the same
 * effective date treatment and typography.
 */
export default function LegalPage({ title, effectiveDate, onBack, children }) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 font-medium text-blue-600 transition hover:text-blue-800 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Effective {effectiveDate}</p>
        </div>

        <div className="space-y-8 text-gray-600 [&_a]:text-blue-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800 [&_li]:mb-1.5 [&_p]:leading-relaxed [&_p+p]:mt-3 [&_strong]:text-gray-800 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          {children}
        </div>
      </div>
    </div>
  );
}
