import React from 'react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <button 
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">Privacy Policy</h1>
        
        <div className="prose prose-blue text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, upload documents (like licenses or vehicle papers), and use our document tracking services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">2. How We Use Information</h2>
            <p>We use your information to provide, maintain, and improve our services, including notifying you about document expirations and facilitating driving lesson bookings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">3. Data Sharing</h2>
            <p>We do not share your personal information with third parties except as required by law or to provide our services (e.g., processing payments via Paystack).</p>
          </section>

          <section id="deletion" className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-800">4. Data Deletion (Facebook Requirement)</h2>
            <p className="text-blue-700">You have the right to request the deletion of your data at any time. To delete your account and all associated data, please contact us at <span className="font-medium underline">oshiboteomotayo100@gmail.com</span> with the subject line "Data Deletion Request". We will process your request within 48 hours.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at oshiboteomotayo100@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
