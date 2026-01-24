import { Trash2, Calendar, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { calculateStatus, getDaysRemaining, getStatusColor } from '../utils/documentHelpers';

const getStatusIcon = (status) => {
  switch(status) {
    case 'expired': return <AlertCircle className="w-5 h-5" />;
    case 'expiring': return <Clock className="w-5 h-5" />;
    case 'valid': return <CheckCircle className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export default function DocumentCard({ document, onDelete }) {
  const status = calculateStatus(document.expiryDate);
  const daysRemaining = getDaysRemaining(document.expiryDate);

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-lg ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">{document.type}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                {status === 'expired' ? 'EXPIRED' : status === 'expiring' ? 'EXPIRING SOON' : 'VALID'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Document #: {document.number}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Expires: {new Date(document.expiryDate).toLocaleDateString()}</span>
              </div>
              
              {status === 'expired' ? (
                <span className="text-red-600 font-medium">
                  Expired {Math.abs(daysRemaining)} days ago
                </span>
              ) : status === 'expiring' ? (
                <span className="text-yellow-600 font-medium">
                  {daysRemaining} days remaining
                </span>
              ) : (
                <span className="text-green-600">
                  {daysRemaining} days remaining
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(document.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}