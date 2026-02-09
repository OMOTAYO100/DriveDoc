import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import StatsCard from './StatsCard';
import { calculateStatus } from '../utils/documentHelpers';

export default function StatsGrid({ documents }) {
  if (!documents || !Array.isArray(documents)) return null;

  const stats = {
    total: documents.length,
    expired: documents.filter(d => calculateStatus(d.expiryDate) === 'expired').length,
    expiring: documents.filter(d => calculateStatus(d.expiryDate) === 'expiring').length,
    valid: documents.filter(d => calculateStatus(d.expiryDate) === 'valid').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatsCard title="Total Documents" value={stats.total} icon={FileText} color="text-blue-600" />
      <StatsCard title="Valid" value={stats.valid} icon={CheckCircle} color="text-green-600" />
      <StatsCard title="Expiring Soon" value={stats.expiring} icon={Clock} color="text-yellow-600" />
      <StatsCard title="Expired" value={stats.expired} icon={AlertCircle} color="text-red-600" />
    </div>
  );
}