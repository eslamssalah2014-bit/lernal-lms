// ============================================================================
// LERNAL COURSE BUILDER & CURRICULUM MANAGEMENT
// Create courses, add modules, connect Bunny Stream video IDs, and manage syllabus
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Video,
  Clock,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  DollarSign,
  Play,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, CourseCategory } from '../../types';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFullDesc, setNewFullDesc] = useState('');
  const [newPrice, setNewPrice] = useState(99);
  const [newType, setNewType] = useState<'recorded' | 'live'>('recorded');
  const [newAgeMin, setNewAgeMin] = useState(6);
  const [newAgeMax, setNewAgeMax] = useState(14);
  const [newDuration, setNewDuration] = useState(10);
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Module & Lesson Builder State
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<any>(null);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newBunnyVideoId, setNewBunnyVideoId] = useState('');
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState('');

  useEffect(() => {
    fetchCourses();
    api.getCategories().then((res) => {
      if (res.categories) {
        setCategories(res.categories);
        if (res.categories[0]) setNewCategoryId(res.categories[0].id);
      }
    });
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCourses();
      if (res.courses) setCourses(res.courses);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newShortDesc) return;

    setIsCreatingCourse(true);
    try {
      await api.createCourse({
        title: newTitle,
        short_description: newShortDesc,
        full_description: newFullDesc || newShortDesc,
        price: newPrice,
        course_type: newType,
        age_min: newAgeMin,
        age_max: newAgeMax,
        duration_hours: newDuration,
        difficulty: newDifficulty,
        category_id: newCategoryId || categories[0]?.id,
        learning_outcomes: ['Understand core concepts', 'Build hands-on projects', 'Earn completion badge'],
      });
      setIsCourseModalOpen(false);
      setNewTitle('');
      setNewShortDesc('');
      setNewFullDesc('');
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Course creation failed');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const openCurriculumBuilder = async (courseId: string) => {
    try {
      const res = await api.getCourse(courseId);
      if (res.course) {
        setSelectedCourseForCurriculum(res.course);
        setIsCurriculumModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum || !newModuleTitle.trim()) return;

    try {
      await api.addModule(selectedCourseForCurriculum.id, { title: newModuleTitle.trim() });
      const updated = await api.getCourse(selectedCourseForCurriculum.id);
      setSelectedCourseForCurriculum(updated.course);
      setNewModuleTitle('');
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to add module');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim() || !newBunnyVideoId.trim()) {
      alert('Please enter a lesson title and Bunny Stream Video ID.');
      return;
    }

    try {
      await api.addLesson(moduleId, {
        title: newLessonTitle.trim(),
        duration_minutes: newLessonDuration,
        bunny_video_id: newBunnyVideoId.trim(),
      });
      const updated = await api.getCourse(selectedCourseForCurriculum.id);
      setSelectedCourseForCurriculum(updated.course);
      setNewLessonTitle('');
      setNewBunnyVideoId('');
      setActiveModuleIdForLesson('');
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to add lesson');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Course Builder & Curriculum
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create new courses, organize modules, attach Bunny Stream video IDs, and manage lesson previews.
          </p>
        </div>

        <button
          onClick={() => setIsCourseModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-cyan-glow transition-all hover:scale-105 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Course List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-5 space-y-4 shadow-card-soft flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#00212D]">
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-[#00212D]/85 backdrop-blur-md text-[#36C7F4] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#004D6A]">
                  {course.course_type.toUpperCase()}
                </span>
                <span className="absolute top-2.5 right-2.5 bg-[#00212D]/85 backdrop-blur-md text-[#8DDFFF] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#004D6A]">
                  Ages {course.age_min}–{course.age_max}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-white line-clamp-1">
                {course.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span>{course.difficulty}</span>
                <span className="font-extrabold text-white text-base">${course.price}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#00384D] grid grid-cols-2 gap-2">
              <button
                onClick={() => openCurriculumBuilder(course.id)}
                className="py-2 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-[#36C7F4] font-bold rounded-xl text-xs transition-colors text-center"
              >
                Curriculum
              </button>
              <a
                href={`/courses/${course.slug}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 bg-[#00384D] hover:bg-[#004D6A] text-gray-200 font-bold rounded-xl text-xs transition-colors text-center"
              >
                Preview Page
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* CREATE NEW COURSE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#00384D] pb-3">
              <h3 className="text-lg font-bold font-display text-white">Create New Course Program</h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Robotics & Sensor Explorers"
                  className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Short Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Bite-sized teaser for course card..."
                  className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl p-3 text-white focus:outline-none focus:border-[#36C7F4] resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Discipline</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Format Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                  >
                    <option value="recorded">⚡ Recorded (Self-Paced)</option>
                    <option value="live">🔴 Live Mentor Cohort</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Tuition Price ($)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Min Age</label>
                  <input
                    type="number"
                    value={newAgeMin}
                    onChange={(e) => setNewAgeMin(Number(e.target.value))}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Max Age</label>
                  <input
                    type="number"
                    value={newAgeMax}
                    onChange={(e) => setNewAgeMax(Number(e.target.value))}
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#36C7F4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#00384D]">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 bg-[#00212D] text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCourse}
                  className="px-5 py-2 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-extrabold rounded-xl shadow-cyan-glow"
                >
                  {isCreatingCourse ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* CURRICULUM & LESSON / BUNNY VIDEO BUILDER MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isCurriculumModalOpen && selectedCourseForCurriculum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#00384D] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#36C7F4] uppercase tracking-wider">
                  Curriculum Architecture
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  {selectedCourseForCurriculum.title}
                </h3>
              </div>
              <button onClick={() => setIsCurriculumModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Module Form */}
            <form onSubmit={handleAddModule} className="flex items-center gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="New Module Title (e.g. Module 3: Space Physics)..."
                className="flex-1 bg-[#00212D] border border-[#004D6A] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-cyan-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </form>

            {/* Modules List with Lessons and Bunny IDs */}
            <div className="space-y-4">
              {selectedCourseForCurriculum.modules?.map((mod: any, mIdx: number) => (
                <div key={mod.id} className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      Module {mIdx + 1}: {mod.title}
                    </h4>
                    <button
                      onClick={() => setActiveModuleIdForLesson(mod.id)}
                      className="text-[11px] font-bold text-[#36C7F4] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Attach Lesson</span>
                    </button>
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-2">
                    {mod.lessons?.map((les: any) => (
                      <div
                        key={les.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#002837] border border-[#00384D] text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Play className="w-3 h-3 text-[#36C7F4] flex-shrink-0" />
                          <span className="font-medium text-gray-200 truncate">{les.title}</span>
                          <span className="text-[10px] text-gray-400">({les.duration_minutes}m)</span>
                        </div>
                        <span className="text-[10px] text-[#8DDFFF] font-mono bg-[#00212D] px-2 py-0.5 rounded border border-[#004D6A]">
                          Bunny: {les.bunny_video_id || 'ID Pending'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add lesson sub-form if toggled */}
                  {activeModuleIdForLesson === mod.id && (
                    <div className="p-3 rounded-xl bg-[#00384D] border border-[#36C7F4]/40 space-y-2 text-xs">
                      <div className="font-bold text-white text-[11px]">Attach New Lesson to Module</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Lesson Title..."
                          className="bg-[#00212D] border border-[#004D6A] rounded-lg p-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={newBunnyVideoId}
                          onChange={(e) => setNewBunnyVideoId(e.target.value)}
                          placeholder="Bunny Video ID (e.g. vid_101)..."
                          className="bg-[#00212D] border border-[#004D6A] rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveModuleIdForLesson('')}
                          className="px-3 py-1 bg-[#00212D] text-gray-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddLesson(mod.id)}
                          className="px-3 py-1 bg-[#36C7F4] text-[#00212D] font-bold rounded-lg text-xs"
                        >
                          Save Lesson
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
