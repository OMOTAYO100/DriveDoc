import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import LessonCard from "./LessonCard";
import { api } from "../../services/api";

const LESSON_TYPES = [
  {
    type: "Standard Lesson",
    description: "Perfect for beginners getting started",
    duration: "1 hr",
    price: 60,
    features: ["Basic vehicle control", "Traffic rules intro", "Safe turning & parking"],
  },
  {
    type: "Highway Logic",
    description: "Master high-speed driving safely",
    duration: "1.5 hrs",
    price: 85,
    features: ["Merging & exiting", "Lane changing at speed", "Defensive driving"],
  },
  {
    type: "Parking Mastery",
    description: "Parallel and perpendicular parking",
    duration: "1 hr",
    price: 70,
    features: ["Parallel parking", "Reverse bay parking", "Tight space maneuvering"],
  },
  {
    type: "Test Preparation",
    description: "Mock test scenarios and feedback",
    duration: "2 hrs",
    price: 110,
    features: ["Mock exam route", "Critical error analysis", "Confidence building"],
  },
];

export default function BookingPage({ onBack }) {
  const [selectedType, setSelectedType] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("create"); // 'create' or 'list'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  const handleBooking = async () => {
    if (!selectedType || !date || !time) {
      alert("Please complete all selection fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createBooking({
        lessonType: selectedType.type,
        date,
        startTime: time,
      });
      if (res.success) {
        alert("Booking confirmed!");
        setView("list");
        fetchBookings();
        // Reset form
        setSelectedType(null);
        setDate("");
        setTime("");
      }
    } catch (error) {
      alert(error.message || "Failed to book lesson");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.cancelBooking(id);
      fetchBookings(); // Refresh list
    } catch (error) {
      alert("Failed to cancel");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driving Lessons</h1>
          <p className="text-gray-500 mt-1">Book your next session or manage existing ones</p>
        </div>
        <div className="flex gap-4">
             <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => setView(view === "create" ? "list" : "create")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition cursor-pointer"
          >
            {view === "create" ? "View My Bookings" : "Book New Lesson"}
          </button>
         
        </div>
      </div>

      {view === "create" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Lesson Selection */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">1. Select Lesson Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LESSON_TYPES.map((lesson) => (
                <LessonCard
                  key={lesson.type}
                  {...lesson}
                  selected={selectedType?.type === lesson.type}
                  onSelect={() => setSelectedType(lesson)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Date & Confirmation */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">2. Schedule & Confirm</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>

                 {/* Summary */}
                {selectedType && date && time && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium text-gray-900">{selectedType.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium text-gray-900">{date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium text-gray-900">{time}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-blue-600">
                        <span>Total:</span>
                        <span>${selectedType.price}</span>
                      </div>
                    </div>
                  </div>
                )}


                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedType || !date || !time}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* My Bookings List View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No upcoming bookings found.</p>
              <button onClick={() => setView('create')} className="mt-4 text-blue-600 hover:underline cursor-pointer">Book your first lesson</button>
            </div>
          ) : (
             <div className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                    <div key={booking._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-start gap-4">
                             <div className="p-3 bg-blue-100/50 rounded-lg text-blue-600">
                                <Calendar className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{booking.lessonType}</h3>
                                <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(booking.date).toLocaleDateString()} at {booking.startTime}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {booking.status.toUpperCase()}
                                    </span>
                                </div>
                             </div>
                        </div>
                        {booking.status !== 'cancelled' && (
                             <button 
                                onClick={() => cancelBooking(booking._id)}
                                className="mt-4 md:mt-0 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            >
                                Cancel Lesson
                             </button>
                        )}
                       
                    </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
