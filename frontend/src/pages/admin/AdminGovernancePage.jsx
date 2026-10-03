import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Key,
  Webhook,
  FolderTree,
  Plus,
  RefreshCw,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Send,
  History,
  Lock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Edit2,
  Archive
} from 'lucide-react';
import { governanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminGovernancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'api-keys', 'webhooks', 'security-policies'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, category: null });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    module: 'INCIDENT',
    display_order: 0,
    status: 'ACTIVE'
  });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // API Keys State
  const [apiKeys, setApiKeys] = useState([]);
  const [createKeyModal, setCreateKeyModal] = useState(false);
  const [keyForm, setKeyForm] = useState({
    name: '',
    scopes: ['read:incidents', 'read:alerts'],
    rate_limit: 100
  });
  const [secretRevealModal, setSecretRevealModal] = useState({ isOpen: false, secret: '', keyPrefix: '', title: '' });
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [keyError, setKeyError] = useState(null);

  // Webhooks State
  const [webhooks, setWebhooks] = useState([]);
  const [webhookModal, setWebhookModal] = useState({ isOpen: false, webhook: null });
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: ['incident.created', 'alert.published'],
    is_active: true
  });
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookError, setWebhookError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testingWebhookId, setTestingWebhookId] = useState(null);
  const [deliveriesModal, setDeliveriesModal] = useState({ isOpen: false, webhook: null, deliveries: [] });

  // Security Policies State
  const [policies, setPolicies] = useState([]);
  const [policyForm, setPolicyForm] = useState({});
  const [policyReason, setPolicyReason] = useState('');
  const [policySaving, setPolicySaving] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(null);
  const [policyError, setPolicyError] = useState(null);
  const [historyModal, setHistoryModal] = useState({ isOpen: false, history: [] });

  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'categories') {
        const res = await governanceApi.listCategories({ include_archived: 'true' });
        setCategories(res.data || []);
      } else if (activeTab === 'api-keys') {
        const res = await governanceApi.listApiKeys();
        setApiKeys(res.data || []);
      } else if (activeTab === 'webhooks') {
        const res = await governanceApi.listWebhooks();
        setWebhooks(res.data || []);
      } else if (activeTab === 'security-policies') {
        const res = await governanceApi.listSecurityPolicies();
        setPolicies(res.data || []);
        const initialForm = {};
        (res.data || []).forEach((p) => {
          initialForm[p.policy_key] = p.policy_value;
        });
        setPolicyForm(initialForm);
      }
    } catch (err) {
      setError(err.message || 'Failed to load governance configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Categories Handlers
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setCategoryForm({
        name: cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        module: cat.module || 'INCIDENT',
        display_order: cat.display_order || 0,
        status: cat.status || 'ACTIVE'
      });
      setCategoryModal({ isOpen: true, category: cat });
    } else {
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        module: 'INCIDENT',
        display_order: 0,
        status: 'ACTIVE'
      });
      setCategoryModal({ isOpen: true, category: null });
    }
    setCategoryError(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategorySaving(true);
    setCategoryError(null);
    try {
      if (categoryModal.category) {
        await governanceApi.updateCategory(categoryModal.category.id, categoryForm);
      } else {
        await governanceApi.createCategory(categoryForm);
      }
      setCategoryModal({ isOpen: false, category: null });
      await loadTabData();
    } catch (err) {
      setCategoryError(err.message || 'Failed to save category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleArchiveCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to archive "${cat.name}"?`)) return;
    try {
      await governanceApi.archiveCategory(cat.id, { reason: 'Archived via Admin Governance UI' });
      await loadTabData();
    } catch (err) {
      alert(err.message || 'Failed to archive category.');
    }
  };

  // API Key Handlers
  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    setKeySaving(true);
    setKeyError(null);
    try {
      const res = await governanceApi.createApiKey(keyForm);
      setCreateKeyModal(false);
      setSecretRevealModal({
        isOpen: true,
        title: 'New API Key Secret Generated',
        secret: res.data.secret,
        keyPrefix: res.data.prefix
      });
      await loadTabData();
    } catch (err) {
      setKeyError(err.message || 'Failed to generate API key.');
    } finally {
      setKeySaving(false);
    }
  };

  const handleRotateKey = async (key) => {
    if (!window.confirm(`Rotate key "${key.name}"? The previous secret will be invalidated.`)) return;
    try {
      const res = await governanceApi.rotateApiKey(key.id);
      setSecretRevealModal({
        isOpen: true,
        title: `Rotated API Key Secret (${key.name})`,
        secret: res.data.secret,
        keyPrefix: res.data.prefix
      });
      await loadTabData();
    } catch (err) {
      alert(err.message || 'Failed to rotate key.');
    }
  };

  const handleRevokeKey = async (key) => {
    if (!window.confirm(`Revoke key "${key.name}"? Any external services using this key will immediately fail.`)) return;
    try {
      await governanceApi.revokeApiKey(key.id, { reason: 'Revoked via Admin Governance UI' });
      await loadTabData();
    } catch (err) {
      alert(err.message || 'Failed to revoke key.');
    }
  };

  // Webhooks Handlers
  const handleOpenWebhookModal = (wh = null) => {
    if (wh) {
      setWebhookForm({
        name: wh.name,
        url: wh.url,
        events: Array.isArray(wh.events) ? wh.events : JSON.parse(wh.events || '[]'),
        is_active: Boolean(wh.is_active)
      });
      setWebhookModal({ isOpen: true, webhook: wh });
    } else {
      setWebhookForm({
        name: '',
        url: '',
        events: ['incident.created', 'alert.published'],
        is_active: true
      });
      setWebhookModal({ isOpen: true, webhook: null });
    }
    setWebhookError(null);
  };

  const handleSaveWebhook = async (e) => {
    e.preventDefault();
    setWebhookSaving(true);
    setWebhookError(null);
    try {
      if (webhookModal.webhook) {
        await governanceApi.updateWebhook(webhookModal.webhook.id, webhookForm);
        setWebhookModal({ isOpen: false, webhook: null });
      } else {
        const res = await governanceApi.createWebhook(webhookForm);
        setWebhookModal({ isOpen: false, webhook: null });
        if (res.data?.signing_secret) {
          setSecretRevealModal({
            isOpen: true,
            title: 'Webhook Signing Secret Generated',
            secret: res.data.signing_secret,
            keyPrefix: 'whsec_'
          });
        }
      }
      await loadTabData();
    } catch (err) {
      setWebhookError(err.message || 'Failed to save webhook.');
    } finally {
      setWebhookSaving(false);
    }
  };

  const handleDeleteWebhook = async (wh) => {
    if (!window.confirm(`Delete webhook "${wh.name}"?`)) return;
    try {
      await governanceApi.deleteWebhook(wh.id);
      await loadTabData();
    } catch (err) {
      alert(err.message || 'Failed to delete webhook.');
    }
  };

  const handleTestWebhook = async (wh) => {
    setTestingWebhookId(wh.id);
    setTestResult(null);
    try {
      const res = await governanceApi.testWebhook(wh.id);
      setTestResult(res.data);
      alert(`Webhook Test Ping: Status ${res.data.response_code || 200}, Latency: ${res.data.response_time_ms}ms`);
      await loadTabData();
    } catch (err) {
      alert(`Webhook Test Failed: ${err.message}`);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleViewDeliveries = async (wh) => {
    try {
      const res = await governanceApi.listDeliveries(wh.id);
      setDeliveriesModal({ isOpen: true, webhook: wh, deliveries: res.data || [] });
    } catch (err) {
      alert(err.message || 'Failed to load deliveries.');
    }
  };

  // Policy Handlers
  const handleSavePolicies = async (e) => {
    e.preventDefault();
    setPolicySaving(true);
    setPolicyError(null);
    setPolicySuccess(null);
    try {
      await governanceApi.updateSecurityPolicies({
        policies: policyForm,
        reason: policyReason || 'Admin UI policy update'
      });
      setPolicySuccess('Security policies updated successfully.');
      setPolicyReason('');
      await loadTabData();
    } catch (err) {
      setPolicyError(err.message || 'Failed to save security policies.');
    } finally {
      setPolicySaving(false);
    }
  };

  const handleOpenHistoryModal = async () => {
    try {
      const res = await governanceApi.getPolicyHistory({ limit: 50 });
      setHistoryModal({ isOpen: true, history: res.data || [] });
    } catch (err) {
      alert(err.message || 'Failed to load policy change history.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 tracking-wider uppercase mb-1">
            <Settings className="w-4 h-4 text-gold-600" />
            Milestone 16 • Platform Governance
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-7 h-7 text-gold-600" />
            Platform Governance Settings
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Centralized schema configuration, external API authorization, webhook integrations, and system-wide security controls.
          </p>
        </div>

        <button
          onClick={loadTabData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-navy-800 text-slate-200 border border-navy-700 hover:bg-navy-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reload Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-navy-800 gap-1">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-gold-500 text-gold-400 bg-navy-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-900/30'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Category Schemas
        </button>

        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'api-keys'
              ? 'border-gold-500 text-gold-400 bg-navy-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-900/30'
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys & Credentials
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'webhooks'
              ? 'border-gold-500 text-gold-400 bg-navy-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-900/30'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Outbound Webhooks
        </button>

        <button
          onClick={() => setActiveTab('security-policies')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'security-policies'
              ? 'border-gold-500 text-gold-400 bg-navy-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-900/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security Policies
        </button>
      </div>

      {/* TAB 1: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">System Category Schema Registry</h2>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 transition"
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </button>
          </div>

          <div className="rounded-xl bg-navy-900/80 border border-navy-700/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-xs uppercase text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Category Name & Slug</th>
                  <th className="py-3 px-4 font-semibold">Module</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                      Loading category definitions...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      No categories defined.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-navy-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-xs">{cat.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{cat.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-navy-800 text-slate-300 border border-navy-700">
                          {cat.module || 'INCIDENT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 max-w-sm truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {cat.status === 'ARCHIVED' ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">
                            ARCHIVED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-1.5 rounded hover:bg-navy-800 text-slate-300 hover:text-white transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {cat.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveCategory(cat)}
                            className="p-1.5 rounded hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                            title="Archive Category"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: API Keys */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Authorized API Keys</h2>
              <p className="text-xs text-slate-400">
                Machine-to-machine credentials. Plaintext secrets are revealed strictly once upon creation and rotation.
              </p>
            </div>
            <button
              onClick={() => setCreateKeyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 transition"
            >
              <Plus className="w-4 h-4" />
              Generate API Key
            </button>
          </div>

          <div className="rounded-xl bg-navy-900/80 border border-navy-700/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-xs uppercase text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Key Name & Prefix</th>
                  <th className="py-3 px-4 font-semibold">Scopes</th>
                  <th className="py-3 px-4 font-semibold">Rate Limit</th>
                  <th className="py-3 px-4 font-semibold">Created / Last Used</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                      Loading active API credentials...
                    </td>
                  </tr>
                ) : apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No API keys generated yet. Click "Generate API Key" to provision credentials.
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-navy-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-xs">{key.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{key.prefix}••••••••</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(Array.isArray(key.scopes) ? key.scopes : JSON.parse(key.scopes || '[]')).map((sc) => (
                            <span key={sc} className="px-1.5 py-0.5 text-[10px] font-mono bg-navy-800 text-slate-300 rounded border border-navy-700">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-300">
                        {key.rate_limit} req/min
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        <div>Created: {new Date(key.created_at).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-500">
                          Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {key.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-950 text-red-400 border border-red-800">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {key.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleRotateKey(key)}
                              className="px-2 py-1 text-xs rounded bg-navy-800 hover:bg-navy-700 text-slate-300 transition"
                              title="Rotate Secret"
                            >
                              Rotate
                            </button>
                            <button
                              onClick={() => handleRevokeKey(key)}
                              className="px-2 py-1 text-xs rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 transition"
                              title="Revoke Key"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Outbound Webhooks</h2>
              <p className="text-xs text-slate-400">
                Automated HMAC-SHA256 signed event notification delivery with SSRF loopback protections.
              </p>
            </div>
            <button
              onClick={() => handleOpenWebhookModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 transition"
            >
              <Plus className="w-4 h-4" />
              Register Webhook
            </button>
          </div>

          <div className="rounded-xl bg-navy-900/80 border border-navy-700/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-xs uppercase text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Webhook & URL</th>
                  <th className="py-3 px-4 font-semibold">Subscribed Events</th>
                  <th className="py-3 px-4 font-semibold">Deliveries / Failures</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                      Loading registered webhooks...
                    </td>
                  </tr>
                ) : webhooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      No outbound webhooks registered.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-navy-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-xs">{wh.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{wh.url}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(Array.isArray(wh.events) ? wh.events : JSON.parse(wh.events || '[]')).map((evt) => (
                            <span key={evt} className="px-1.5 py-0.5 text-[10px] font-mono bg-navy-800 text-slate-300 rounded border border-navy-700">
                              {evt}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-300">
                        Failures: <span className={wh.failure_count > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>{wh.failure_count || 0}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {wh.is_active ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">
                            DISABLED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleTestWebhook(wh)}
                          disabled={testingWebhookId === wh.id}
                          className="px-2 py-1 text-xs rounded bg-navy-800 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 transition disabled:opacity-50"
                        >
                          {testingWebhookId === wh.id ? 'Testing...' : 'Test Ping'}
                        </button>
                        <button
                          onClick={() => handleViewDeliveries(wh)}
                          className="px-2 py-1 text-xs rounded bg-navy-800 hover:bg-navy-700 text-slate-300 transition"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleOpenWebhookModal(wh)}
                          className="p-1 rounded hover:bg-navy-800 text-slate-400 hover:text-white transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh)}
                          className="p-1 rounded hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Security Policies */}
      {activeTab === 'security-policies' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">System Security Policy Controls</h2>
              <p className="text-xs text-slate-400">
                Governing thresholds for authentication sessions, credential protection, and automated defense triggers.
              </p>
            </div>
            <button
              onClick={handleOpenHistoryModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-800 text-gold-400 border border-gold-500/30 hover:bg-navy-700 transition"
            >
              <History className="w-4 h-4" />
              View Policy History
            </button>
          </div>

          <form onSubmit={handleSavePolicies} className="p-6 rounded-xl bg-navy-900/80 border border-navy-700/80 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((pol) => (
                <div key={pol.policy_key} className="space-y-1.5 p-3 rounded-lg bg-navy-950/60 border border-navy-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      {pol.policy_key.replace(/_/g, ' ')}
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      [{pol.min_value ?? 0} - {pol.max_value ?? '∞'}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{pol.description}</p>
                  
                  {pol.data_type === 'BOOLEAN' ? (
                    <select
                      value={policyForm[pol.policy_key] ? 'true' : 'false'}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, [pol.policy_key]: e.target.value === 'true' })
                      }
                      className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-xs text-slate-200"
                    >
                      <option value="true">Enabled (True)</option>
                      <option value="false">Disabled (False)</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={pol.min_value}
                      max={pol.max_value}
                      value={policyForm[pol.policy_key] ?? ''}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          [pol.policy_key]: e.target.value === '' ? '' : Number(e.target.value)
                        })
                      }
                      className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-xs text-slate-200 font-mono"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Change Reason & Submit */}
            <div className="pt-4 border-t border-navy-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Reason for Policy Mutation (Audit Record)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tightening credential stuffing lockout thresholds following security review..."
                  value={policyReason}
                  onChange={(e) => setPolicyReason(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {policyError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {policyError}
                </div>
              )}

              {policySuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
                  {policySuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={policySaving}
                  className="px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  {policySaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Security Policies
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Secret Reveal Modal (Critical Security UX) */}
      {secretRevealModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-navy-900 border border-gold-500/50 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-gold-400">
              <Lock className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-white text-base">{secretRevealModal.title}</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <strong>Security Notice:</strong> Copy this secret now. CivicWatch AI stores only cryptographic SHA-512 hashes; you will never be able to view this plaintext secret again.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between font-mono text-xs text-emerald-400 break-all">
              <span>{secretRevealModal.secret}</span>
              <button
                onClick={() => copyToClipboard(secretRevealModal.secret)}
                className="ml-3 p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 shrink-0"
                title="Copy Secret"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSecretRevealModal({ isOpen: false, secret: '', keyPrefix: '', title: '' })}
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-xs transition"
              >
                I have securely stored this secret
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {categoryModal.category ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setCategoryModal({ isOpen: false, category: null })} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Slug / Code</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200 font-mono"
                  placeholder="e.g. corruption_whistleblower"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Module</label>
                <select
                  value={categoryForm.module}
                  onChange={(e) => setCategoryForm({ ...categoryForm, module: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                >
                  <option value="INCIDENT">INCIDENT</option>
                  <option value="PARTICIPATION">PARTICIPATION</option>
                  <option value="ALERT">ALERT</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              {categoryError && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {categoryError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, category: null })}
                  className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-semibold"
                >
                  {categorySaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {webhookModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {webhookModal.webhook ? 'Edit Outbound Webhook' : 'Register Outbound Webhook'}
              </h3>
              <button onClick={() => setWebhookModal({ isOpen: false, webhook: null })} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Webhook Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. County Dispatch Notification Hook"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.external-partner.org/webhook"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  SSRF Protection: Localhost and private RFC 1918 subnets (10.x, 192.168.x) are strictly blocked.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscribed Events</label>
                <div className="space-y-1.5 p-2.5 bg-navy-950 border border-navy-800 rounded-lg">
                  {['incident.created', 'alert.published', 'petition.created', 'audit.threshold_breach'].map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookForm({ ...webhookForm, events: [...webhookForm.events, ev] });
                          } else {
                            setWebhookForm({
                              ...webhookForm,
                              events: webhookForm.events.filter((x) => x !== ev)
                            });
                          }
                        }}
                        className="rounded border-navy-700 text-gold-500"
                      />
                      <span className="font-mono text-[11px]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wh_active"
                  checked={webhookForm.is_active}
                  onChange={(e) => setWebhookForm({ ...webhookForm, is_active: e.target.checked })}
                  className="rounded border-navy-700 text-gold-500"
                />
                <label htmlFor="wh_active" className="text-slate-300 font-semibold">
                  Enable active event delivery
                </label>
              </div>

              {webhookError && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {webhookError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setWebhookModal({ isOpen: false, webhook: null })}
                  className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={webhookSaving}
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-semibold"
                >
                  {webhookSaving ? 'Saving...' : 'Save Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {createKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">Generate Machine API Key</h3>
              <button onClick={() => setCreateKeyModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. County Dashboard Sync Client"
                  value={keyForm.name}
                  onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rate Limit (requests per minute)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={keyForm.rate_limit}
                  onChange={(e) => setKeyForm({ ...keyForm, rate_limit: Number(e.target.value) })}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Authorized Scopes</label>
                <div className="space-y-1.5 p-2.5 bg-navy-950 border border-navy-800 rounded-lg">
                  {['read:incidents', 'write:incidents', 'read:alerts', 'read:participation', 'read:audit'].map((sc) => (
                    <label key={sc} className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={keyForm.scopes.includes(sc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setKeyForm({ ...keyForm, scopes: [...keyForm.scopes, sc] });
                          } else {
                            setKeyForm({
                              ...keyForm,
                              scopes: keyForm.scopes.filter((x) => x !== sc)
                            });
                          }
                        }}
                        className="rounded border-navy-700 text-gold-500"
                      />
                      <span className="font-mono text-[11px]">{sc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {keyError && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {keyError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setCreateKeyModal(false)}
                  className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={keySaving}
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-semibold"
                >
                  {keySaving ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Deliveries Modal */}
      {deliveriesModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Delivery Logs: {deliveriesModal.webhook?.name}
              </h3>
              <button onClick={() => setDeliveriesModal({ isOpen: false, webhook: null, deliveries: [] })} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {deliveriesModal.deliveries.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No delivery attempts recorded yet.</div>
              ) : (
                deliveriesModal.deliveries.map((del) => (
                  <div key={del.id} className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-300 font-semibold">{del.event_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        del.response_code >= 200 && del.response_code < 300
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        HTTP {del.response_code || 'ERR'} • {del.response_time_ms || 0}ms
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {new Date(del.created_at).toLocaleString()}
                    </div>
                    {del.error_message && (
                      <div className="text-red-400 text-[11px] font-mono">{del.error_message}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Policy Change History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">Security Policy Audit History</h3>
              <button onClick={() => setHistoryModal({ isOpen: false, history: [] })} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {historyModal.history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No historical changes recorded.</div>
              ) : (
                historyModal.history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gold-400 font-mono">{h.policy_key}</span>
                      <span className="text-slate-500 text-[11px]">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="font-mono text-slate-300">
                      <span className="text-red-400">{h.old_value}</span> → <span className="text-emerald-400">{h.new_value}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Changed by: <span className="text-slate-200">{h.changed_by_name || 'Admin'}</span> • Reason: {h.change_reason || 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
