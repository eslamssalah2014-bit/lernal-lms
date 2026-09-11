// ============================================================================
// LEADS CENTER (CRM ENGINE) ROUTES - SUPABASE INTEGRATED
// Captures inquiries, tracks status/notes, and converts leads to real enrollments
// ============================================================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { Lead, LeadNote } from '../types/database.js';

const router = Router();

// ----------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ----------------------------------------------------------------------------

// POST /api/leads - Capture inquiry form submission from landing / course pages
router.post('/', async (req: Request, res: Response) => {
  const { parent_name, child_name, email, phone, course_id, message, source = 'Website Contact Form' } = req.body;

  if (!parent_name || !email || !phone) {
    return res.status(400).json({ error: 'Parent Name, Email, and Phone number are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check for recent duplicate inquiry in 'new' status
    const { data: duplicate } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('status', 'new')
      .maybeSingle();

    if (duplicate) {
      return res.json({
        success: true,
        message: 'Thank you! We already received your inquiry and a Lernal educational advisor will reach out shortly.',
        lead_id: duplicate.id,
      });
    }

    // Insert lead with status = 'new'
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

    const { data: newLead, error } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          parent_name: parent_name.trim(),
          child_name: (child_name || 'Prospective Learner').trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          course_id: course_id || null,
          source,
          status: 'new',
          message: message || '',
          next_follow_up_date: tomorrow,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! A Lernal advisor will connect with you within 24 hours.',
      lead: newLead,
    });
  } catch (err: any) {
    console.error('Error submitting lead to Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to submit inquiry' });
  }
});

// ----------------------------------------------------------------------------
// ADMIN CRM ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/leads - Filterable CRM pipeline with metrics
router.get('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { status, search, course_id, sort = 'desc' } = req.query;

  try {
    let query = supabaseAdmin
      .from('leads')
      .select(`
        *,
        course:courses(id, title, thumbnail_url),
        assigned_admin:profiles!leads_assigned_admin_id_fkey(id, full_name),
        notes:lead_notes(id)
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    if (search) {
      const term = `%${(search as string).trim()}%`;
      query = query.or(`parent_name.ilike.${term},child_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
    }

    const isAscending = sort === 'asc';
    const { data: leads, error } = await query.order('created_at', { ascending: isAscending });

    if (error) throw error;

    // Calculate aggregated metrics from leads table
    const { data: allLeads, error: metricsErr } = await supabaseAdmin.from('leads').select('status');
    if (metricsErr) throw metricsErr;

    const total = allLeads?.length || 0;
    const newCount = allLeads?.filter((l) => l.status === 'new').length || 0;
    const contacted = allLeads?.filter((l) => l.status === 'contacted').length || 0;
    const interested = allLeads?.filter((l) => l.status === 'interested').length || 0;
    const follow_up = allLeads?.filter((l) => l.status === 'follow_up').length || 0;
    const converted = allLeads?.filter((l) => l.status === 'converted').length || 0;
    const lost = allLeads?.filter((l) => l.status === 'lost' || l.status === 'not_interested').length || 0;
    const conversion_rate = total > 0 ? Number(((converted / total) * 100).toFixed(1)) : 0;

    const hydrated = (leads || []).map((lead: any) => ({
      ...lead,
      course_title: lead.course?.title || 'General Platform Inquiry',
      course_thumbnail: lead.course?.thumbnail_url || null,
      notes_count: lead.notes?.length || 0,
      assigned_admin_name: lead.assigned_admin?.full_name || 'Unassigned',
    }));

    res.json({
      success: true,
      metrics: {
        total,
        new: newCount,
        contacted,
        interested,
        follow_up,
        converted,
        lost,
        conversion_rate,
      },
      leads: hydrated,
    });
  } catch (err: any) {
    console.error('Error fetching leads from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch leads' });
  }
});

// GET /api/leads/:id - Single lead details with complete notes log
router.get('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select(`
        *,
        course:courses(*),
        assigned_admin:profiles!leads_assigned_admin_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .maybeSingle();

    if (leadErr) throw leadErr;
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const { data: notes, error: notesErr } = await supabaseAdmin
      .from('lead_notes')
      .select(`
        *,
        admin:profiles!lead_notes_admin_id_fkey(id, full_name, avatar_url)
      `)
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    if (notesErr) throw notesErr;

    const formattedNotes = (notes || []).map((n: any) => ({
      ...n,
      admin_name: n.admin?.full_name || 'System Administrator',
      admin_avatar: n.admin?.avatar_url || '',
    }));

    res.json({
      success: true,
      lead: {
        ...lead,
        notes: formattedNotes,
      },
    });
  } catch (err: any) {
    console.error('Error fetching lead details from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch lead' });
  }
});

// PATCH /api/leads/:id/status - Update lead status
router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, next_follow_up_date } = req.body;

  const validStatuses = ['new', 'contacted', 'interested', 'follow_up', 'converted', 'not_interested', 'lost'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const { data: existingLead, error: fetchErr } = await supabaseAdmin
      .from('leads')
      .select('status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const prevStatus = existingLead.status;

    const updatePayload: any = { status };
    if (next_follow_up_date !== undefined) {
      updatePayload.next_follow_up_date = next_follow_up_date;
    }

    const { data: updatedLead, error: updateErr } = await supabaseAdmin
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    // Log status update in lead_notes
    await supabaseAdmin.from('lead_notes').insert([
      {
        lead_id: id,
        admin_id: req.user!.id,
        note: `Status updated from "${prevStatus.toUpperCase()}" to "${status.toUpperCase()}".`,
      },
    ]);

    res.json({ success: true, lead: updatedLead });
  } catch (err: any) {
    console.error('Error updating lead status in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to update lead status' });
  }
});

