// ============================================================================
// LERNAL RECORDED COURSE VIDEO PLAYER (BUNNY STREAM INTEGRATION)
// Secure signed playback, lesson completion confetti, worksheets, and quizzes
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Trophy,
  ArrowLeft,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, CourseModule, Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [videoPlayback, setVideoPlayback] = useState<any>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [associatedTest, setAssociatedTest] = useState<any>(null);

  // Ensure student demo account active if not logged in
  useEffect(() => {
    if (!user) {
      loginDemo('student');
    }
  }, [user]);

  // Load course details
  useEffect(() => {
    if (courseId) {
      api.getCourse(courseId).then((res) => {
        if (res.course) {
          setCourse(res.course);

          // Find requested lesson or default to first
          const requestedLessonId = searchParams.get('lesson');
          let targetLesson: Lesson | null = null;
          let parentModuleId: string = '';

          for (const mod of res.course.modules || []) {
            for (const les of mod.lessons) {
              if (requestedLessonId && les.id === requestedLessonId) {
                targetLesson = les;
                parentModuleId = mod.id;
                break;
              }
            }
            if (targetLesson) break;
          }

          if (!targetLesson && res.course.modules?.[0]?.lessons?.[0]) {
            targetLesson = res.course.modules[0].lessons[0];
            parentModuleId = res.course.modules[0].id;
          }

          if (targetLesson) {
            setActiveLesson(targetLesson);
            setExpandedModules({ [parentModuleId]: true });
          }
        }
      });

      // Check if test exists for this course
      api.getTests(courseId).then((res) => {
        if (res.tests && res.tests.length > 0) {
          setAssociatedTest(res.tests[0]);
        }
      });
    }
  }, [courseId, searchParams]);

  // Fetch secure Bunny Stream video token whenever active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setVideoLoading(true);
      setVideoError(null);

      api
        .getLessonVideoAccess(activeLesson.id)
        .then((res) => {
          setVideoPlayback(res.playback);
          setIsCompleted(res.lesson?.progress?.is_completed || false);
        })
        .catch((err) => {
          setVideoError(err.message || 'Enrollment required to stream video.');
        })
        .finally(() => {
          setVideoLoading(false);
        });
    }
  }, [activeLesson]);

  const selectLesson = (lesson: Lesson, moduleId: string) => {
    setActiveLesson(lesson);
    setSearchParams({ lesson: lesson.id });
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);

    try {
      const nextState = !isCompleted;
      const res = await api.updateLessonProgress(activeLesson.id, nextState);
      setIsCompleted(nextState);

      if (nextState) {
        // Celebratory Gamification Confetti for kids!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#36C7F4', '#00A9D6', '#FFB800', '#10B981'],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Could not update progress');
    } finally {
      setCompleting(false);
    }
  };

  if (!course) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Configuring secure Bunny Stream session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#36C7F4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Overview</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="hidden sm:inline font-medium text-white">{course.title}</span>
          <span className="bg-[#002B3B] px-3 py-1 rounded-full border border-[#004D6A] text-[#8DDFFF]">
            Bunny Stream Secure Player
          </span>
        </div>
      </div>

      {/* Main Player Grid: Left Video / Right Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Player & Lesson Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Video Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-[#004D6A] shadow-card-soft">
            {videoLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#00212D]">
                <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs text-[#36C7F4] font-medium">
                  Validating Bunny Stream token credentials...
                </div>
              </div>
            ) : videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#00212D] space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Lesson Video Locked</h4>
                <p className="text-xs text-gray-300 max-w-sm">{videoError}</p>
                <Link
                  to={`/courses/${course.slug}`}
                  className="px-6 py-2.5 bg-[#00A9D6] text-white font-bold rounded-xl text-xs shadow-cyan-glow"
                >
                  Enroll to Unlock Full Access
                </Link>
              </div>
            ) : videoPlayback ? (
              <div className="w-full h-full relative group">
                {/* HTML5 Video with fallback to signed URL */}
                <video
                  key={videoPlayback.streamUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  poster={course.thumbnail_url}
                  autoPlay={false}
                >
                  <source src={videoPlayback.streamUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Bunny Stream Watermark Badge */}
                <div className="absolute top-4 right-4 bg-[#00212D]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-[#36C7F4] border border-[#004D6A] pointer-events-none">
                  ⚡ Bunny Stream CDN • Signed Token Active
                </div>
              </div>
            ) : null}
          </div>

          {/* Lesson Action Bar & Title */}
          {activeLesson && (
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-4 shadow-card-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#36C7F4] uppercase tracking-wider">
                      Active Lesson
                    </span>
                    <span className="text-xs text-gray-400">• {activeLesson.duration_minutes} mins</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Completion Toggle Button */}
                <button
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] shadow-cyan-glow hover:scale-105'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-[#00212D]'}`} />
                  <span>{isCompleted ? 'Completed! (+50 XP)' : 'Mark as Completed (+50 XP)'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-2 border-t border-[#003B4F]">
                {activeLesson.description}
              </p>

              {/* Lesson Worksheets / Resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="pt-4 border-t border-[#003B4F] space-y-2">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#36C7F4]" />
                    <span>Downloadable Activity Worksheets</span>
                  </h5>
                  <div className="space-y-2">
                    {activeLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#00212D] border border-[#00384D] text-xs"
                      >
                        <div className="flex items-center gap-2 text-gray-200 font-medium">
                          <FileText className="w-4 h-4 text-[#8DDFFF]" />
                          <span>{res.title}</span>
                          <span className="text-[10px] text-gray-400">({res.file_size_mb} MB)</span>
                        </div>
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-[#00384D] hover:bg-[#004D6A] text-[#36C7F4] font-bold rounded-lg transition-colors"
                        >
                          Download PDF
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Curriculum Accordion (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-5 shadow-card-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#00384D] pb-3">
              <h3 className="text-sm font-bold font-display text-white">Course Curriculum</h3>
              <span className="text-[11px] text-[#36C7F4] font-bold">
                {course.modules?.length || 0} Modules
              </span>
            </div>

            {/* Modules List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {course.modules?.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="bg-[#00212D] border border-[#00384D] rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#002837] transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-[#36C7F4] uppercase tracking-wider">
                        Module {modIdx + 1}
                      </div>
                      <div className="text-xs font-bold text-white leading-tight mt-0.5">
                        {mod.title}
                      </div>
                    </div>
                    {expandedModules[mod.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Lessons */}
                  {expandedModules[mod.id] && (
                    <div className="p-2 pt-0 space-y-1.5 border-t border-[#00384D]/50">
                      {mod.lessons.map((les) => {
                        const isCurrent = activeLesson?.id === les.id;
                        return (
                          <button
                            key={les.id}
                            onClick={() => selectLesson(les, mod.id)}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all ${
                              isCurrent
                                ? 'bg-[#00384D] border border-[#36C7F4] text-white shadow-cyan-glow'
                                : 'hover:bg-[#002837] text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <Play className={`w-3 h-3 flex-shrink-0 ${isCurrent ? 'fill-[#36C7F4] text-[#36C7F4]' : 'text-gray-500'}`} />
                              <span className="truncate font-medium">{les.title}</span>
                            </div>

                            <div className="flex-shrink-0">
                              {les.is_free_preview ? (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                  FREE
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  {les.duration_minutes}m
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Checkpoint Quiz Trigger */}
            {associatedTest && (
              <div className="pt-2 border-t border-[#00384D]">
                <div className="bg-gradient-to-r from-[#002D3D] to-[#003B4F] border border-[#FFB800]/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Trophy className="w-4 h-4" />
                    <span>Module Checkpoint Quiz</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Test your understanding, score 75% or higher, and earn +200 bonus XP!
                  </p>
                  <Link
                    to={`/student/tests/${associatedTest.id}`}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-[#00212D] font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <span>Start Checkpoint Quiz</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
