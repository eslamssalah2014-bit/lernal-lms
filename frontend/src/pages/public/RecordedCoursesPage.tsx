// ============================================================================
// LERNAL DEDICATED RECORDED COURSES PAGE
// On-demand self-paced video courses for children (Since 2026)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, CheckCircle2, Play, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';

export const RecordedCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCourses({ type: 'recorded' }).then((res) => {
      if (res.courses) setCourses(res.courses);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="bg-[#002837] border border-[#004D6A] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#36C7F4]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00212D] text-[#36C7F4] text-xs font-bold rounded-full border border-[#004D6A]">
            <Video className="w-3.5 h-3.5" />
            <span>Self-Paced Recorded Mastery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Learn Anytime, Anywhere at Your Own Pace
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed">
            High-definition video lessons streamed through secure Bunny CDN, with interactive challenges, downloadable worksheets, and checkpoint quizzes.
          </p>
        </div>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Loading recorded courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-3xl overflow-hidden hover:border-[#36C7F4]/60 transition-all duration-300 shadow-card-soft flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-[#00212D]">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002B3B] via-transparent to-black/20"></div>

                  <div className="absolute top-3 left-3 bg-[#00A9D6] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-cyan-glow">
                    ⚡ On-Demand
                  </div>

                  <div className="absolute top-3 right-3 bg-[#00212D]/85 backdrop-blur-md text-[#8DDFFF] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#004D6A]">
                    Ages {course.age_min}–{course.age_max}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[#36C7F4] font-medium">{course.category?.name || 'Track'}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration_hours}h total
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-[#36C7F4] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {course.short_description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#00384D] space-y-3">
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xl font-extrabold text-white">${course.price}</span>
                  <span className="text-xs text-[#36C7F4] font-bold">Lifetime Access</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="py-2.5 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-gray-200 text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    View Syllabus
                  </Link>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="py-2.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:opacity-95 text-[#00212D] text-xs font-bold rounded-xl text-center transition-all shadow-cyan-glow flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Preview</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
