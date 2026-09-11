// ============================================================================
// LERNAL INTERACTIVE QUIZ & TESTING PAGE
// Timed test taking, auto-grading, confetti celebration, and detailed explanations
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';
import { TestDetail } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const QuizTakePage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-switch to student if guest
  useEffect(() => {
    if (!user) {
      loginDemo('student');
    }
  }, [user]);

  useEffect(() => {
    if (testId) {
      setIsLoading(true);
      api
        .getTest(testId)
        .then((res) => {
          if (res.test) {
            setTest(res.test);
            setTimeLeftSeconds(res.test.time_limit_minutes * 60);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [testId]);

  // Countdown timer
  useEffect(() => {
    if (quizResult || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeftSeconds, quizResult]);

  const selectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    if (!test || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitTest(test.id, selectedAnswers);
      setQuizResult(res.result);

      if (res.result.passed) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFB800', '#36C7F4', '#10B981', '#FF6B4A'],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading || !test) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Preparing interactive quest...</p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RESULTS SCREEN
  // --------------------------------------------------------------------------
  if (quizResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fadeIn">
        <div className="bg-[#002B3B] border border-[#004D6A] rounded-4xl p-8 sm:p-12 text-center space-y-6 shadow-card-soft">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
              quizResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400'
            }`}
          >
            {quizResult.passed ? <Trophy className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                quizResult.passed ? 'bg-emerald-500 text-[#00212D]' : 'bg-amber-400 text-[#00212D]'
              }`}
            >
              {quizResult.passed ? 'MISSION ACCOMPLISHED! 🌟' : 'KEEP PRACTICING! 💪'}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              {quizResult.passed ? 'Challenge Mastered!' : 'Great Effort, Cadet!'}
            </h1>

            <p className="text-sm text-gray-300 max-w-md mx-auto">{quizResult.feedback}</p>
          </div>

          {/* Score Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-white">{quizResult.percentage}%</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Your Score</div>
            </div>

            <div className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-[#36C7F4]">{quizResult.passing_score}%</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Passing Mark</div>
            </div>

            <div className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 fill-amber-400" />
                <span>+{quizResult.earned_xp}</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">XP Awarded</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={`/student/courses/${test.course_id}/play`}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-extrabold rounded-2xl text-xs shadow-cyan-glow"
            >
              Continue Learning Next Lesson
            </Link>

            <button
              onClick={() => {
                setQuizResult(null);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);
                setTimeLeftSeconds(test.time_limit_minutes * 60);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-gray-200 font-bold rounded-2xl text-xs"
            >
              Try Quiz Again
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-white">Answer Breakdown & Explanations</h3>

          <div className="space-y-3">
            {quizResult.breakdown?.map((item: any, idx: number) => (
              <div
                key={item.question_id}
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  item.is_correct
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    Question {idx + 1}: {item.question_text}
                  </span>
                  {item.is_correct ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Correct (+{item.points_awarded} pts)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                    </span>
                  )}
                </div>

                <div className="text-gray-300 text-[11px] pt-1 border-t border-white/10">
                  <span className="font-bold text-[#8DDFFF]">Explanation: </span>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TEST TAKING SCREEN
  // --------------------------------------------------------------------------
  const currentQuestion = test.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const isAnswered = Boolean(selectedAnswers[currentQuestion.id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/courses/${test.course_id}/play`}
          className="text-xs font-bold text-[#36C7F4] flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Quest</span>
        </Link>

        {/* Timer Pill */}
        <div className="flex items-center gap-2 bg-[#002B3B] border border-[#004D6A] px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Test Card */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-4xl p-6 sm:p-10 shadow-card-soft space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </span>
            <span className="text-[#36C7F4]">{currentQuestion.points} Points</span>
          </div>
          <div className="w-full bg-[#00212D] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#8DDFFF] uppercase tracking-wider">
            {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Answer Choices */}
        <div className="space-y-3 pt-2">
          {currentQuestion.answers.map((ans, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === ans.id;
            return (
              <button
                key={ans.id}
                onClick={() => selectAnswer(currentQuestion.id, ans.id)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#003B4F] border-[#36C7F4] text-white shadow-cyan-glow'
                    : 'bg-[#00212D] border-[#00384D] text-gray-300 hover:border-[#36C7F4]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-[#36C7F4] text-[#00212D]'
                        : 'bg-[#002B3B] text-gray-400 border border-[#004D6A]'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{ans.answer_text}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#36C7F4] bg-[#36C7F4]' : 'border-gray-500'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#00212D]"></div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Question Navigation Footer */}
        <div className="pt-6 border-t border-[#00384D] flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-[#004D6A] text-xs font-bold text-gray-300 disabled:opacity-30 hover:bg-[#00212D]"
          >
            Previous
          </button>

          {currentQuestionIndex < test.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              disabled={!isAnswered}
              className="px-6 py-2.5 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-cyan-glow disabled:opacity-40"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#00212D] font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Trophy className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating Score...' : 'Submit Final Answers'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
