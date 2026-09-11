// ============================================================================
// LERNAL LMS - DATABASE ENTITY TYPES (TypeScript)
// Maps directly to Supabase PostgreSQL Schema tables
// ============================================================================

export type UserRole = 'admin' | 'instructor' | 'student' | 'parent';
export type CourseType = 'live' | 'recorded';
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'suspended' | 'cancelled';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'lost';
export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface Profile {
  id: string;
  auth_user_id?: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Parent {
  id: string;
  profile_id: string;
  emergency_contact?: string | null;
  billing_address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  profile_id: string;
  parent_id?: string | null;
  date_of_birth?: string | null;
  grade_level?: string | null;
  school_name?: string | null;
  interests?: string[];
  xp_points: number;
  badges_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Instructor {
  id: string;
  profile_id: string;
  title: string;
  bio?: string | null;
  specialties?: string[];
  rating: number;
  total_students: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string | null;
  display_order: number;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  category_id?: string | null;
  instructor_id?: string | null;
  course_type: CourseType;
  price: number;
  currency: string;
  age_min: number;
  age_max: number;
  duration_hours: number;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  is_featured: boolean;
  learning_outcomes?: string[];
  prerequisites?: string[];
  schedule_details?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Video {
  id: string;
  lesson_id: string;
  course_id: string;
  bunny_video_id: string;
  title: string;
  duration_seconds: number;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  playback_metadata?: Record<string, any>;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  parent_id?: string | null;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  enrolled_at?: string;
  completed_at?: string | null;
  last_accessed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  last_watched_at?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  parent_name: string;
  child_name: string;
  email: string;
  phone: string;
  course_id?: string | null;
  source: string;
  status: LeadStatus;
  message?: string | null;
  notes?: string | null;
  assigned_admin_id?: string | null;
  next_follow_up_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  admin_id: string;
  note: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  reference_no: string;
  student_id?: string | null;
  parent_id?: string | null;
  course_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: TransactionStatus;
  refund_amount: number;
  refund_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Test {
  id: string;
  course_id: string;
  module_id?: string | null;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  is_randomized: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string | null;
  order_index: number;
  created_at?: string;
}

export interface TestAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
  created_at?: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  student_id: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  started_at?: string;
  completed_at?: string | null;
  answers_summary?: Record<string, any>;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string | null;
  is_read: boolean;
  created_at?: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  description?: string | null;
  badge_icon: string;
  earned_at?: string;
}