// POST /api/leads/:id/notes - Add interaction note
router.post('/:id/notes', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  try {
    const { data: newNote, error } = await supabaseAdmin
      .from('lead_notes')
      .insert([
        {
          lead_id: id,
          admin_id: req.user!.id,
          note: note.trim(),
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      note: {
        ...newNote,
        admin_name: req.user!.full_name,
        admin_avatar: req.user!.avatar_url,
      },
    });
  } catch (err: any) {
    console.error('Error adding lead note to Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to add lead note' });
  }
});

// POST /api/leads/:id/convert - Convert lead directly into an enrolled student + transaction
router.post('/:id/convert', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { course_id } = req.body;

  try {
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (leadErr || !lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const targetCourseId = course_id || lead.course_id;
    if (!targetCourseId) {
      return res.status(400).json({ error: 'Target course must be selected to convert lead.' });
    }

    const { data: course, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', targetCourseId)
      .single();

    if (courseErr || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 1. Create or find parent profile & record
    let parentProfileId: string;
    let parentId: string;

    const { data: existingParentProf } = await supabaseAdmin
      .from('profiles')
      .select('id, parents(id)')
      .eq('email', lead.email.toLowerCase())
      .maybeSingle();

    if (existingParentProf) {
      parentProfileId = existingParentProf.id;
      const parRecord = (existingParentProf as any).parents?.[0];
      if (parRecord) {
        parentId = parRecord.id;
      } else {
        const { data: newPar } = await supabaseAdmin
          .from('parents')
          .insert([{ profile_id: parentProfileId, emergency_contact: lead.phone }])
          .select('id')
          .single();
        parentId = newPar!.id;
      }
    } else {
      const { data: createdParentProf, error: pProfErr } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            email: lead.email.toLowerCase(),
            full_name: lead.parent_name,
            role: 'parent',
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.parent_name)}`,
            phone: lead.phone,
            is_active: true,
          },
        ])
        .select('id')
        .single();

      if (pProfErr) throw pProfErr;
      parentProfileId = createdParentProf.id;

      const { data: newPar, error: parErr } = await supabaseAdmin
        .from('parents')
        .insert([
          {
            profile_id: parentProfileId,
            emergency_contact: lead.phone,
            billing_address: 'Converted via Lernal Leads CRM',
          },
        ])
        .select('id')
        .single();

      if (parErr) throw parErr;
      parentId = newPar.id;
    }

    // 2. Create student profile & record
    const studentEmail = `student.${lead.child_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}@lernal.edu`;
    const { data: studentProfile, error: sProfErr } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          email: studentEmail,
          full_name: lead.child_name,
          role: 'student',
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(lead.child_name)}`,
          is_active: true,
        },
      ])
      .select('id, full_name, email')
      .single();

    if (sProfErr) throw sProfErr;

    const { data: studentRecord, error: stuErr } = await supabaseAdmin
      .from('students')
      .insert([
        {
          profile_id: studentProfile.id,
          parent_id: parentId,
          grade_level: '4th Grade',
          school_name: 'Elementary Discovery',
          interests: [course.title],
          xp_points: 150,
          badges_count: 1,
        },
      ])
      .select('id')
      .single();

    if (stuErr) throw stuErr;

    // 3. Create active course enrollment
    const { data: enrollment, error: enrErr } = await supabaseAdmin
      .from('enrollments')
      .upsert(
        [
          {
            student_id: studentRecord.id,
            parent_id: parentId,
            course_id: course.id,
            status: 'active',
            progress_percentage: 0.0,
          },
        ],
        { onConflict: 'student_id,course_id' }
      )
      .select('*')
      .single();

    if (enrErr) throw enrErr;

    // 4. Record financial transaction
    const refNo = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: transaction, error: txnErr } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          reference_no: refNo,
          student_id: studentRecord.id,
          parent_id: parentId,
          course_id: course.id,
          amount: course.price,
          currency: course.currency,
          payment_method: 'Admin Manual Conversion',
          payment_status: 'paid',
          notes: `Lead converted by ${req.user!.full_name}`,
        },
      ])
      .select('*')
      .single();

    if (txnErr) throw txnErr;

    // 5. Update lead status to converted & append audit note
    await Promise.all([
      supabaseAdmin.from('leads').update({ status: 'converted' }).eq('id', id),
      supabaseAdmin.from('lead_notes').insert([
        {
          lead_id: id,
          admin_id: req.user!.id,
          note: `CONVERTED TO ENROLLMENT: Enrolled student "${studentProfile.full_name}" into "${course.title}". Created transaction ${refNo} ($${course.price}).`,
        },
      ]),
    ]);

    res.json({
      success: true,
      message: `Lead successfully converted! Enrolled in ${course.title}.`,
      lead: { ...lead, status: 'converted' },
      student: studentProfile,
      enrollment,
      transaction,
    });
  } catch (err: any) {
    console.error('Error converting lead in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to convert lead' });
  }
});

export default router;
