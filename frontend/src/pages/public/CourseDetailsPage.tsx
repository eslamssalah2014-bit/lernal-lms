// ============================================================================
// LERNAL COURSE DETAILS & SYLLABUS PAGE
// Detailed curriculum, instructor bio, outcomes, and enrollment + lead capture
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  HelpCircle,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  FileText,
  CreditCard,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LeadCaptureModal } from '../../components/common/LeadCaptureModal';

export const CourseDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, role, loginDemo } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState('');

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      api
        .getCourse(slug)
        .then((res) => {
          if (res.course) {
            setCourse(res.course);
            // Default first module expanded
            if (res.course.modules && res.course.modules.length > 0) {
              setExpandedModules({ [res.course.modules[0].id]: true });
            }
          }
        })
        .catch((err) => console.error('Course load failed:', err))
        .finally(() => setIsLoading(false));
    }
  }, [slug, user]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleEnrollment = async () => {
    if (!course) return;

    // If user is not logged in, prompt quick student login
    if (!user) {
      await loginDemo('student');
    }

    setIsEnrolling(true);
    try {
      const res = await api.enrollStudent(course.id);
      setEnrollSuccessMessage(`Successfully enrolled in ${course.title}!`);
      setTimeout(() => {
        navigate(`/student/courses/${course.id}/play`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Loading course syllabus...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <p className="text-gray-400 text-sm">The course you are looking for may have been archived or moved.</p>
        <Link to="/courses" className="inline-block px-6 py-2.5 bg-[#00A9D6] text-white rounded-xl text-xs font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isEnrolled = course.user_access?.is_enrolled;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* -------------------------------------------------------------------- */}
      {/* 1. COURSE HERO BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                course.course_type === 'live' ? 'bg-rose-500 text-white shadow-lg' : 'bg-[#00A9D6] text-white shadow-cyan-glow'
              }`}
            >
              {course.course_type === 'live' ? '🔴 Live Small-Group Cohort' : '⚡ On-Demand Recorded Track'}
            </span>

            <span className="bg-[#002B3B] text-[#8DDFFF] text-xs font-semibold px-3 py-1 rounded-full border border-[#004D6A]">
              Ages {course.age_min}–{course.age_max}
            </span>

            <span className="bg-[#002B3B] text-gray-300 text-xs font-medium px-3 py-1 rounded-full border border-[#004D6A]">
              {course.difficulty} Level
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white leading-tight">
            {course.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            {course.full_description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#00384D] text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-[#36C7F4]" />
              <span>{course.duration_hours} Total Hours</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <BookOpen className="w-4 h-4 text-[#36C7F4]" />
              <span>{course.stats?.total_lessons || 12} Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Kid-Safe</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificate Included</span>
            </div>
          </div>

          {/* Instructor Bio Card */}
          {course.instructor && (
            <div className="bg-[#002837] border border-[#004D6A] rounded-2xl p-5 flex items-start gap-4">
              <img
                src={course.instructor.avatar_url}
                alt={course.instructor.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[#36C7F4] flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{course.instructor.name}</h4>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{course.instructor.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#36C7F4] font-medium">{course.instructor.title}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{course.instructor.bio}</p>
              </div>
            </div>
          )}

          {/* Learning Outcomes Checklist */}
          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#36C7F4]" />
              <span>What Your Child Will Master</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.learning_outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SYLLABUS & LESSON PREVIEWS */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display text-white">
                Course Syllabus & Curriculum
              </h3>
              <span className="text-xs text-gray-400">
                {course.modules?.length || 0} Modules • {course.stats?.total_lessons || 0} Interactive Lessons
              </span>
            </div>

            <div className="space-y-3">
              {course.modules?.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="bg-[#002B3B] border border-[#004D6A] rounded-2xl overflow-hidden transition-all"
                >
                  {/* Module Accordion Header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#00384D]/40 transition-colors"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#36C7F4] block mb-0.5">
                        Module {modIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">{mod.title}</h4>
                      {mod.description && (
                        <p className="text-xs text-gray-400 mt-1">{mod.description}</p>
                      )}
                    </div>
                    {expandedModules[mod.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Lessons List inside Module */}
                  {expandedModules[mod.id] && (
                    <div className="p-4 pt-0 space-y-2 border-t border-[#003B4F]">
                      {mod.lessons?.map((les) => (
                        <div
                          key={les.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#00212D]/80 border border-[#00384D] hover:border-[#36C7F4]/40 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-[#00384D] text-[#36C7F4] flex items-center justify-center font-bold text-[11px]">
                              {les.order_index}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-200">{les.title}</div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>{les.duration_minutes} mins</span>
                                {les.resources && les.resources.length > 0 && (
                                  <span className="flex items-center gap-1 text-[#8DDFFF]">
                                    <FileText className="w-3 h-3" />
                                    <span>Worksheet PDF</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            {les.is_free_preview ? (
                              <Link
                                to={`/student/courses/${course.id}/play?lesson=${les.id}`}
                                className="px-3 py-1.5 bg-[#00A9D6]/20 hover:bg-[#00A9D6] text-[#36C7F4] hover:text-white font-bold rounded-lg border border-[#00A9D6]/40 flex items-center gap-1.5 transition-all text-xs"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Preview</span>
                              </Link>
                            ) : isEnrolled ? (
                              <Link
                                to={`/student/courses/${course.id}/play?lesson=${les.id}`}
                                className="px-3 py-1.5 bg-[#00384D] hover:bg-[#004D6A] text-[#8DDFFF] font-medium rounded-lg flex items-center gap-1.5 transition-colors text-xs"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Watch</span>
                              </Link>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-500 text-xs px-2 py-1">
                                <Lock className="w-3 h-3" />
                                <span>Enrolled Only</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Enrollment Card */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-soft">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#00212D]">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white bg-[#00212D]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#004D6A]">
                  {course.course_type === 'live' ? 'Live Interactive Class' : 'Lifetime Access Included'}
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-display text-white">
                  ${course.price}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase">{course.currency}</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>30-Day Money Back Learning Guarantee</span>
              </p>
            </div>

            {enrollSuccessMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold">
                {enrollSuccessMessage} Redirecting to player...
              </div>
            )}

            {/* Enrollment / Continue Button */}
            {isEnrolled ? (
              <Link
                to={`/student/courses/${course.id}/play`}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#00212D] font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Continue Learning</span>
              </Link>
            ) : (
              <button
                onClick={handleEnrollment}
                disabled={isEnrolling}
                className="w-full py-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:opacity-95 text-[#00212D] font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-cyan-glow transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isEnrolling ? 'Processing Enrollment...' : 'Enroll Child in Course'}</span>
              </button>
            )}

            {/* "Ask about this course" Lead Button */}
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="w-full py-3.5 bg-[#00212D] hover:bg-[#002D3D] text-[#36C7F4] hover:text-white font-bold rounded-2xl border border-[#004D6A] flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <HelpCircle className="w-4 h-4 text-[#36C7F4]" />
              <span>Ask About This Course</span>
            </button>

            {/* Included Value Points */}
            <div className="pt-4 border-t border-[#00384D] space-y-2 text-xs text-gray-300">
              <div className="font-bold text-white text-xs mb-1">Enrollment Includes:</div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Full access on Desktop, Tablet & Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Interactive Checkpoint Quizzes & XP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Verified Certificate of Mastery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Parent Portal Progress Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        preselectedCourse={course}
      />
    </div>
  );
};
