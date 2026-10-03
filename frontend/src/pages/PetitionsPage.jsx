import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Building,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { participationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const KENYA_COUNTIES = [
  'All Counties',
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const PETITION_CATEGORIES = [
  'All Categories',
  'Public Safety',
  'Infrastructure',
  'Healthcare',
  'Education',
  'Environment',
  'Budget & Finance',
  'Governance & Accountability',
  'Youth & Social Development'
];

export default function PetitionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [petitions, setPetitions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    purpose: '',
    category: 'Public Safety',
    county: user?.county || 'Nairobi',
    sub_county: '',
    target_authority: '',
    requested_action: '',
    supporting_information: '',
    quorum_requirement: 50
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCounty !== 'All Counties') params.county = selectedCounty;
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const [petitionsRes, statsRes] = await Promise.all([
        participationApi.listPetitions(params),
        participationApi.getParticipationStats().catch(() => null)
      ]);

      setPetitions(petitionsRes.data || []);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load petitions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCounty, selectedCategory, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setCreateError(null);
      setCreateSuccess(null);

      const payload = {
        ...formData,
        county: formData.county === 'All Counties' ? null : formData.county,
        quorum_requirement: Number(formData.quorum_requirement)
      };

      const res = await participationApi.createPetition(payload);
      setCreateSuccess(
        'Petition registered successfully! It is now pending administrative review before being published.'
      );
      setFormData({
        title: '',
        summary: '',
        description: '',
        purpose: '',
        category: 'Public Safety',
        county: user?.county || 'Nairobi',
        sub_county: '',
        target_authority: '',
        requested_action: '',
        supporting_information: '',
        quorum_requirement: 50
      });
      fetchData();
      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateSuccess(null);
      }, 2000);
    } catch (err) {
      setCreateError(err.message || 'Failed to submit petition.');
    } finally {
      setCreateLoading(false);
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
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Constitutional Civic Action — Articles 37 & 119</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Citizen Petitions & Civic Quorum
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
                Mobilize verified citizen signatures to hold public authorities accountable. Signatures from verified citizens contribute directly to statutory constitutional quorums.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a Petition</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  <span>Sign In to Petition</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          {stats?.petitions && (
            <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Active Petitions</div>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {stats.petitions.published}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Quorum Reached</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  {stats.petitions.quorumReached}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Total Signatures</div>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {stats.petitions.totalSignatures}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Verified Signers</div>
                <div className="text-xl font-bold text-navy-800 mt-1">
                  {stats.petitions.verifiedSignatures}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, authority, or summary..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-stone-50/50"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-stone-500">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium">Filters:</span>
            </div>

            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {PETITION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-lg border border-stone-300 overflow-hidden bg-white text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  statusFilter === 'ALL' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('QUORUM_REACHED')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  statusFilter === 'QUORUM_REACHED' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Quorum Reached
              </button>
            </div>
          </div>
        </div>

        {/* Petitions Feed */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse space-y-4">
                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                <div className="h-6 bg-stone-200 rounded w-4/5"></div>
                <div className="h-14 bg-stone-100 rounded w-full"></div>
                <div className="h-3 bg-stone-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : petitions.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">No petitions found</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              There are currently no published petitions matching your filter criteria. Be the first to start a petition for your county.
            </p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Petition</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petitions.map((petition) => {
              const quorumTarget = petition.quorum_requirement || 50;
              const verifiedSigs = petition.verified_signatures || 0;
              const totalSigs = petition.total_signatures || 0;
              const pct = Math.min(Math.round((verifiedSigs / quorumTarget) * 100), 100);
              const isQuorumReached = petition.status === 'QUORUM_REACHED' || verifiedSigs >= quorumTarget;

              return (
                <div
                  key={petition.id}
                  className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          {petition.category}
                        </span>
                        {petition.county ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <MapPin className="w-3 h-3" />
                            {petition.county}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            National
                          </span>
                        )}
                      </div>

                      {isQuorumReached ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Quorum Reached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          In Progress
                        </span>
                      )}
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h2 className="text-base font-bold text-stone-900 line-clamp-2 leading-snug">
                        {petition.title}
                      </h2>
                      <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                        {petition.summary}
                      </p>
                    </div>

                    {/* Authority */}
                    <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-700 font-medium truncate">
                        <Building className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">{petition.target_authority}</span>
                      </div>
                    </div>

                    {/* Quorum Progress Bar */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500 font-medium">Verified Quorum</span>
                        <span className="font-bold text-stone-900">
                          {verifiedSigs} / {quorumTarget} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isQuorumReached ? 'bg-emerald-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>{totalSigs} total signers</span>
                        <span>Closing {new Date(petition.closing_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      By {petition.creator_name || 'Verified Citizen'}
                    </span>
                    <Link
                      to={`/petitions/${petition.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <span>View Petition</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Petition Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Initiate Citizen Petition</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Submit a formal petition under Constitution of Kenya Article 37.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Petition Title *</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mandatory Solar Lighting on Feeder Roads in Urban Corridors"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {PETITION_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Target Authority *</label>
                  <input
                    type="text"
                    required
                    value={formData.target_authority}
                    onChange={(e) => setFormData({ ...formData, target_authority: e.target.value })}
                    placeholder="e.g., Nairobi City County Directorate of Public Works"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">County</label>
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sub-County / Ward</label>
                  <input
                    type="text"
                    value={formData.sub_county}
                    onChange={(e) => setFormData({ ...formData, sub_county: e.target.value })}
                    placeholder="e.g., Kibra"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise 1-2 sentence executive summary of the demand..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Description & Context *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed background, justification, and affected community context..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Purpose Statement *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="What constitutional or civic goal does this achieve?"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Requested Action *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.requested_action}
                    onChange={(e) => setFormData({ ...formData, requested_action: e.target.value })}
                    placeholder="Specific resolution demanded from the authority..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Signature Quorum Target</label>
                <input
                  type="number"
                  min={5}
                  max={10000}
                  value={formData.quorum_requirement}
                  onChange={(e) => setFormData({ ...formData, quorum_requirement: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Default target is 50 verified signatures for county petitions.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Submitting...' : 'Register Petition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
