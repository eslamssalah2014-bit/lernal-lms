// ============================================================================
// LERNAL LEADS CENTER (LIGHTWEIGHT CRM ENGINE)
// Pipeline metrics, lead status progression, notes activity, and 1-click conversion
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Target,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  ArrowRight,
  UserCheck,
  X,
  Plus,
  Send,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Lead } from '../../types';

export const AdminLeadsCenterPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Lead Drawer State
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [activeStatus]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLeads({
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: searchQuery || undefined,
      });
      if (res.leads) setLeads(res.leads);
      if (res.metrics) setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const openLeadDrawer = async (leadId: string) => {
    setLeadLoading(true);
    setConversionSuccess('');
    try {
      const res = await api.getLead(leadId);
      setSelectedLead(res.lead);
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLeadLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      await api.updateLeadStatus(selectedLead.id, newStatus);
      setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await api.addLeadNote(selectedLead.id, newNoteText.trim());
      setSelectedLead((prev: any) => ({
        ...prev,
        notes: [res.note, ...(prev.notes || [])],
      }));
      setNewNoteText('');
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Could not save note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;
    setIsConverting(true);
    try {
      const res = await api.convertLead(selectedLead.id, selectedLead.course_id);
      setConversionSuccess(res.message);
      setSelectedLead((prev: any) => ({ ...prev, status: 'converted' }));
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const statusFilters = [
    { label: 'All Inquiries', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Interested', value: 'interested' },
    { label: 'Follow-Up', value: 'follow_up' },
    { label: 'Converted', value: 'converted' },
    { label: 'Lost', value: 'lost' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & CRM Pipeline Metrics */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Leads Center (Lightweight CRM)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track inquiries, update contact status, record consultation notes, and convert leads into active student enrollments.
          </p>
        </div>

        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-white">{metrics.total}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Total Leads</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-rose-400">{metrics.new}</div>
              <div className="text-[10px] text-rose-300 font-bold uppercase mt-0.5">New</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-[#8DDFFF]">{metrics.contacted}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Contacted</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-[#36C7F4]">{metrics.interested}</div>
              <div className="text-[10px] text-[#36C7F4] font-bold uppercase mt-0.5">Interested</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-amber-400">{metrics.follow_up}</div>
              <div className="text-[10px] text-amber-300 font-bold uppercase mt-0.5">Follow-Up</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-emerald-400">{metrics.converted}</div>
              <div className="text-[10px] text-emerald-300 font-bold uppercase mt-0.5">Converted</div>
            </div>
            <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-3.5 text-center">
              <div className="text-xl font-extrabold text-emerald-400">{metrics.conversion_rate}%</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Conv. Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatus === tab.value
                    ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
                    : 'bg-[#00212D] text-gray-300 hover:bg-[#00384D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-72">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email..."
                className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#00A9D6] text-white rounded-xl text-xs font-bold"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl overflow-hidden shadow-card-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00212D] border-b border-[#00384D] text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Child / Student</th>
                <th className="p-4">Target Course</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00384D]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    Loading CRM leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openLeadDrawer(lead.id)}
                    className="hover:bg-[#00384D]/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-white">{lead.parent_name}</div>
                      <div className="text-[11px] text-gray-400">{lead.email}</div>
                      <div className="text-[10px] text-[#36C7F4]">{lead.phone}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{lead.child_name}</div>
                    </td>

                    <td className="p-4">
                      <span className="text-[#8DDFFF] font-medium max-w-[200px] truncate block">
                        {lead.course_title}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          lead.status === 'new'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : lead.status === 'converted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : lead.status === 'interested'
                            ? 'bg-[#36C7F4]/20 text-[#36C7F4] border border-[#36C7F4]/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-400 text-[11px]">{lead.source}</td>

                    <td className="p-4 text-gray-400 text-[11px]">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openLeadDrawer(lead.id);
                        }}
                        className="px-3 py-1.5 bg-[#00212D] hover:bg-[#004D6A] text-[#36C7F4] font-bold rounded-lg border border-[#004D6A] text-[11px] transition-colors"
                      >
                        Manage Lead
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* LEAD DETAILS & ACTIVITY DRAWER */}
      {/* -------------------------------------------------------------------- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#002B3B] border-l border-[#004D6A] h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
            {/* Top drawer header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#00384D] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#36C7F4]">
                    Lead Profile #{selectedLead.id.slice(-6)}
                  </span>
                  <h2 className="text-xl font-bold font-display text-white">
                    {selectedLead.parent_name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {conversionSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold">
                  {conversionSuccess}
                </div>
              )}

              {/* Status Selector & 1-Click Convert */}
              <div className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">Pipeline Status</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-[#002B3B] border border-[#004D6A] text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#36C7F4]"
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="interested">INTERESTED</option>
                    <option value="follow_up">FOLLOW UP</option>
                    <option value="converted">CONVERTED</option>
                    <option value="not_interested">NOT INTERESTED</option>
                    <option value="lost">LOST</option>
                  </select>
                </div>

                {selectedLead.status !== 'converted' && (
                  <button
                    onClick={handleConvertLead}
                    disabled={isConverting}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#00212D] font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all hover:scale-[1.01]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isConverting ? 'Enrolling Student...' : '1-Click Convert to Enrolled Student'}</span>
                  </button>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-gray-400">
                  Prospect Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#00212D] p-3 rounded-xl border border-[#00384D]">
                    <span className="text-[10px] text-gray-400 block">Prospective Student</span>
                    <span className="font-bold text-white">{selectedLead.child_name}</span>
                  </div>
                  <div className="bg-[#00212D] p-3 rounded-xl border border-[#00384D]">
                    <span className="text-[10px] text-gray-400 block">Target Course</span>
                    <span className="font-bold text-[#36C7F4] truncate block">
                      {selectedLead.course?.title || selectedLead.course_title || 'General Inquiry'}
                    </span>
                  </div>
                  <div className="bg-[#00212D] p-3 rounded-xl border border-[#00384D]">
                    <span className="text-[10px] text-gray-400 block">Email Address</span>
                    <span className="font-bold text-white truncate block">{selectedLead.email}</span>
                  </div>
                  <div className="bg-[#00212D] p-3 rounded-xl border border-[#00384D]">
                    <span className="text-[10px] text-gray-400 block">Phone / WhatsApp</span>
                    <span className="font-bold text-white">{selectedLead.phone}</span>
                  </div>
                </div>

                {selectedLead.message && (
                  <div className="bg-[#00212D] p-3.5 rounded-xl border border-[#00384D] space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Parent's Inquiry Message
                    </span>
                    <p className="text-gray-300 italic">{selectedLead.message}</p>
                  </div>
                )}
              </div>

              {/* Consultation Notes Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-gray-400 flex items-center justify-between">
                  <span>Consultation Notes Log</span>
                  <span className="text-[10px] text-[#36C7F4]">{selectedLead.notes?.length || 0} Notes</span>
                </h4>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log call outcome, schedule preferences, or parent feedback..."
                    className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4] resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    className="px-4 py-2 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Add Note to Lead'}</span>
                  </button>
                </form>

                {/* Notes List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedLead.notes?.map((note: any) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-[#00212D] border border-[#00384D] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-[#8DDFFF]">{note.admin_name}</span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-200">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button at bottom */}
            <button
              onClick={() => setSelectedLead(null)}
              className="w-full py-3 bg-[#00212D] hover:bg-[#00384D] border border-[#004D6A] text-gray-300 font-bold rounded-xl text-xs mt-4"
            >
              Done Managing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
