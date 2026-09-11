// ============================================================================
// LEADS CENTER (LIGHTWEIGHT CRM ENGINE) ROUTES
// Public inquiry capture, lead progression, notes history, and conversion to enrollment
// ============================================================================

import { Router, Request, Response } from 'express';
import { db, Lead, LeadNote } from '../data/mockDatabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ----------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ----------------------------------------------------------------------------

// POST /api/leads - Capture inquiry form submission from landing / course page
router.post('/', (req: Request, res: Response) => {
  const { parent_name, child_name, email, phone, course_id, message, source = 'Website Contact Form' } = req.body;

  if (!parent_name || !email || !phone) {
    return res.status(400).json({ error: 'Parent Name, Email, and Phone number are required' });
  }

  // Prevent duplicate spam within recent window
  const duplicate = db.leads.find(
    (l) => l.email.toLowerCase() === email.toLowerCase() && l.status === 'new' && l.course_id === course_id
  );
  if (duplicate) {
    return res.json({
      success: true,
      message: 'Thank you! We already received your inquiry and a Lernal educational advisor will reach out shortly.',
      lead_id: duplicate.id,
    });
  }

  const newLead: Lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    parent_name,
    child_name: child_name || 'Prospective Learner',
    email,
    phone,
    course_id: course_id || undefined,
    source,
    status: 'new',
    message: message || '',
    assigned_admin_id: '22222222-0000-0000-0000-000000000001', // Default assigned admin
    next_follow_up_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  db.leads.unshift(newLead);

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! A Lernal advisor will connect with you within 24 hours.',
    lead: newLead,
  });
});

// ----------------------------------------------------------------------------
// ADMIN CRM ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/leads - Filterable CRM lead pipeline & summary metrics
router.get('/', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, search, course_id, sort = 'desc' } = req.query;

  let filtered = [...db.leads];

  if (status && status !== 'all') {
    filtered = filtered.filter((l) => l.status === status);
  }

  if (course_id) {
    filtered = filtered.filter((l) => l.course_id === course_id);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.parent_name.toLowerCase().includes(q) ||
        l.child_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }

  // Sort by date
  filtered.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const dbTime = new Date(b.created_at).getTime();
    return sort === 'asc' ? da - dbTime : dbTime - da;
  });

  // Hydrate with course and notes count
  const hydrated = filtered.map((lead) => {
    const course = lead.course_id ? db.courses.find((c) => c.id === lead.course_id) : null;
    const notes = db.leadNotes.filter((n) => n.lead_id === lead.id);
    const assignedAdmin = lead.assigned_admin_id
      ? db.profiles.find((p) => p.id === lead.assigned_admin_id)
      : null;

    return {
      ...lead,
      course_title: course ? course.title : 'General Platform Inquiry',
      course_thumbnail: course ? course.thumbnail_url : null,
      notes_count: notes.length,
      assigned_admin_name: assignedAdmin ? assignedAdmin.full_name : 'Unassigned',
    };
  });

  // Calculate CRM conversion metrics
  const totalLeads = db.leads.length;
  const newLeads = db.leads.filter((l) => l.status === 'new').length;
  const contacted = db.leads.filter((l) => l.status === 'contacted').length;
  const interested = db.leads.filter((l) => l.status === 'interested').length;
  const followUp = db.leads.filter((l) => l.status === 'follow_up').length;
  const converted = db.leads.filter((l) => l.status === 'converted').length;
  const lost = db.leads.filter((l) => l.status === 'lost' || l.status === 'not_interested').length;
  const conversionRate = totalLeads > 0 ? Number(((converted / totalLeads) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    metrics: {
      total: totalLeads,
      new: newLeads,
      contacted,
      interested,
      follow_up: followUp,
      converted,
      lost,
      conversion_rate: conversionRate,
    },
    leads: hydrated,
  });
});

// GET /api/leads/:id - Single lead details with complete notes log
router.get('/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const lead = db.leads.find((l) => l.id === id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const course = lead.course_id ? db.courses.find((c) => c.id === lead.course_id) : null;
  const notes = db.leadNotes
    .filter((n) => n.lead_id === lead.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((note) => {
      const admin = db.profiles.find((p) => p.id === note.admin_id);
      return {
        ...note,
        admin_name: admin ? admin.full_name : 'System Admin',
        admin_avatar: admin ? admin.avatar_url : '',
      };
    });

  res.json({
    success: true,
    lead: {
      ...lead,
      course,
      notes,
    },
  });
});

