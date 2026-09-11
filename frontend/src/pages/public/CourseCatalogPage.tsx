// ============================================================================
// LERNAL COURSE CATALOG PAGE
// Comprehensive filterable catalog (Category, Type, Age Group, Difficulty, Search)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Video,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, CourseCategory } from '../../types';
import { LeadCaptureModal } from '../../components/common/LeadCaptureModal';

export const CourseCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');

  // Lead modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLeadCourse, setSelectedLeadCourse] = useState<Course | null>(null);

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedType, selectedDifficulty, selectedAge]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedAge !== 'all') params.age = parseInt(selectedAge, 10);
      if (searchQuery) params.search = searchQuery;

      const res = await api.getCourses(params);
      if (res.courses) setCourses(res.courses);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const openLeadModal = (course: Course) => {
    setSelectedLeadCourse(course);
    setIsLeadModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-[#002837] border border-[#004D6A] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#36C7F4]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00212D] text-[#36C7F4] text-xs font-bold rounded-full border border-[#004D6A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive EdTech Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Find the Perfect Course for Your Child
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed">
            Browse live small-group cohorts and self-paced recorded tracks in coding, artificial intelligence, finance, arts, and languages.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword (e.g. Scratch, Python, Robotics, Art)..."
              className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-bold text-xs rounded-xl transition-all shadow-cyan-glow flex items-center justify-center gap-2"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#00384D] text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-medium">Discipline</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#36C7F4]"
            >
              <option value="all">All Disciplines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-medium">Format</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#36C7F4]"
            >
              <option value="all">All Formats</option>
              <option value="recorded">⚡ On-Demand Recorded</option>
              <option value="live">🔴 Live Mentor Cohort</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-medium">Target Age</label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#36C7F4]"
            >
              <option value="all">All Age Groups (4–16)</option>
              <option value="6">Ages 4 to 7 (Early Explorers)</option>
              <option value="10">Ages 8 to 11 (Junior Builders)</option>
              <option value="14">Ages 12 to 16 (Advanced Innovators)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-medium">Difficulty Level</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#36C7F4]"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">Beginner (No Prior Exp)</option>
              <option value="intermediate">Intermediate (Some Code)</option>
              <option value="advanced">Advanced (Deep Projects)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course List Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Loading available courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-[#002837] border border-[#004D6A] rounded-3xl p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No courses match your filter criteria</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try loosening your filters or resetting your search term to see all available Lernal courses.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedDifficulty('all');
              setSelectedAge('all');
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-[#00A9D6] text-white rounded-xl text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-3xl overflow-hidden hover:border-[#36C7F4]/60 transition-all duration-300 shadow-card-soft flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail & Format Badges */}
                <div className="relative aspect-video overflow-hidden bg-[#00212D]">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002B3B] via-transparent to-black/20"></div>

                  <div className="absolute top-3 left-3">
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

                  <div className="absolute top-3 right-3 bg-[#00212D]/85 backdrop-blur-md text-[#8DDFFF] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#004D6A]">
                    Ages {course.age_min}–{course.age_max}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[#36C7F4] font-medium">{course.category?.name || 'Curriculum'}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration_hours}h total
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-[#36C7F4] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {course.short_description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-1">
                    {course.learning_outcomes.slice(0, 2).map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-[#00384D] space-y-3">
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="Instructor"
                      className="w-7 h-7 rounded-full object-cover border border-[#00A9D6]"
                    />
                    <div className="text-left">
                      <span className="text-xs text-gray-300 font-medium block leading-tight">
                        {course.instructor?.name}
                      </span>
                      <span className="text-[10px] text-gray-400">Master Instructor</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">${course.price}</span>
                    <span className="text-[10px] text-gray-400 block">{course.currency}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
          ))}
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        preselectedCourse={selectedLeadCourse}
      />
    </div>
  );
};
