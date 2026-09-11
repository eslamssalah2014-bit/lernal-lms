// ============================================================================
// LEAD CAPTURE MODAL COMPONENT
// Connected to /api/leads with immediate reflection in Admin Leads Center
// ============================================================================

import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, CheckCircle2, Phone, Mail, User, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: Course | null;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  preselectedCourse,
}) => {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getCourses().then((res) => {
        if (res.courses) setCoursesList(res.courses);
      });
      if (preselectedCourse) {
        setSelectedCourseId(preselectedCourse.id);
      }
    } else {
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, preselectedCourse]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !email || !phone) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitLead({
        parent_name: parentName,
        child_name: childName,
        email,
        phone,
        course_id: selectedCourseId || undefined,
        message,
        source: preselectedCourse ? `Course Details: ${preselectedCourse.title}` : 'Website Header Inquiry',
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#36C7F4]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white">Inquiry Received!</h3>
            <p className="text-gray-300 max-w-sm mx-auto text-sm leading-relaxed">
              Thank you for trusting Lernal. Our lead educational advisor will call you within 24 hours to recommend the best learning journey for your child.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-semibold rounded-2xl transition-all shadow-cyan-glow"
              >
                Back to Learning
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-[#36C7F4] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Personalized Educational Guidance</span>
            </div>

            <h2 className="text-2xl font-bold font-display text-white mb-1">
              Ask About Our Programs
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Connect directly with a Lernal mentor to find the perfect cohort for your child.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Parent Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Sarah Wright"
                      className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Child's Name & Age
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Leo (Age 9)"
                      className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Interested Course
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#36C7F4] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">General Platform Consultation</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.course_type.toUpperCase()} • Ages {c.age_min}-{c.age_max})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Questions or Learning Goals (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what your child is excited to learn..."
                  className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:opacity-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-cyan-glow transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Connect with Educational Advisor'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
