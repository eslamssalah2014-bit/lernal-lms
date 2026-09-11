export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student' | 'parent';
  avatar_url: string;
  phone?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
  bunny_video_id?: string;
  video_url?: string;
  can_access?: boolean;
  has_video?: boolean;
  resources?: LessonResource[];
  progress?: {
    watch_time_seconds: number;
    is_completed: boolean;
  };
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  thumbnail_url: string;
  banner_url?: string;
  category_id: string;
  instructor_id: string;
  course_type: 'live' | 'recorded';
  price: number;
  currency: string;
  age_min: number;
  age_max: number;
  duration_hours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  learning_outcomes: string[];
  schedule_details?: string;
  category?: CourseCategory;
  instructor?: {
    id: string;
    name: string;
    title: string;
    avatar_url: string;
    rating: number;
    bio?: string;
    specialties?: string[];
  } | null;
  stats?: {
    modules_count: number;
    lessons_count: number;
    enrollments_count: number;
    total_modules?: number;
    total_lessons?: number;
  };
  modules?: CourseModule[];
  user_access?: {
    is_enrolled: boolean;
    enrollment?: any;
  };
}

export interface LeadNote {
  id: string;
  lead_id: string;
  admin_id: string;
  admin_name?: string;
  admin_avatar?: string;
  note: string;
  created_at: string;
}

export interface Lead {
  id: string;
  parent_name: string;
  child_name: string;
  email: string;
  phone: string;
  course_id?: string;
  course_title?: string;
  course_thumbnail?: string;
  source: string;
  status: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'lost';
  message?: string;
  notes?: string;
  notes_count?: number;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
  next_follow_up_date?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  reference_no: string;
  student_id?: string;
  student_name?: string;
  parent_id?: string;
  parent_name?: string;
  parent_email?: string;
  course_id: string;
  course_title: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  refund_amount?: number;
  refund_reason?: string;
  notes?: string;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points: number;
  order_index: number;
  answers: Array<{
    id: string;
    answer_text: string;
    order_index: number;
  }>;
}

export interface TestDetail {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  total_questions: number;
  questions: TestQuestion[];
  user_attempts_count?: number;
  previous_best?: number | null;
}
