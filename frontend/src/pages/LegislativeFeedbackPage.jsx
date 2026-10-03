import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Scale,
  MessageSquare,
  Clock,
  Calendar,
  Send,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Building,
  User,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Lightbulb,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { participationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STANCES = [
  { value: 'SUPPORT', label: 'Support', icon: ThumbsUp, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'OPPOSE', label: 'Oppose', icon: ThumbsDown, color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'NEUTRAL', label: 'Neutral Analysis', icon: MinusCircle, color: 'bg-stone-100 text-stone-700 border-stone-300' },
  { value: 'PROPOSAL', label: 'Alternative Proposal', icon: Lightbulb, color: 'bg-amber-100 text-amber-800 border-amber-300' }
];

export default function LegislativeFeedbackPage() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Item & Feedback State
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Feedback Submission Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    feedback_text: '',
    stance: 'SUPPORT',
    county: user?.county || 'Nairobi'
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (levelFilter !== 'ALL') params.level = levelFilter;
      if (search.trim()) params.search = search.trim();

      const res = await participationApi.listLegislativeItems(params);
      const fetched = res.data || [];
      setItems(fetched);
      if (fetched.length > 0 && !selectedItem) {
        setSelectedItem(fetched[0]);
        loadFeedback(fetched[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load legislative items.');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async (itemId) => {
    try {
      setFeedbackLoading(true);
      const res = await participationApi.listFeedback(itemId);
      setFeedbackList(res.data || []);
    } catch {
      setFeedbackList([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [levelFilter]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    loadFeedback(item.id);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      await participationApi.submitFeedback(selectedItem.id, feedbackForm);
      setSubmitSuccess(
        'Feedback submitted successfully! It is now pending administrative review and will be published shortly.'
      );
      setFeedbackForm({
        title: '',
        feedback_text: '',
        stance: 'SUPPORT',
        county: user?.county || 'Nairobi'
      });
      loadFeedback(selectedItem.id);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setSubmitSuccess(null);
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Scale className="w-3.5 h-3.5" />
                <span>Parliamentary & County Public Participation — Article 118</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Citizen Legislative Memoranda
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
                Submit formal citizen feedback, policy positions, and amendment proposals on active bills before Parliament and County Assemblies.
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="font-medium text-stone-600">Level:</span>
            <div className="flex items-center rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
              {['ALL', 'NATIONAL', 'COUNTY'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    levelFilter === lvl ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Legislation' : lvl === 'NATIONAL' ? 'National Bills' : 'County Assembly'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
              placeholder="Search reference or bill title..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Main 2-Column Layout: Items on Left, Selected Item & Feedback on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Bills Listing */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Legislative Bills ({items.length})
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse space-y-3">
                    <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                    <div className="h-5 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-10 bg-stone-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-sm text-stone-500">
                No legislative items found.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`cursor-pointer bg-white rounded-xl border p-5 transition-all shadow-sm ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/10'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {item.reference_code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                          {item.level}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 line-clamp-2">
                        {item.title}
                      </h4>

                      <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                        {item.summary}
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>Deadline: {new Date(item.feedback_deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-emerald-700 text-xs">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{item.feedback_count || 0} Memoranda</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Bill Detail & Memoranda Feed */}
          <div className="lg:col-span-7 space-y-6">
            {selectedItem ? (
              <>
                {/* Bill Header Dossier */}
                <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                      {selectedItem.reference_code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedItem.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-full font-medium bg-stone-100 text-stone-700">
                        {selectedItem.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 leading-snug">
                      {selectedItem.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                      <Building className="w-3.5 h-3.5 text-stone-400" />
                      <span>Sponsor: {selectedItem.sponsoring_body}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-line bg-stone-50 p-4 rounded-lg border border-stone-200">
                    {selectedItem.summary}
                  </p>

                  {/* Expand Full Bill Body Text */}
                  {selectedItem.body_text && (
                    <div className="border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedItemId(expandedItemId === selectedItem.id ? null : selectedItem.id)
                        }
                        className="w-full px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <span>Full Bill Clauses & Schedules</span>
                        {expandedItemId === selectedItem.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {expandedItemId === selectedItem.id && (
                        <div className="p-4 bg-white text-xs font-mono text-stone-700 whitespace-pre-line max-h-72 overflow-y-auto">
                          {selectedItem.body_text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission CTA Bar */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>
                        Feedback Deadline:{' '}
                        <strong>{new Date(selectedItem.feedback_deadline).toLocaleDateString()}</strong>
                      </span>
                    </div>

                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => setFeedbackModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Memorandum</span>
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500 italic">
                        Please sign in to submit feedback on this bill.
                      </span>
                    )}
                  </div>
                </div>

                {/* Published Citizen Feedback Feed */}
                <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        Public Submissions ({feedbackList.length})
                      </h3>
                      <p className="text-xs text-stone-500">
                        Citizen policy inputs published under parliamentary transparency standards.
                      </p>
                    </div>
                  </div>

                  {feedbackLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 bg-stone-50 rounded-lg animate-pulse space-y-2">
                          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                          <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : feedbackList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No citizen memoranda have been published yet for this bill.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbackList.map((fb) => {
                        const stanceObj = STANCES.find((s) => s.value === fb.stance) || STANCES[2];
                        const StanceIcon = stanceObj.icon;
                        const isPending = fb.status === 'SUBMITTED';

                        return (
                          <div
                            key={fb.id}
                            className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs sm:text-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stanceObj.color}`}
                                >
                                  <StanceIcon className="w-3.5 h-3.5" />
                                  <span>{stanceObj.label}</span>
                                </span>

                                {isPending && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                    Your Submission (Pending Review)
                                  </span>
                                )}
                              </div>

                              <span className="text-[11px] text-stone-400">
                                {new Date(fb.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="font-bold text-stone-900 text-sm">
                              {fb.title}
                            </h4>

                            <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-line">
                              {fb.feedback_text}
                            </p>

                            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                              <span>By {fb.author_name || 'Verified Citizen'} ({fb.author_county || 'Kenya'})</span>
                              <span className="text-stone-400">Ref: MEM-{fb.id}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-sm text-stone-500">
                Select a legislative bill from the list to view details and citizen feedback.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Feedback Modal */}
      {feedbackModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Submit Citizen Memorandum
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{selectedItem.reference_code}: {selectedItem.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">
                  Your Policy Stance *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STANCES.map((s) => {
                    const StanceIcon = s.icon;
                    const isSelected = feedbackForm.stance === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, stance: s.value })}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <StanceIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Memorandum Headline *
                </label>
                <input
                  type="text"
                  required
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                  placeholder="e.g., Clause 4 requires mandatory insurance alongside stipends"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Substantive Comments & Justification *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackForm.feedback_text}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_text: e.target.value })}
                  placeholder="Provide concrete legal or community observations, proposed amendments, or counter-proposals..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Privacy Safeguard:</strong> Your phone number, email, and national ID remain completely private. Only your masked name and county will appear in public records.
                </span>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
