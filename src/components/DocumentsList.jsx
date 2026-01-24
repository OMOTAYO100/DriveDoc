import { FileText } from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function DocumentsList({ documents, onDelete, onAddDocument }) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>
        </div>
        <div className="px-6 py-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents added yet</p>
          <button
            onClick={onAddDocument}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}