// PATCH /api/leads/:id/status - Update lead status
router.patch('/:id/status', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, next_follow_up_date } = req.body;

  const validStatuses = ['new', 'contacted', 'interested', 'follow_up', 'converted', 'not_interested', 'lost'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const lead = db.leads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const prevStatus = lead.status;
  lead.status = status;
  if (next_follow_up_date !== undefined) {
    lead.next_follow_up_date = next_follow_up_date;
  }

  // Add automated note for status change
  db.leadNotes.push({
    id: `note-${Date.now()}`,
    lead_id: id,
    admin_id: req.user!.id,
    note: `Status updated from "${prevStatus.toUpperCase()}" to "${status.toUpperCase()}".`,
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, lead });
});

// POST /api/leads/:id/notes - Add interaction note
router.post('/:id/notes', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  const lead = db.leads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const newNote: LeadNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    lead_id: id,
    admin_id: req.user!.id,
    note: note.trim(),
    created_at: new Date().toISOString(),
  };

  db.leadNotes.push(newNote);

  res.status(201).json({
    success: true,
    note: {
      ...newNote,
      admin_name: req.user!.full_name,
      admin_avatar: req.user!.avatar_url,
    },
  });
});

// POST /api/leads/:id/convert - Convert lead directly into an enrolled student + transaction
router.post('/:id/convert', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { course_id } = req.body;

  const lead = db.leads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const targetCourseId = course_id || lead.course_id;
  const course = targetCourseId ? db.courses.find((c) => c.id === targetCourseId) : null;
  if (!course) {
    return res.status(400).json({ error: 'Target course must be selected to convert lead.' });
  }

  // 1. Create or find parent
  let parentProfile = db.profiles.find((p) => p.email.toLowerCase() === lead.email.toLowerCase());
  let parentObj: any = null;
  if (!parentProfile) {
    parentProfile = {
      id: `usr-${Date.now()}-par`,
      email: lead.email,
      full_name: lead.parent_name,
      role: 'parent',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.parent_name)}`,
      phone: lead.phone,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.profiles.push(parentProfile);

    parentObj = {
      id: `par-${Date.now()}`,
      profile_id: parentProfile.id,
      emergency_contact: lead.phone,
      billing_address: 'Converted via Lernal Leads CRM',
    };
    db.parents.push(parentObj);
  } else {
    parentObj = db.parents.find((p) => p.profile_id === parentProfile!.id);
  }

  // 2. Create student
  const studentProfile = {
    id: `usr-${Date.now()}-stu`,
    email: `student.${lead.child_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@lernal.edu`,
    full_name: lead.child_name,
    role: 'student' as const,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(lead.child_name)}`,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  db.profiles.push(studentProfile);

  const studentObj = {
    id: `stu-${Date.now()}`,
    profile_id: studentProfile.id,
    parent_id: parentObj ? parentObj.id : undefined,
    date_of_birth: '2016-06-01',
    grade_level: '4th Grade',
    school_name: 'Elementary Discovery',
    interests: [course.title],
    xp_points: 150,
    badges_count: 1,
  };
  db.students.push(studentObj);

  // 3. Create active enrollment
  const enrollment = {
    id: `enr-${Date.now()}`,
    student_id: studentObj.id,
    parent_id: parentObj ? parentObj.id : undefined,
    course_id: course.id,
    status: 'active' as const,
    progress_percentage: 0.0,
    enrolled_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
  };
  db.enrollments.push(enrollment);

  // 4. Record financial transaction
  const transaction = {
    id: `txn-${Date.now()}`,
    reference_no: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    student_id: studentObj.id,
    parent_id: parentObj ? parentObj.id : undefined,
    course_id: course.id,
    amount: course.price,
    currency: course.currency,
    payment_method: 'Admin Manual Conversion',
    payment_status: 'paid' as const,
    notes: `Lead converted by ${req.user!.full_name}`,
    created_at: new Date().toISOString(),
  };
  db.transactions.push(transaction);

  // 5. Update lead status to converted
  lead.status = 'converted';
  db.leadNotes.push({
    id: `note-${Date.now()}`,
    lead_id: lead.id,
    admin_id: req.user!.id,
    note: `CONVERTED TO ENROLLMENT: Enrolled student "${studentProfile.full_name}" into "${course.title}". Created transaction ${transaction.reference_no} ($${course.price}).`,
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Lead successfully converted! Enrolled in ${course.title}.`,
    lead,
    student: studentProfile,
    enrollment,
    transaction,
  });
});

export default router;
