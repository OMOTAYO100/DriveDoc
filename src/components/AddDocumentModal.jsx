import { useState, useRef } from 'react';
import { ALL_COUNTRIES, getDocumentsForCountry } from '../utils/countryData';
import { Camera, Loader2, Upload } from 'lucide-react';
import { scanDocument } from '../utils/ocr';

export default function AddDocumentModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    country: '',
    type: '',
    customType: '', // For "Other"
    number: '',
    issueDate: '',
    expiryDate: ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const availableDocumentTypes = getDocumentsForCountry(formData.country);
  const isCustomType = formData.type === 'Other';

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const details = await scanDocument(file);
      setFormData(prev => ({
        ...prev,
        number: details.number || prev.number,
        expiryDate: details.expiryDate || prev.expiryDate
      }));
    } catch (error) {
      console.error('Scanning failed:', error);
      alert('Could not extract details from document. Please enter them manually.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    // Validate custom type if selected
    const finalType = isCustomType ? formData.customType : formData.type;

    if (!formData.country || !finalType || !formData.number || !formData.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd({
        ...formData,
        type: finalType // Pass the resolved type
    });
    
    // Reset
    setFormData({ country: '', type: '', customType: '', number: '', issueDate: '', expiryDate: '' });
  };

  const handleCancel = () => {
    setFormData({ country: '', type: '', customType: '', number: '', issueDate: '', expiryDate: '' });
    onClose();
  };

  const handleCountryChange = (e) => {
    setFormData({ ...formData, country: e.target.value, type: '', customType: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Add New Document</h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isScanning ? 'Scanning...' : 'Scan Doc'}
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleScan}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Country dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              value={formData.country}
              onChange={handleCountryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select country</option>
              {ALL_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              disabled={!formData.country}
            >
              <option value="">
                {formData.country ? 'Select document type' : 'Select country first'}
              </option>
              {availableDocumentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Custom Type Input (Show if "Other" is selected) */}
          {isCustomType && (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Specify Document Name *
                </label>
                <input
                type="text"
                value={formData.customType}
                onChange={(e) => setFormData({...formData, customType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Special Permit"
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., DL-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Add Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
