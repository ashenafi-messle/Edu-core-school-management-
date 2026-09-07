/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Production-ready API Client for EduCore Multi-Tenant Campus System
// Integrates with Next.js API Routes and propagates tenant context ('X-School-ID')

const API_BASE_URL = '/api';

class ApiClient {
  private activeSchoolId: string | null = null;
  private connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  private requestCache: Map<string, { data: any; timestamp: number; expiry: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly DEFAULT_CACHE_TTL = 30000; // 30 seconds default cache for faster refresh

  constructor() {
    // Attempt to load previously saved active school/tenant
    // Only access localStorage on client-side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('educore-active-school-id');
      if (saved) {
        this.activeSchoolId = saved;
      }
    }
  }

  setSchoolId(schoolId: string | null) {
    this.activeSchoolId = schoolId;
    if (typeof window !== 'undefined') {
      if (schoolId) {
        localStorage.setItem('educore-active-school-id', schoolId);
      } else {
        localStorage.removeItem('educore-active-school-id');
      }
    }
  }

  getSchoolId(): string | null {
    return this.activeSchoolId;
  }

  async checkBackendConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/schools`, {
        method: 'GET',
        headers: this.getHeaders(true), // Skip tenant check for schools listing
      });
      if (res.ok) {
        this.connectionStatus = 'connected';
        return true;
      }
      this.connectionStatus = 'disconnected';
      return false;
    } catch (e) {
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  private getHeaders(skipTenantCheck = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (!skipTenantCheck && this.activeSchoolId) {
      headers['X-School-ID'] = this.activeSchoolId;
    }

    return headers;
  }

  // Cache management methods
  private getCacheKey(path: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${path}:${body}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.requestCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  private clearCache(): void {
    this.requestCache.clear();
  }

  private clearCachePattern(pattern: string): void {
    const keys = Array.from(this.requestCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.requestCache.delete(key);
      }
    });
  }

  private async fetchWithTimeout(url: string, options: RequestInit, headers: Record<string, string>): Promise<Response> {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    const externalSignal = options.signal;
    const forwardAbort = () => controller.abort();

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', forwardAbort, { once: true });
      }
    }

    try {
      return await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (timedOut) {
        throw new Error(`Request timed out after 15 seconds: ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', forwardAbort);
    }
  }

  // Base HTTP Request Wrapper with caching
  public async request<T>(path: string, options: RequestInit = {}, skipTenantCheck = false, cacheTTL?: number): Promise<T> {
    const headers = {
      ...this.getHeaders(skipTenantCheck),
      ...(options.headers as Record<string, string> || {}),
    };

    // If tenant context is required but missing, notify
    if (!skipTenantCheck && !headers['X-School-ID']) {
      console.warn(`API Request to ${path} made without X-School-ID context. Check if a school is selected.`);
      throw new Error('School ID is required for this operation. Please select a school first.');
    }

    const method = options.method || 'GET';
    const cacheKey = this.getCacheKey(path, options);

    // For GET requests, check cache first with optimistic behavior
    if (method === 'GET') {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData as T;
      }
    }

    // Check for pending identical requests (request deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        let response: Response;
        try {
          response = await this.fetchWithTimeout(`${API_BASE_URL}${path}`, options, headers);
        } catch (error) {
          if (!(error instanceof TypeError) || !error.message.includes('Failed to fetch')) throw error;
          await new Promise(resolve => setTimeout(resolve, 100)); // Reduced retry delay
          response = await this.fetchWithTimeout(`${API_BASE_URL}${path}`, options, headers);
        }

        if (!response.ok) {
          const errorMsg = await response.text();
          let parsedError: { error?: string; message?: string; details?: string };
          try {
            parsedError = errorMsg.trim() ? JSON.parse(errorMsg) : {};
          } catch {
            parsedError = { message: errorMsg.trim() };
          }
          console.error(`API Error for ${path}:`, parsedError);
          console.error(`Full error details:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: parsedError,
            rawResponse: errorMsg
          });
          // Try to extract the most informative error message
          const errorMessage = parsedError.error || parsedError.message || parsedError.details || `${response.status} ${response.statusText || 'API request failed'}`;
          throw new Error(errorMessage);
        }

        const data = await response.json() as T;

        // Cache successful GET requests with reduced TTL for faster updates
        if (method === 'GET') {
          const effectiveTTL = cacheTTL || this.DEFAULT_CACHE_TTL;
          this.setCache(cacheKey, data, effectiveTTL);
        }

        return data;
      } catch (error) {
        // Handle network errors specifically
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error(`Network error for ${path}:`, error);
          throw new Error(`Unable to reach ${API_BASE_URL}${path}. Make sure the Next.js server is running.`);
        }
        throw error;
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  async get<T = any>(path: string, params?: Record<string, string>): Promise<T> {
    const query = params
      ? `?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '')).toString()}`
      : '';
    return this.request<T>(`${path}${query}`);
  }

  async post<T = any>(path: string, body: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ==========================================
  // 1. SCHOOLS / TENANTS API
  // ==========================================
  
  async onboardSchool(school: { name: string; subdomain: string; domain?: string }): Promise<any> {
    this.clearCachePattern('/schools');
    return this.request<any>('/schools', {
      method: 'POST',
      body: JSON.stringify(school),
    }, true);
  }

  async getSchools(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/schools${params}`, { method: 'GET' }, true, 300000); // 5 minutes cache
  }

  async getSchoolDetails(id: string): Promise<any> {
    return this.request<any>(`/schools/${id}`, { method: 'GET' }, true, 300000); // 5 minutes cache
  }

  async updateSchool(id: string, updates: { name?: string; subdomain?: string; domain?: string; status?: string }): Promise<any> {
    this.clearCachePattern('/schools');
    return this.request<any>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, true);
  }

  async deleteSchool(id: string): Promise<any> {
    this.clearCachePattern('/schools');
    return this.request<any>(`/schools/${id}`, { method: 'DELETE' }, true);
  }

  // ==========================================
  // 2. USERS API
  // ==========================================
  
  async login(email: string, password: string): Promise<any> {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true); // skipTenantCheck is true because we don't have schoolId yet
  }

  async createUser(user: { email: string; password_hash: string; full_name: string; role: string; phone?: string }): Promise<any> {
    this.clearCachePattern('/users');
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async getUsers(): Promise<any[]> {
    return this.request<any[]>('/users', { method: 'GET' }, false, 120000); // 2 minutes cache
  }

  async getUser(id: string): Promise<any> {
    return this.request<any>(`/users/${id}`, { method: 'GET' }, false, 120000); // 2 minutes cache
  }

  async updateUser(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/users');
    this.clearCachePattern(`/users/${id}`);
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateUserWithStudentLink(id: string, userUpdates: any, studentUpdates?: any): Promise<any> {
    // First update the user
    const userResult = await this.updateUser(id, userUpdates);
    
    // If student updates are provided and user is a student, update the student record
    if (studentUpdates && userResult.role === 'student') {
      try {
        // Find the student record linked to this user
        const students = await this.getStudents();
        const studentRecord = students.find((s: any) => s.user_id === id);
        
        if (studentRecord) {
          await this.updateStudent(studentRecord.id, studentUpdates);
        }
      } catch (error) {
        console.error('Failed to update linked student record:', error);
      }
    }
    
    return userResult;
  }

  // ==========================================
  // ROLES & PERMISSIONS API
  // ==========================================
  
  async getRoles(): Promise<any[]> {
    return this.request<any[]>('/roles', { method: 'GET' });
  }

  async getRoleDetails(id: string): Promise<any> {
    return this.request<any>(`/roles/${id}`, { method: 'GET' });
  }

  async createRole(role: { name: string; description?: string; permissions: any }): Promise<any> {
    return this.request<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  }

  async updateRole(id: string, updates: { name?: string; description?: string; permissions?: any }): Promise<any> {
    return this.request<any>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRole(id: string): Promise<any> {
    return this.request<any>(`/roles/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // ACADEMIC YEARS API
  // ==========================================
  
  async getAcademicYears(includeArchived = false): Promise<any[]> {
    const params = includeArchived ? '?include_archived=true' : '';
    return this.request<any[]>(`/academic-years${params}`, { method: 'GET' });
  }

  async getAcademicYearDetails(id: string): Promise<any> {
    return this.request<any>(`/academic-years/${id}`, { method: 'GET' });
  }

  async createAcademicYear(academicYear: {
    year_name: string;
    academic_year_start: string;
    academic_year_end: string;
    current_semester?: string;
    semester_start_date?: string;
    semester_end_date?: string;
    notes?: string;
    is_active?: boolean;
  }): Promise<any> {
    return this.request<any>('/academic-years', {
      method: 'POST',
      body: JSON.stringify(academicYear),
    });
  }

  async updateAcademicYear(id: string, updates: {
    year_name?: string;
    academic_year_start?: string;
    academic_year_end?: string;
    current_semester?: string;
    semester_start_date?: string;
    semester_end_date?: string;
    is_active?: boolean;
    notes?: string;
  }): Promise<any> {
    return this.request<any>(`/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAcademicYear(id: string): Promise<any> {
    return this.request<any>(`/academic-years/${id}`, { method: 'DELETE' });
  }

  async archiveAcademicYear(id: string): Promise<any> {
    return this.request<any>(`/academic-years/${id}/archive`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async activateAcademicYear(id: string): Promise<any> {
    return this.request<any>(`/academic-years/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // ==========================================
  // ANALYTICS API
  // ==========================================
  
  async getAnalytics(period: string = 'daily', days: number = 30): Promise<any[]> {
    return this.request<any[]>(`/analytics?period=${period}&days=${days}`, { method: 'GET' });
  }

  async calculateStatistics(period: string): Promise<any> {
    return this.request<any>('/analytics/calculate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  }

  async logActivity(activity: {
    user_id: string;
    user_role: string;
    activity_type: string;
    page_name?: string;
    session_id?: string;
    metadata?: any;
  }): Promise<any> {
    return this.request<any>('/analytics/activity', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async deleteUser(id: string): Promise<any> {
    return this.request<any>(`/users/${id}`, { method: 'DELETE' });
  }

  async resetUserPassword(id: string, newPassword: string): Promise<any> {
    this.clearCachePattern('/users');
    return this.request<any>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  // ==========================================
  // 3. STUDENTS API
  // ==========================================

  async enrollStudent(student: { admission_number: string; full_name: string; grade_level: string; section?: string; parent_id?: string; user_id?: string }): Promise<any> {
    return this.request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  async getStudents(): Promise<any[]> {
    return this.request<any[]>('/students', { method: 'GET' });
  }

  async getStudent(id: string): Promise<any> {
    return this.request<any>(`/students/${id}`, { method: 'GET' });
  }

  async updateStudent(id: string, updates: any): Promise<any> {
    return this.request<any>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id: string): Promise<any> {
    return this.request<any>(`/students/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 7. SECTION CONFIGURATIONS API
  // ==========================================

  async createSectionConfiguration(config: { grade_level: string; section_name: string; max_capacity: number; academic_year: string; is_active?: boolean }): Promise<any> {
    return this.request<any>('/sections/configurations', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getSectionConfigurations(gradeLevel?: string, academicYear?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (gradeLevel) params.append('grade_level', gradeLevel);
    if (academicYear) params.append('academic_year', academicYear);
    const queryString = params.toString();
    return this.request<any[]>(`/sections/configurations${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  // ==========================================
  // 8. SECTION ALLOCATIONS API
  // ==========================================

  async allocateStudents(allocation: { grade_level: string; academic_year: string; students_per_section: number }): Promise<any> {
    return this.request<any>('/sections/allocations', {
      method: 'POST',
      body: JSON.stringify(allocation),
    });
  }

  async disallocateStudents(data: { student_ids: string[]; grade_level: string; academic_year: string }): Promise<any> {
    return this.request<any>('/sections/allocations', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getSectionAllocations(gradeLevel?: string, academicYear?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (gradeLevel) params.append('grade_level', gradeLevel);
    if (academicYear) params.append('academic_year', academicYear);
    const queryString = params.toString();
    return this.request<any[]>(`/sections/allocations${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  // ==========================================
  // 4. TEACHERS API
  // ==========================================

  async registerTeacher(teacher: { employee_id: string; full_name: string; department?: string; subjects?: string[]; user_id?: string }): Promise<any> {
    return this.request<any>('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
  }

  async getTeachers(): Promise<any[]> {
    return this.request<any[]>('/teachers', { method: 'GET' });
  }

  async getTeacher(id: string): Promise<any> {
    return this.request<any>(`/teachers/${id}`, { method: 'GET' });
  }

  async updateTeacher(id: string, updates: any): Promise<any> {
    return this.request<any>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTeacher(id: string): Promise<any> {
    return this.request<any>(`/teachers/${id}`, { method: 'DELETE' });
  }

  async getSubjects(): Promise<any[]> {
    return this.request<any[]>('/subjects', { method: 'GET' });
  }

  async getSubject(id: string): Promise<any> {
    return this.request<any>(`/subjects/${id}`, { method: 'GET' });
  }

  async createSubject(subject: {
    subject_code: string;
    subject_name: string;
    description?: string;
    category?: string;
    weekly_hours?: number;
    status?: string;
  }): Promise<any> {
    this.clearCachePattern('/subjects');
    return this.request<any>('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  }

  async updateSubject(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/subjects');
    return this.request<any>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSubject(id: string): Promise<any> {
    this.clearCachePattern('/subjects');
    return this.request<any>(`/subjects/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 5. PARENTS API
  // ==========================================

  async registerParent(parent: { full_name: string; relationship?: string; emergency_contact?: string; user_id?: string }): Promise<any> {
    return this.request<any>('/parents', {
      method: 'POST',
      body: JSON.stringify(parent),
    });
  }

  async getParents(): Promise<any[]> {
    return this.request<any[]>('/parents', { method: 'GET' });
  }

  async getParent(id: string): Promise<any> {
    return this.request<any>(`/parents/${id}`, { method: 'GET' });
  }

  async updateParent(id: string, updates: any): Promise<any> {
    return this.request<any>(`/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteParent(id: string): Promise<any> {
    return this.request<any>(`/parents/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 6. PAYMENTS / BILLING API
  // ==========================================

  async raiseInvoice(payment: { student_id: string; invoice_number: string; title: string; amount: number; due_date: string; status?: string }): Promise<any> {
    return this.request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async getPayments(): Promise<any[]> {
    return this.request<any[]>('/payments', { method: 'GET' });
  }

  async getPayment(id: string): Promise<any> {
    return this.request<any>(`/payments/${id}`, { method: 'GET' });
  }

  async updatePayment(id: string, updates: any): Promise<any> {
    return this.request<any>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePayment(id: string): Promise<any> {
    return this.request<any>(`/payments/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 7. ATTENDANCE API
  // ==========================================

  async recordAttendance(attendance: { student_id: string; class_date: string; status: string; remarks?: string; taken_by?: string }): Promise<any> {
    return this.request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  }

  async getAttendanceRecords(): Promise<any[]> {
    return this.request<any[]>('/attendance', { method: 'GET' });
  }

  async updateAttendance(id: string, updates: any): Promise<any> {
    return this.request<any>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ==========================================
  // 8. EXAMS & GRADES API
  // ==========================================

  async scheduleExam(exam: { title: string; subject: string; grade_level: string; max_score: number; exam_date: string }): Promise<any> {
    return this.request<any>('/exams', {
      method: 'POST',
      body: JSON.stringify(exam),
    });
  }

  async getExams(): Promise<any[]> {
    return this.request<any[]>('/exams', { method: 'GET' });
  }

  async gradeExam(examId: string, grade: { student_id: string; score: number; grade?: string; feedback?: string; graded_by?: string }): Promise<any> {
    return this.request<any>(`/exams/${examId}/grades`, {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  }

  async getExamGrades(examId: string): Promise<any[]> {
    return this.request<any[]>(`/exams/${examId}/grades`, { method: 'GET' });
  }

  async getStudentReportCard(studentId: string): Promise<any[]> {
    return this.request<any[]>(`/exams/student/${studentId}/report-card`, { method: 'GET' });
  }

  // ==========================================
  // SEEDER / AUTO-SYNC UTILITY
  // ==========================================
  /**
   * Helper to seed standard sandbox data directly into Supabase via the NestJS API
   */
  async seedSandboxData(onProgress: (status: string) => void): Promise<any> {
    onProgress('Creating Active School Tenant...');
    
    // 1. Create a school tenant
    const school = await this.onboardSchool({
      name: 'Oakridge International Academy',
      subdomain: 'oakridge',
      domain: 'oakridge.edu'
    });

    // Save and configure this school ID context
    this.setSchoolId(school.id);
    onProgress('School Tenant Activated. Seeding System Users...');

    // 2. Create users under this school
    const directorUser = await this.createUser({
      email: 'director@demo.com',
      password_hash: 'demo123',
      full_name: 'Dr. Sarah Jenkins',
      role: 'director',
      phone: '+1 555-0192'
    });

    const teacherUser = await this.createUser({
      email: 'teacher@demo.com',
      password_hash: 'demo123',
      full_name: 'Prof. Marcus Vance',
      role: 'teacher',
      phone: '+1 555-0143'
    });

    const studentUser = await this.createUser({
      email: 'student@demo.com',
      password_hash: 'demo123',
      full_name: 'Alex Rivera',
      role: 'student',
      phone: '+1 555-0112'
    });

    const parentUser = await this.createUser({
      email: 'parent@demo.com',
      password_hash: 'demo123',
      full_name: 'Eleanor Rivera',
      role: 'parent',
      phone: '+1 555-0188'
    });

    const adminUser = await this.createUser({
      email: 'admin@demo.com',
      password_hash: 'demo123',
      full_name: 'Robert Chen, Admin',
      role: 'admin',
      phone: '+1 555-0100'
    });

    onProgress('Users Configured. Creating Parent Profile...');

    // 3. Create Parent profile
    const parentProfile = await this.registerParent({
      full_name: 'Eleanor Rivera',
      relationship: 'Mother',
      emergency_contact: '+1 555-0199',
      user_id: parentUser.id
    });

    onProgress('Registering Students in School Roster...');

    // 4. Create Student profile
    const studentProfile = await this.enrollStudent({
      admission_number: 'ADM-2026-0091',
      full_name: 'Alex Rivera',
      grade_level: 'Grade 10',
      section: 'Section A',
      parent_id: parentProfile.id,
      user_id: studentUser.id
    });

    onProgress('Registering Teaching Staff...');

    // 5. Create Teacher profile
    const teacherProfile = await this.registerTeacher({
      employee_id: 'EMP-TEACH-820',
      full_name: 'Prof. Marcus Vance',
      department: 'Science & Chemistry',
      subjects: ['Organic Chemistry', 'Advanced Physics'],
      user_id: teacherUser.id
    });

    onProgress('Creating Active Invoices & Dues...');

    // 6. Create billing invoice
    const payment = await this.raiseInvoice({
      student_id: studentProfile.id,
      invoice_number: 'INV-2026-0421',
      title: 'Term 1 Tuition & Lab Fees',
      amount: 1540.00,
      due_date: '2026-08-15',
      status: 'unpaid'
    });

    onProgress('Recording Historical Attendance Logs...');

    // 7. Create attendance records
    await this.recordAttendance({
      student_id: studentProfile.id,
      class_date: new Date().toISOString().split('T')[0],
      status: 'present',
      remarks: 'Active participation',
      taken_by: teacherUser.id
    });

    onProgress('Scheduling Examinations & Recording Test Marks...');

    // 8. Create and schedule exam
    const exam = await this.scheduleExam({
      title: 'Midterm Organic Chemistry',
      subject: 'Organic Chemistry',
      grade_level: 'Grade 10',
      max_score: 100.00,
      exam_date: '2026-07-10'
    });

    // Grade the student
    await this.gradeExam(exam.id, {
      student_id: studentProfile.id,
      score: 92.50,
      grade: 'A',
      feedback: 'Excellent grasp of chemical formulas and atomic bonds.',
      graded_by: teacherUser.id
    });

    onProgress('Sandbox Synchronization Completed Successfully!');
    return {
      school,
      users: [directorUser, teacherUser, studentUser, parentUser, adminUser],
      studentProfile,
      teacherProfile,
      payment,
      exam
    };
  }

  // ==========================================
  // ONLINE REGISTRATION API
  // ==========================================
  async submitRegistration(applicationData: any): Promise<any> {
    try {
      // Try backend endpoint first if available
      const result = await this.request<any>('/registrations', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      }, true);
      return result;
    } catch (e) {
      // Store in local storage as a reliable persistence engine
      const existing = localStorage.getItem('educore-online-registrations');
      const list = existing ? JSON.parse(existing) : [];
      list.push(applicationData);
      localStorage.setItem('educore-online-registrations', JSON.stringify(list));
      return applicationData;
    }
  }

  async getRegistrations(): Promise<any[]> {
    try {
      return await this.request<any[]>('/registrations', { method: 'GET' }, true);
    } catch (e) {
      const existing = localStorage.getItem('educore-online-registrations');
      return existing ? JSON.parse(existing) : [];
    }
  }

  async getRegistrationByReferenceId(referenceId: string): Promise<any> {
    return this.request<any>(`/registrations?reference_id=${referenceId}`, { method: 'GET' }, true);
  }

  // ==========================================
  // 8. ADMIN REGISTRATIONS API
  // ==========================================

  async getAdminRegistrations(params?: { status?: string; page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<{ registrations: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    return this.request<any>(`/admin/registrations${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async getAdminRegistrationById(id: string): Promise<any> {
    return this.request<any>(`/admin/registrations/${id}`, { method: 'GET' });
  }

  async getRegistrationFile(id: string, fileType: 'birth_certificate' | 'school_records' | 'student_photo'): Promise<Blob> {
    const headers = this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/registrations/${id}/files/${fileType}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `HTTP ${response.status} Error`);
    }

    return response.blob();
  }

  async updateRegistrationStatus(id: string, action: 'verify_documents' | 'approve' | 'reject' | 'enroll', rejectionReason?: string): Promise<any> {
    return this.request<any>(`/admin/registrations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
  }

  async addRegistrationNotes(id: string, notes: string): Promise<any> {
    return this.request<any>(`/admin/registrations/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async updateRegistrationNotes(id: string, notes: string): Promise<any> {
    return this.request<any>(`/admin/registrations/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async getRegistrationCount(): Promise<number> {
    try {
      const result = await this.request<{ pagination: { total: number } }>('/admin/registrations?limit=0', { method: 'GET' });
      return result.pagination?.total || 0;
    } catch (e) {
      return 0;
    }
  }

  async searchUsers(query: string): Promise<{ users: any[] }> {
    if (!query || query.trim().length < 2) {
      return { users: [] };
    }
    return this.request<{ users: any[] }>(`/users/search?q=${encodeURIComponent(query.trim())}`, { method: 'GET' });
  }

  async getUserDetails(userId: string): Promise<{ user: any }> {
    return this.request<{ user: any }>(`/users/${userId}/details`, { method: 'GET' });
  }

  // ==========================================
  // CURRICULUM API
  // ==========================================

  async getCurriculumDocuments(filters?: {
    teacher_id?: string;
    subject_id?: string;
    document_type?: string;
    status?: string;
    academic_year_id?: string;
    grade_level?: string;
    section_name?: string;
    folder_id?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.document_type) params.append('document_type', filters.document_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.section_name) params.append('section_name', filters.section_name);
    if (filters?.folder_id) params.append('folder_id', filters.folder_id);
    
    const queryString = params.toString();
    return this.request<any[]>(`/curriculum${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async getCurriculumDocument(id: string): Promise<any> {
    return this.request<any>(`/curriculum/${id}`, { method: 'GET' });
  }

  async createCurriculumDocument(document: {
    teacher_id: string;
    subject_id?: string;
    title: string;
    description?: string;
    document_type: 'syllabus' | 'teaching_material' | 'assessment' | 'reference';
    academic_year_id?: string;
    grade_level?: string;
    section_name?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    storage_path?: string;
    is_public?: boolean;
    status?: 'draft' | 'published' | 'archived';
    folder_id?: string;
  }): Promise<any> {
    console.log('API: Creating curriculum document with data:', document);
    console.log('File fields in API call:', {
      file_url: document.file_url,
      file_name: document.file_name,
      file_size: document.file_size,
      file_type: document.file_type,
      storage_path: document.storage_path
    });
    
    this.clearCachePattern('/curriculum');
    return this.request<any>('/curriculum', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateCurriculumDocument(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/curriculum');
    return this.request<any>(`/curriculum/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCurriculumDocument(id: string): Promise<any> {
    this.clearCachePattern('/curriculum');
    return this.request<any>(`/curriculum/${id}`, { method: 'DELETE' });
  }

  async getCurriculumFolders(teacherId?: string): Promise<any[]> {
    const params = teacherId ? `?teacher_id=${teacherId}` : '';
    return this.request<any[]>(`/curriculum/folders${params}`, { method: 'GET' });
  }

  async getCurriculumFolder(id: string): Promise<any> {
    return this.request<any>(`/curriculum/folders/${id}`, { method: 'GET' });
  }

  async createCurriculumFolder(folder: {
    teacher_id: string;
    parent_folder_id?: string;
    folder_name: string;
    description?: string;
    folder_type?: 'general' | 'subject_specific' | 'grade_specific';
    subject_id?: string;
    grade_level?: string;
    section_name?: string;
    sort_order?: number;
  }): Promise<any> {
    this.clearCachePattern('/curriculum/folders');
    return this.request<any>('/curriculum/folders', {
      method: 'POST',
      body: JSON.stringify(folder),
    });
  }

  async updateCurriculumFolder(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/curriculum/folders');
    return this.request<any>(`/curriculum/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCurriculumFolder(id: string): Promise<any> {
    this.clearCachePattern('/curriculum/folders');
    return this.request<any>(`/curriculum/folders/${id}`, { method: 'DELETE' });
  }

  async getCurriculumShares(documentId?: string, sharedWith?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (documentId) params.append('document_id', documentId);
    if (sharedWith) params.append('shared_with', sharedWith);
    
    const queryString = params.toString();
    return this.request<any[]>(`/curriculum/shares${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async createCurriculumShare(share: {
    document_id: string;
    shared_with: string;
    share_type?: 'view' | 'edit' | 'comment';
    expires_at?: string;
  }): Promise<any> {
    this.clearCachePattern('/curriculum/shares');
    return this.request<any>('/curriculum/shares', {
      method: 'POST',
      body: JSON.stringify(share),
    });
  }

  async updateCurriculumShare(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/curriculum/shares');
    return this.request<any>(`/curriculum/shares/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCurriculumShare(id: string): Promise<any> {
    this.clearCachePattern('/curriculum/shares');
    return this.request<any>(`/curriculum/shares/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // FILE UPLOAD API
  // ==========================================

  async uploadCurriculumFile(file: File, teacherId: string): Promise<any> {
    console.log('API: Starting file upload', { fileName: file.name, fileSize: file.size, teacherId });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('teacher_id', teacherId);

    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary

    console.log('API: Sending upload request to', `${API_BASE_URL}/curriculum/upload`);

    const response = await fetch(`${API_BASE_URL}/curriculum/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('API: Upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Upload failed with error:', errorText);
      throw new Error(errorText || 'Failed to upload file');
    }

    const result = await response.json();
    console.log('API: Upload result:', result);
    return result;
  }

  // ==========================================
  // STUDENT CURRICULUM API
  // ==========================================

  async getStudentCurriculumDocuments(studentId: string, filters?: {
    subject_id?: string;
    document_type?: string;
    grade_level?: string;
    section_name?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.document_type) params.append('document_type', filters.document_type);
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.section_name) params.append('section_name', filters.section_name);
    
    const queryString = params.toString();
    return this.request<any[]>(`/students/${studentId}/curriculum${queryString ? `?${queryString}` : ''}`, { method: 'GET' }, false, 1);
  }

  async downloadCurriculumDocument(documentId: string): Promise<Blob> {
    const headers = this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/curriculum/${documentId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to download document');
    }

    const blob = await response.blob();
    if (!blob.size) throw new Error('Downloaded file is empty');
    return blob;
  }

  // ==========================================
  // ASSIGNMENTS API
  // ==========================================

  async createAssignment(assignment: {
    teacher_id: string;
    subject_id?: string;
    title: string;
    description?: string;
    assignment_type: 'homework' | 'assignment' | 'project';
    instructions?: string;
    academic_year_id?: string;
    grade_level?: string;
    section_name?: string;
    max_marks: number;
    due_date: string;
    status?: string;
    attachments?: any[];
  }): Promise<any> {
    this.clearCachePattern('/assignments');
    return this.request<any>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async getAssignments(filters?: {
    teacher_id?: string;
    subject_id?: string;
    assignment_type?: string;
    status?: string;
    grade_level?: string;
    section_name?: string;
    academic_year_id?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.assignment_type) params.append('assignment_type', filters.assignment_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.section_name) params.append('section_name', filters.section_name);
    if (filters?.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    
    const queryString = params.toString();
    return this.request<any[]>(`/assignments${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async getAssignment(id: string): Promise<any> {
    return this.request<any>(`/assignments/${id}`, { method: 'GET' });
  }

  async updateAssignment(id: string, updates: any): Promise<any> {
    this.clearCachePattern('/assignments');
    return this.request<any>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAssignment(id: string): Promise<any> {
    this.clearCachePattern('/assignments');
    return this.request<any>(`/assignments/${id}`, { method: 'DELETE' });
  }

  async createSubmission(assignmentId: string, submission: {
    student_id: string;
    student_answer?: string;
    student_comments?: string;
    file_attachments?: any[];
    submission_status?: string;
  }): Promise<any> {
    this.clearCachePattern('/assignments');
    return this.request<any>(`/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async getAssignmentSubmissions(assignmentId: string, status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/assignments/${assignmentId}/submissions${params}`, { method: 'GET' });
  }

  async getSubmission(assignmentId: string, submissionId: string): Promise<any> {
    return this.request<any>(`/assignments/${assignmentId}/submissions/${submissionId}`, { method: 'GET' });
  }

  async gradeSubmission(assignmentId: string, submissionId: string, grade: {
    score: number;
    teacher_feedback?: string;
    graded_by?: string;
  }): Promise<any> {
    this.clearCachePattern('/assignments');
    return this.request<any>(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  }

  async getSubmissionGrade(assignmentId: string, submissionId: string): Promise<any> {
    return this.request<any>(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, { method: 'GET' });
  }

  async getPendingGrading(filters?: {
    teacher_id: string;
    subject_id?: string;
    grade_level?: string;
    section_name?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.section_name) params.append('section_name', filters.section_name);
    
    const queryString = params.toString();
    return this.request<any[]>(`/assignments/pending-grading${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }
}

export const api = new ApiClient();
