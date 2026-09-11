// ============================================================================
// LERNAL LMS - REST API CLIENT
// Connects frontend (Vercel) to backend (Render) with token management
// ============================================================================

// Support NEXT_PUBLIC_API_URL, VITE_API_URL, and BACKEND_URL with intelligent URL normalization
const getApiBaseUrl = (): string => {
  const raw = (
    import.meta.env.NEXT_PUBLIC_API_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.BACKEND_URL ||
    '/api'
  ).trim().replace(/\/+$/, '');

  // If a full remote URL is provided without /api (e.g. https://your-app.onrender.com), append /api
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  return raw || '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('lernal_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP Error ${response.status}`);
    }

    return data as T;
  }

  // --- Auth ---
  public async getDemoAccounts() {
    return this.request<any>('/auth/demo-accounts');
  }

  public async login(payload: { email?: string; password?: string; role?: string }) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async register(payload: { email: string; full_name: string; role?: string; phone?: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async forgotPassword(email: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async getMe() {
    return this.request<any>('/auth/me');
  }

  // --- Courses ---
  public async getCategories() {
    return this.request<any>('/courses/categories');
  }

  public async getCourses(params?: { category?: string; type?: string; search?: string; difficulty?: string; age?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.age) query.set('age', params.age.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/courses${qs}`);
  }

  public async getCourse(idOrSlug: string) {
    return this.request<any>(`/courses/${idOrSlug}`);
  }

  public async createCourse(data: any) {
    return this.request<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async addModule(courseId: string, data: any) {
    return this.request<any>(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async addLesson(moduleId: string, data: any) {
    return this.request<any>(`/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Video Streaming (Bunny Stream) ---
  public async getLessonVideoAccess(lessonId: string) {
    return this.request<any>(`/videos/lessons/${lessonId}/access`);
  }

  // --- Leads CRM ---
  public async submitLead(data: {
    parent_name: string;
    child_name?: string;
    email: string;
    phone: string;
    course_id?: string;
    message?: string;
    source?: string;
  }) {
    return this.request<any>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getLeads(params?: { status?: string; search?: string; course_id?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.course_id) query.set('course_id', params.course_id);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/leads${qs}`);
  }

  public async getLead(id: string) {
    return this.request<any>(`/leads/${id}`);
  }

  public async updateLeadStatus(id: string, status: string, next_follow_up_date?: string) {
    return this.request<any>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, next_follow_up_date }),
    });
  }

  public async addLeadNote(id: string, note: string) {
    return this.request<any>(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  public async convertLead(id: string, course_id?: string) {
    return this.request<any>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify({ course_id }),
    });
  }

  // --- Finance ---
  public async getFinanceDashboard() {
    return this.request<any>('/finance/dashboard');
  }

  public async getTransactions(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/finance/transactions${qs}`);
  }

  public async refundTransaction(id: string, reason?: string) {
    return this.request<any>(`/finance/transactions/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- Testing & Quizzes ---
  public async getTests(courseId?: string) {
    const qs = courseId ? `?course_id=${courseId}` : '';
    return this.request<any>(`/tests${qs}`);
  }

  public async getTest(testId: string) {
    return this.request<any>(`/tests/${testId}`);
  }

  public async submitTest(testId: string, answers: Record<string, string>) {
    return this.request<any>(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // --- Student Learning Hub ---
  public async getStudentDashboard() {
    return this.request<any>('/student/dashboard');
  }

  public async enrollStudent(courseId: string) {
    return this.request<any>('/student/enroll', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  }

  public async updateLessonProgress(lessonId: string, is_completed: boolean, watch_time_seconds?: number) {
    return this.request<any>(`/student/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ is_completed, watch_time_seconds }),
    });
  }

  // --- Parent Portal ---
  public async getParentDashboard() {
    return this.request<any>('/parent/dashboard');
  }

  // --- Admin Command Center ---
  public async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  public async getAdminRosters() {
    return this.request<any>('/admin/rosters');
  }
}

export const api = new ApiClient();
