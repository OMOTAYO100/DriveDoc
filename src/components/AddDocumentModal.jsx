import { useState, useRef } from 'react';
import { ALL_COUNTRIES, getDocumentsForCountry } from '../utils/countryData';
import { Camera, Loader2, X } from 'lucide-react';
import { scanDocument } from '../utils/ocr';

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

/**
 * Add or edit a document. Pass `document` to edit; omit it to add.
 */
export default function AddDocumentModal({ isOpen, document: existing, onClose, onSave }) {
  const isEditing = Boolean(existing);
  const knownTypes = getDocumentsForCountry(existing?.country);

  const [formData, setFormData] = useState({
    country: existing?.country || '',
    // An existing document may hold a custom type that isn't in the list for
    // its country; show it in the "Other" field rather than losing it.
    type: existing ? (knownTypes.includes(existing.type) ? existing.type : 'Other') : '',
    customType: existing && !knownTypes.includes(existing.type) ? existing.type : '',
    number: existing?.number || '',
    issueDate: toDateInput(existing?.issueDate),
    expiryDate: toDateInput(existing?.expiryDate),
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanNote, setScanNote] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const availableDocumentTypes = getDocumentsForCountry(formData.country);
  const isCustomType = formData.type === 'Other';

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // The OCR engine pulls its worker and language data (tens of MB) from a
    // CDN on first use, so warn before starting on a metered connection.
    const conn = navigator.connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType || '')) {
      const proceed = window.confirm(
        'Scanning downloads about 15 MB the first time. Continue on this connection?'
      );
      if (!proceed) {
        e.target.value = '';
        return;
      }
    }

    setIsScanning(true);
    setScanNote('');
    setError('');
    try {
      const details = await scanDocument(file);
      const found = [];
      if (details.number) found.push('document number');
      if (details.expiryDate) found.push('expiry date');

      setFormData((prev) => ({
        ...prev,
        number: details.number || prev.number,
        expiryDate: details.expiryDate || prev.expiryDate,
      }));

      setScanNote(
        found.length
          ? `Found the ${found.join(' and ')}. Please check them before saving.`
          : "Couldn't read anything from that image — please enter the details manually."
      );
    } catch (err) {
      console.error('Scanning failed:', err);
      setError('Could not scan that image. Please enter the details manually.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalType = isCustomType ? formData.customType.trim() : formData.type;

    if (!formData.country) return setError('Please choose the issuing country.');
    if (!finalType) return setError('Please choose a document type.');
    if (!formData.number.trim()) return setError('Please enter the document number.');
    if (!formData.expiryDate) return setError('Please enter the expiry date.');

    setIsSaving(true);
    try {
      await onSave({
        country: formData.country,
        type: finalType,
        number: formData.number.trim(),
        issueDate: formData.issueDate || undefined,
        expiryDate: formData.expiryDate,
      });
      // Only the parent closing the modal clears the form. Resetting here
      // unconditionally is what threw away the user's input when a save failed.
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const handleCountryChange = (e) => {
    setFormData({ ...formData, country: e.target.value, type: '', customType: '' });
  };

  if (!isOpen) return null;

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <h3 id="doc-modal-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit document' : 'Add new document'}
          </h3>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleScan}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto p-6" noValidate>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {scanNote && !error && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              {scanNote}
            </div>
          )}

          <div>
            <label htmlFor="doc-country" className="mb-1 block text-sm font-medium text-gray-700">
              Country *
            </label>
            <select
              id="doc-country"
              value={formData.country}
              onChange={handleCountryChange}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">Select country</option>
              {ALL_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-gray-700">
              Document type *
            </label>
            <select
              id="doc-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`${inputCls} cursor-pointer`}
              disabled={!formData.country}
            >
              <option value="">
                {formData.country ? 'Select document type' : 'Select country first'}
              </option>
              {availableDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {isCustomType && (
            <div>
              <label htmlFor="doc-custom" className="mb-1 block text-sm font-medium text-gray-700">
                Specify document name *
              </label>
              <input
                id="doc-custom"
                type="text"
                value={formData.customType}
                onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                className={inputCls}
                placeholder="e.g. Special Permit"
              />
            </div>
          )}

          <div>
            <label htmlFor="doc-number" className="mb-1 block text-sm font-medium text-gray-700">
              Document number *
            </label>
            <input
              id="doc-number"
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className={inputCls}
              placeholder="e.g. DL-12345"
            />
          </div>

          <div>
            <label htmlFor="doc-issue" className="mb-1 block text-sm font-medium text-gray-700">
              Issue date
            </label>
            <input
              id="doc-issue"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="doc-expiry" className="mb-1 block text-sm font-medium text-gray-700">
              Expiry date *
            </label>
            <input
              id="doc-expiry"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-500">
              We'll remind you a month before, then daily in the final week.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Add document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
