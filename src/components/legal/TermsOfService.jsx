import React from 'react';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <button 
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">Terms of Service</h1>
        
        <div className="prose prose-blue text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
            <p>By accessing or using DriveDoc, you agree to be bound by these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">2. Description of Service</h2>
            <p>DriveDoc provides document management and expiration tracking services for drivers, as well as booking services for driving lessons.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">3. User Responsibilities</h2>
            <p>You are responsible for the accuracy of the documents you upload and for maintaining the security of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">4. Limitation of Liability</h2>
            <p>DriveDoc is a tracking tool and is not liable for any legal consequences arising from expired documents or missed renewals.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">5. Termination</h2>
            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
