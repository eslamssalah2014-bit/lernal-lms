// ============================================================================
// LERNAL PLATFORM ROSTERS
// Comprehensive directory of Students, Parents, and Instructors
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Sparkles, Mail, Phone, BookOpen, Award } from 'lucide-react';
import { api } from '../../services/api';

export const AdminRostersPage: React.FC = () => {
  const [rosters, setRosters] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'instructors'>('students');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminRosters().then((res) => {
      setRosters(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !rosters) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Loading user rosters...</p>
      </div>
    );
  }

  const { students, parents, instructors } = rosters;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Platform Rosters & Directory
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage enrolled students, registered parents, and instructional staff.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#00384D] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
              : 'bg-[#002B3B] text-gray-300 hover:bg-[#00384D]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Learners ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('parents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'parents'
              ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
              : 'bg-[#002B3B] text-gray-300 hover:bg-[#00384D]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Parents ({parents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('instructors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'instructors'
              ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
              : 'bg-[#002B3B] text-gray-300 hover:bg-[#00384D]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Instructors ({instructors.length})</span>
        </button>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'students' &&
          students.map((s: any) => (
            <div
              key={s.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{s.name}</div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {s.xp_points} XP
                </span>
              </div>
              <div className="text-gray-300">{s.grade_level} • {s.school_name}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#00384D]">
                <span>{s.enrolled_courses_count} Active Courses</span>
                <span className="text-[#36C7F4]">{s.badges_count} Badges Earned</span>
              </div>
            </div>
          ))}

        {activeTab === 'parents' &&
          parents.map((p: any) => (
            <div
              key={p.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{p.name}</div>
                <span className="text-[10px] text-[#36C7F4] bg-[#00212D] px-2 py-0.5 rounded-full border border-[#004D6A]">
                  {p.children_count} Children
                </span>
              </div>
              <div className="text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{p.email}</span>
              </div>
              <div className="text-gray-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{p.phone || p.emergency_contact}</span>
              </div>
            </div>
          ))}

        {activeTab === 'instructors' &&
          instructors.map((ins: any) => (
            <div
              key={ins.id}
              className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{ins.name}</div>
                <span className="text-[10px] text-amber-400 font-bold bg-[#00212D] px-2 py-0.5 rounded-full border border-[#004D6A]">
                  ★ {ins.rating}
                </span>
              </div>
              <div className="text-[#36C7F4] font-medium">{ins.title}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#00384D]">
                <span>{ins.total_students} Students Mentored</span>
                <span className="text-gray-300 font-medium truncate max-w-[120px]">
                  {ins.specialties?.join(', ')}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
