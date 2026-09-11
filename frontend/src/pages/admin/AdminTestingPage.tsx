// ============================================================================
// LERNAL TESTING & QUIZ MANAGEMENT MODULE
// Quiz inspection, passing criteria, and student attempt grading records
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Award,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminTestingPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTests();
      if (res.tests) {
        setTests(res.tests);
        if (res.tests[0]) {
          const detail = await api.getTest(res.tests[0].id);
          setSelectedTest(detail.test);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTest = async (testId: string) => {
    try {
      const detail = await api.getTest(testId);
      setSelectedTest(detail.test);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Loading testing module...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Testing & Assessment Module
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review curriculum checkpoint quizzes, configure passing score thresholds, and audit student test attempts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Test List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Active Checkpoints & Quizzes</span>
          </h3>

          <div className="space-y-3">
            {tests.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTest(t.id)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedTest?.id === t.id
                    ? 'bg-[#00384D] border-[#36C7F4] text-white shadow-cyan-glow'
                    : 'bg-[#002B3B] border-[#004D6A] text-gray-300 hover:bg-[#003347]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>{t.title}</span>
                  <span className="text-amber-400 font-extrabold">{t.passing_score}% Pass</span>
                </div>
                <div className="text-[11px] text-[#8DDFFF] truncate">{t.course_title}</div>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2 pt-2 border-t border-white/10">
                  <span>{t.total_questions} Questions</span>
                  <span>{t.time_limit_minutes} Mins Limit</span>
                  <span>Max {t.max_attempts} Attempts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Test Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-soft">
          {selectedTest ? (
            <div className="space-y-6">
              <div className="space-y-1 border-b border-[#00384D] pb-4">
                <span className="text-[10px] font-bold text-[#36C7F4] uppercase tracking-wider">
                  Test Detail Inspector
                </span>
                <h2 className="text-xl font-bold font-display text-white">{selectedTest.title}</h2>
                <p className="text-xs text-gray-300">{selectedTest.description}</p>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gray-400">
                  Configured Questions ({selectedTest.questions?.length || 0})
                </h4>

                <div className="space-y-3">
                  {selectedTest.questions?.map((q: any, qIdx: number) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-[#00212D] border border-[#00384D] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>
                          Q{qIdx + 1}: {q.question_text}
                        </span>
                        <span className="text-[#36C7F4]">{q.points} pts</span>
                      </div>

                      {/* Answers choices preview */}
                      <div className="space-y-1 pt-1">
                        {q.answers?.map((a: any, aIdx: number) => (
                          <div
                            key={a.id}
                            className="p-2 rounded-lg bg-[#002837] border border-[#003B4F] text-[11px] text-gray-300 flex items-center gap-2"
                          >
                            <span className="font-mono text-gray-500">{String.fromCharCode(65 + aIdx)}.</span>
                            <span>{a.answer_text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 text-xs">
              Select a quiz to inspect questions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
