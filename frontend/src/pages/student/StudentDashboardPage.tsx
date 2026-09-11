// ============================================================================
// LERNAL STUDENT DASHBOARD (KID-FRIENDLY LEARNING HUB)
// Gamified progress, XP stars, active streaks, and continue learning shortcut
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Award,
  Zap,
  Play,
  BookOpen,
  CheckCircle2,
  Trophy,
  Rocket,
  Target,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboardPage: React.FC = () => {
  const { user, loginDemo } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If not logged in or role is not student, auto-switch to demo student for smooth experience
    if (!user || user.role !== 'student') {
      loginDemo('student').then(() => fetchDashboard());
    } else {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStudentDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-5 h-5 text-[#36C7F4]" />;
      case 'Target': return <Target className="w-5 h-5 text-emerald-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      default: return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Launching your Learning Hub...</p>
      </div>
    );
  }

  const { student, stats, continue_learning, enrolled_courses, achievements } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* -------------------------------------------------------------------- */}
      {/* 1. WELCOME & GAMIFICATION HEADER */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#002D3D] via-[#00384D] to-[#002D3D] border border-[#00A9D6]/40 rounded-4xl p-6 sm:p-8 shadow-card-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#36C7F4]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative">
              <img
                src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={student.name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-[#36C7F4] shadow-cyan-glow"
              />
              <span className="absolute -bottom-2 -right-2 bg-amber-400 text-[#00212D] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                LVL 4
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-bold text-[#36C7F4] uppercase tracking-wider">
                  Junior Software Architect
                </span>
                <span className="bg-[#00212D] text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#004D6A]">
                  {student.grade_level}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                Welcome back, {student.name.split(' ')[0]}! 🚀
              </h1>
              <p className="text-xs text-gray-300">
                You’re on a 5-day streak! Keep up the momentum to unlock your next badge.
              </p>
            </div>
          </div>

          {/* Gamification Stats Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-[#00212D]/90 border border-[#004D6A] rounded-2xl p-3 text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-base">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>{student.xp_points}</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                Total XP
              </div>
            </div>

            <div className="bg-[#00212D]/90 border border-[#004D6A] rounded-2xl p-3 text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1 text-rose-400 font-extrabold text-base">
                <Flame className="w-4 h-4 fill-rose-400" />
                <span>{student.streak_days}d</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                Streak
              </div>
            </div>

            <div className="bg-[#00212D]/90 border border-[#004D6A] rounded-2xl p-3 text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1 text-[#36C7F4] font-extrabold text-base">
                <Award className="w-4 h-4" />
                <span>{student.badges_count}</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                Badges
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. CONTINUE LEARNING BANNER */}
      {/* -------------------------------------------------------------------- */}
      {continue_learning && (
        <div className="bg-[#002B3B] border border-[#00A9D6]/40 rounded-3xl p-6 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#36C7F4] uppercase tracking-wider">
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Your Quest</span>
            </div>
            <span className="text-xs text-gray-400">
              {continue_learning.completed_lessons} of {continue_learning.total_lessons} lessons completed
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img
                src={continue_learning.thumbnail_url}
                alt={continue_learning.course_title}
                className="w-20 h-14 rounded-2xl object-cover border border-[#004D6A] flex-shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-white">
                  {continue_learning.course_title}
                </h3>
                <div className="w-48 sm:w-64 bg-[#00212D] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] h-full rounded-full transition-all duration-500"
                    style={{ width: `${continue_learning.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Link
              to={`/student/courses/${continue_learning.course_id}/play`}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-cyan-glow hover:scale-105 transition-all"
            >
              <span>Jump Back In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. MY ENROLLED COURSES */}
      {/* -------------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#36C7F4]" />
            <span>My Active Courses</span>
          </h2>
          <Link to="/courses" className="text-xs font-bold text-[#36C7F4] hover:underline">
            + Explore More Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled_courses.map((c: any) => (
            <div
              key={c.enrollment_id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-3xl overflow-hidden hover:border-[#36C7F4]/60 transition-all p-5 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#00212D]">
                  <img src={c.thumbnail_url} alt={c.course_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2.5 left-2.5 bg-[#00212D]/85 backdrop-blur-md text-[#36C7F4] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#004D6A]">
                    {c.course_type.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-base font-bold font-display text-white group-hover:text-[#36C7F4] transition-colors line-clamp-1">
                  {c.course_title}
                </h4>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span className="font-bold text-white">{c.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#00212D] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] h-full rounded-full"
                      style={{ width: `${c.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <Link
                to={`/student/courses/${c.course_id}/play`}
                className="w-full py-3 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#36C7F4]" />
                <span>Open Lesson Viewer</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. UNLOCKED ACHIEVEMENTS & BADGES */}
      {/* -------------------------------------------------------------------- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>My Badge Showcase</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {achievements.map((ach: any) => (
            <div
              key={ach.id}
              className="bg-[#002837] border border-[#004D6A] rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00212D] border border-[#004D6A] flex items-center justify-center flex-shrink-0 shadow-cyan-glow">
                {getBadgeIcon(ach.badge_icon)}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                <p className="text-[11px] text-gray-300 leading-tight">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
