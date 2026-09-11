// ============================================================================
// LERNAL PUBLIC HOME PAGE
// Child-friendly, parent-trusted, modern EdTech experience (Since 2026)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Video,
  Users,
  Code2,
  Cpu,
  TrendingUp,
  Palette,
  Play,
  CheckCircle2,
  Star,
  Clock,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, CourseCategory } from '../../types';
import { LeadCaptureModal } from '../../components/common/LeadCaptureModal';

export const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalCourse, setLeadModalCourse] = useState<Course | null>(null);

  useEffect(() => {
    api.getCourses().then((res) => {
      if (res.courses) setFeaturedCourses(res.courses);
    });
    api.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    });
  }, []);

  const openLeadModal = (course?: Course) => {
    setLeadModalCourse(course || null);
    setIsLeadModalOpen(true);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-5 h-5 text-[#36C7F4]" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-[#36C7F4]" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Palette': return <Palette className="w-5 h-5 text-rose-400" />;
      default: return <Sparkles className="w-5 h-5 text-[#36C7F4]" />;
    }
  };

  const filteredCourses = selectedCategory === 'all'
    ? featuredCourses
    : featuredCourses.filter((c) => c.category?.slug === selectedCategory || c.category_id === selectedCategory);

  return (
    <div className="space-y-24 pb-20">
      {/* -------------------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#00A9D6]/20 via-[#36C7F4]/15 to-transparent rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#002B3B] border border-[#004D6A] text-[#36C7F4] text-xs font-semibold tracking-wide shadow-cyan-glow">
                <Sparkles className="w-4 h-4 text-[#8DDFFF]" />
                <span>Next-Gen EdTech for Young Builders • Since 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.15]">
                Learning Should Be an <br className="hidden sm:inline" />
                <span className="gradient-lernal-text">Adventure, Not a Chore.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                Lernal empowers children ages 4–16 with hands-on coding, machine learning, entrepreneurship, and digital arts. Gamified progress, world-class mentors, and a transparent parent portal.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:opacity-95 text-[#00212D] font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-cyan-glow hover:shadow-cyan-glow-lg transition-all scale-100 hover:scale-[1.02]"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-5 h-5 text-[#00212D]" />
                </Link>

                <button
                  onClick={() => openLeadModal()}
                  className="w-full sm:w-auto px-7 py-4 bg-[#002B3B] hover:bg-[#003B4F] text-white font-semibold rounded-2xl border border-[#004D6A] flex items-center justify-center gap-2 transition-all hover:border-[#36C7F4]/50"
                >
                  <HelpCircle className="w-4 h-4 text-[#36C7F4]" />
                  <span>Talk to an Advisor</span>
                </button>
              </div>

              {/* Social Proof Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#003B4F]/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>4.98 / 5</span>
                  </div>
                  <div className="text-[11px] text-gray-400">Parent Satisfaction</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#36C7F4]">100%</div>
                  <div className="text-[11px] text-gray-400">Kid-Safe & Ad-Free</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">12,500+</div>
                  <div className="text-[11px] text-gray-400">Projects Built</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-[#002B3B] border border-[#004D6A] rounded-3xl p-5 shadow-card-soft overflow-hidden group">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#00212D]">
                  <img
                    src="https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800"
                    alt="Creative Coding"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00212D] via-transparent to-black/20"></div>

                  {/* Play Button Overlay */}
                  <Link
                    to="/courses/creative-coding-scratch-python"
                    className="absolute inset-0 flex items-center justify-center group/play"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#36C7F4]/90 text-[#00212D] flex items-center justify-center shadow-cyan-glow group-hover/play:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-[#00212D] ml-1" />
                    </div>
                  </Link>

                  <span className="absolute top-3 left-3 bg-[#00212D]/80 backdrop-blur-md text-[#36C7F4] text-xs font-bold px-3 py-1 rounded-full border border-[#004D6A]">
                    FREE PREVIEW LESSON
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="bg-[#00212D] px-2.5 py-1 rounded-md text-[#8DDFFF] font-medium border border-[#003B4F]">
                      Ages 7–12 • Scratch & Python
                    </span>
                    <span className="text-[#36C7F4] font-semibold">18 Hours Total</span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-display">
                    Creative Coding: Arcade Games & Animated Stories
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-[#00384D] text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                        alt="Instructor"
                        className="w-7 h-7 rounded-full object-cover border border-[#36C7F4]"
                      />
                      <span className="text-gray-300 font-medium">Sarah Jenkins, M.Ed.</span>
                    </div>
                    <span className="text-base font-extrabold text-[#36C7F4]">$149</span>
                  </div>
                </div>
              </div>

              {/* Floating Gamification Pill */}
              <div className="absolute -bottom-6 -left-6 bg-[#00212D] border border-[#004D6A] rounded-2xl p-3 shadow-2xl flex items-center gap-3 hidden sm:flex animate-bounce">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">+50 XP Earned!</div>
                  <div className="text-[10px] text-gray-400">Lesson 1.1 Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. CATEGORIES SELECTOR */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Explore Learning Disciplines
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Curated tracks designed to ignite curiosity, critical thinking, and modern career skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
                : 'bg-[#002B3B] text-gray-300 border border-[#004D6A] hover:bg-[#003B4F]'
            }`}
          >
            All Tracks ({featuredCourses.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
                  : 'bg-[#002B3B] text-gray-300 border border-[#004D6A] hover:bg-[#003B4F]'
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. FEATURED COURSES GRID */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Featured Programs
            </h2>
            <p className="text-gray-300 text-sm">
              Enroll directly or explore the syllabus and interactive video lessons.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-xs font-bold text-[#36C7F4] hover:underline flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-3xl overflow-hidden hover:border-[#36C7F4]/60 transition-all duration-300 shadow-card-soft flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden bg-[#00212D]">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002B3B] via-transparent to-black/20"></div>

                {/* Course Type Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      course.course_type === 'live'
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-[#00A9D6] text-white shadow-cyan-glow'
                    }`}
                  >
                    {course.course_type === 'live' ? '🔴 Live Cohort' : '⚡ On-Demand'}
                  </span>
                </div>

                {/* Age Range Badge */}
                <div className="absolute top-3 right-3 bg-[#00212D]/85 backdrop-blur-md text-[#8DDFFF] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#004D6A]">
                  Ages {course.age_min}–{course.age_max}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[#36C7F4] font-medium">{course.category?.name || 'Technology'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration_hours}h duration
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-[#36C7F4] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {course.short_description}
                  </p>
                </div>

                {/* Footer details & Action */}
                <div className="pt-4 border-t border-[#00384D] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={course.instructor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt="Instructor"
                        className="w-7 h-7 rounded-full object-cover border border-[#00A9D6]"
                      />
                      <span className="text-xs text-gray-300 font-medium">
                        {course.instructor?.name || 'Master Instructor'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-white">
                        ${course.price}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{course.currency}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="py-2.5 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-gray-200 text-xs font-bold rounded-xl text-center transition-colors"
                    >
                      View Syllabus
                    </Link>

                    <button
                      onClick={() => openLeadModal(course)}
                      className="py-2.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:opacity-95 text-[#00212D] text-xs font-bold rounded-xl text-center transition-all shadow-cyan-glow"
                    >
                      Enroll / Ask
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. WHY LERNAL? (4 Core Pillars) */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#002837] border border-[#004D6A] rounded-4xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#36C7F4]">
              The Lernal Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Why Forward-Thinking Families Choose Lernal
            </h2>
            <p className="text-sm text-gray-300">
              We replaced boring slides and passive video watching with interactive sandbox projects, instant gamification, and verified child-safe mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#00212D] border border-[#003B4F] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#00A9D6]/20 text-[#36C7F4] flex items-center justify-center font-bold">
                <Zap className="w-6 h-6 fill-[#36C7F4]" />
              </div>
              <h4 className="text-base font-bold text-white font-display">Gamified Learning</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Kids earn XP points, collect astronaut badges, and tackle checkpoint quizzes that turn tough coding concepts into memorable games.
              </p>
            </div>

            <div className="bg-[#00212D] border border-[#003B4F] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">100% Kid-Safe</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Zero third-party advertisements, moderated child classrooms, background-checked mentors, and strict adherence to COPPA guidelines.
              </p>
            </div>

            <div className="bg-[#00212D] border border-[#003B4F] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">Parent Transparency</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                A dedicated Parent Portal allows you to track lesson completion, test scores, screen time schedules, and downloadable invoices.
              </p>
            </div>

            <div className="bg-[#00212D] border border-[#003B4F] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">Real Portfolio Assets</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Graduates don’t just memorize formulas—they leave with playable arcade games, pitch decks, and published animated short films.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 5. TESTIMONIALS */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Loved by Kids. Trusted by Parents.
          </h2>
          <p className="text-gray-300 text-sm">
            Read authentic experiences from the families in our 2026 cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 italic leading-relaxed">
              "My 10-year-old Leo was obsessed with Minecraft. Through Lernal's Creative Coding course, he learned how programming variables and loops actually work. He just finished his first playable arcade game!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#003B4F]">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                alt="Eleanor Wright"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h5 className="text-xs font-bold text-white">Eleanor Wright</h5>
                <span className="text-[10px] text-[#36C7F4]">Mother of Leo (Age 10) • Seattle, WA</span>
              </div>
            </div>
          </div>

          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 italic leading-relaxed">
              "The Parent Dashboard is fantastic. I get clear visibility into Sophie's quiz results and her digital art creations. The mentors speak with tremendous kindness and respect for children."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#003B4F]">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="David Chen"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h5 className="text-xs font-bold text-white">David Chen</h5>
                <span className="text-[10px] text-[#36C7F4]">Father of Sophie (Age 9) • Austin, TX</span>
              </div>
            </div>
          </div>

          <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 italic leading-relaxed">
              "I thought artificial intelligence would be too advanced for an 11-year-old, but Dr. Marcus broke it down through playful gesture recognition games. Noah loved taking the checkpoint quizzes!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#003B4F]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Jessica Parker"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h5 className="text-xs font-bold text-white">Jessica Parker</h5>
                <span className="text-[10px] text-[#36C7F4]">Mother of Noah (Age 11) • Chicago, IL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 6. BOTTOM HIGH-ENERGY CTA */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#002D3D] via-[#00384D] to-[#002D3D] border border-[#00A9D6]/40 rounded-4xl p-8 sm:p-14 text-center space-y-6 shadow-cyan-glow relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00212D] text-[#36C7F4] text-xs font-bold border border-[#004D6A]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Enrollment Open for 2026 Cohorts</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white max-w-2xl mx-auto leading-tight">
            Ready to Ignite Your Child’s Potential?
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of curious young minds mastering future technology. Browse available courses or request a customized learning consultation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-extrabold rounded-2xl text-sm shadow-cyan-glow transition-transform hover:scale-105"
            >
              Start Exploring Now
            </Link>

            <button
              onClick={() => openLeadModal()}
              className="w-full sm:w-auto px-7 py-4 bg-[#00212D] hover:bg-[#002837] text-white font-semibold rounded-2xl border border-[#004D6A] text-sm"
            >
              Book 1-on-1 Parent Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        preselectedCourse={leadModalCourse}
      />
    </div>
  );
};
