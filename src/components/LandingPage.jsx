import React from "react";
import { ArrowRight, Shield, Bell, Clock } from "lucide-react";

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Drive<span className="text-blue-600">Doc</span>
          </h1>
        </div>
        <button
          onClick={onGetStarted}
          className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
            Drive with peace of mind
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-[1.1]">
            Never Miss a Car <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Document Deadline
            </span>{" "}
            Again
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            From insurance to licenses, DriveDoc tracks your car-related documents and sends smart reminders before they expire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-xl cursor-pointer"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="px-8 py-4 font-bold text-gray-900 transition-all duration-200 bg-transparent border-2 border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none w-full sm:w-auto cursor-pointer"
            >
              How it works
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50/50 rounded-3xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Reminders</h3>
              <p className="text-gray-600">Get notified well in advance before your documents expire, so you're never caught off guard.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Storage</h3>
              <p className="text-gray-600">Your documents are encrypted and safely stored, accessible only by you whenever you need them.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Saving</h3>
              <p className="text-gray-600">Spend less time worrying about expiration dates and more time enjoying the open road.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">© 2026 DriveDoc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
