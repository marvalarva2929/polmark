import { useState, useEffect } from 'react';
import { getUserCampaigns } from '../lib/campaigns';

const STATUS = {
  pending:  { label: 'Pending Review', cls: 'status--pending' },
  approved: { label: 'Approved & Live', cls: 'status--approved' },
  rejected: { label: 'Needs Revision',  cls: 'status--rejected' },
};

function CampaignRow({ submission }) {
  const [open, setOpen] = useState(false);
  const st = STATUS[submission.status] ?? STATUS.pending;
  const date = new Date(submission.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const campaigns = submission.payload?.campaigns ?? [];

  return (
    <div className={`submission-card submission-card--${submission.status}`}>
      <button className="submission-header" onClick={() => setOpen((v) => !v)}>
        <div className="submission-info">
          <div className="submission-candidate">{submission.candidate_name}</div>
          <div className="submission-meta">
            {submission.office_title && <span>{submission.office_title}</span>}
            <span>{submission.campaign_count} ad campaign{submission.campaign_count !== 1 ? 's' : ''}</span>
            {submission.monthly_budget > 0 && (
              <span>${Number(submission.monthly_budget).toLocaleString()}/mo budget</span>
            )}
            <span>{date}</span>
          </div>
        </div>
        <div className="submission-right">
          <span className={`status-badge ${st.cls}`}>{st.label}</span>
          <span className="expand-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {submission.admin_notes && (
        <div className="admin-notes">
          <span className="admin-notes-label">Admin note:</span> {submission.admin_notes}
        </div>
      )}

      {open && (
        <div className="submission-campaigns">
          {campaigns.length === 0 && (
            <p className="submission-empty">No campaign details available.</p>
          )}
          {campaigns.map((c, i) => (
            <div key={c.id ?? i} className="sub-campaign">
              <div className="sub-campaign-header">
                <span className="sub-campaign-num">{i + 1}</span>
                <span className="sub-campaign-name">{c.settings?.campaignName ?? c.demo?.name}</span>
                {c.dailyBudgetAmount > 0 && (
                  <span className="sub-campaign-budget">${Number(c.dailyBudgetAmount).toFixed(2)}/day</span>
                )}
              </div>
              <div className="sub-ad-preview">
                <div className="sub-ad-url">
                  <span className="ad-badge">Ad</span>
                  <span>{c.rsa?.finalUrl || c.settings?.campaignName}</span>
                </div>
                <div className="sub-ad-headlines">
                  {(c.previewHeadlines ?? []).join(' | ')}
                </div>
                <div className="sub-ad-desc">{c.previewDescription}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ user, onNewCampaign, onSignOut }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    getUserCampaigns()
      .then(setSubmissions)
      .catch(() => setFetchError('Could not load campaigns. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const pending  = submissions.filter((s) => s.status === 'pending').length;
  const approved = submissions.filter((s) => s.status === 'approved').length;

  return (
    <div className="dashboard">
      <div className="dashboard-topbar">
        <div className="dashboard-user">
          <div className="dashboard-avatar">{(user?.email?.[0] ?? '?').toUpperCase()}</div>
          <span className="dashboard-email">{user?.email}</span>
        </div>
        <div className="dashboard-topbar-actions">
          <button className="btn btn--outline" onClick={onSignOut}>Sign Out</button>
          <button className="btn btn--primary" onClick={onNewCampaign}>+ New Campaign</button>
        </div>
      </div>

      <h1 className="dashboard-title">My Campaigns</h1>

      {submissions.length > 0 && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-num">{submissions.length}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
          <div className="stat-card stat-card--pending">
            <div className="stat-num">{pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card stat-card--approved">
            <div className="stat-num">{approved}</div>
            <div className="stat-label">Approved & Live</div>
          </div>
        </div>
      )}

      {fetchError && <p className="dashboard-error">{fetchError}</p>}

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your campaigns…</p>
        </div>
      ) : submissions.length === 0 && !fetchError ? (
        <div className="dashboard-empty">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No campaigns yet</h3>
          <p className="empty-sub">Create your first campaign to get started.</p>
          <button className="btn btn--primary" onClick={onNewCampaign}>
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map((s) => (
            <CampaignRow key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}
