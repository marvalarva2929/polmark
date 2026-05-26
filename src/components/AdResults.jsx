import { useState } from 'react';
import CampaignCard from './CampaignCard';

const SUBMIT_URL = import.meta.env.VITE_SUBMIT_URL;

export default function AdResults({ results, onRestart }) {
  const [campaigns, setCampaigns] = useState(results.campaigns);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  function updateCampaign(index, updated) {
    setCampaigns((prev) => prev.map((c, i) => (i === index ? updated : c)));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = {
      ...results,
      campaigns,
      submittedAt: new Date().toISOString(),
    };

    if (SUBMIT_URL) {
      try {
        const res = await fetch(SUBMIT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
      } catch {
        setError('Submission failed. Please try again or contact support.');
        setSubmitting(false);
        return;
      }
    } else {
      console.log('[PolMark] Campaign submission payload:', JSON.stringify(payload, null, 2));
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return <SubmitSuccess results={results} campaigns={campaigns} onRestart={onRestart} />;
  }

  return (
    <div className="results">
      <div className="results-header">
        <div className="results-icon">📢</div>
        <h2 className="results-title">Your Ad Campaigns</h2>
        <p className="results-sub">
          <strong>{campaigns.length} campaigns</strong> for{' '}
          <strong>{results.candidateName || 'your campaign'}</strong>
          {results.officeTitle ? ` — ${results.officeTitle}` : ''}
        </p>
        <div className="budget-summary">
          <span>Monthly: <strong>${results.monthly?.toLocaleString()}</strong></span>
          <span className="budget-divider">→</span>
          <span>Total daily: <strong>${results.totalDailyBudget}/day</strong></span>
        </div>
      </div>

      <p className="results-intro">
        Each campaign targets a specific voter group with its own daily budget. Click <strong>Edit</strong> to customize ad copy, or <strong>View Full Campaign Settings</strong> for the Google Ads configuration. When ready, click <strong>Confirm & Submit</strong>.
      </p>

      <div className="campaigns-grid">
        {campaigns.map((campaign, i) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            index={i}
            onChange={(updated) => updateCampaign(i, updated)}
          />
        ))}
      </div>

      {error && <p className="submit-error">{error}</p>}

      <div className="results-footer">
        <button className="btn btn--outline" onClick={onRestart}>Start Over</button>
        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : `Confirm & Submit ${campaigns.length} Campaigns →`}
        </button>
      </div>
    </div>
  );
}

function SubmitSuccess({ results, campaigns, onRestart }) {
  return (
    <div className="submit-success">
      <div className="success-icon">✅</div>
      <h2 className="success-title">Campaigns Submitted</h2>
      <p className="success-body">
        <strong>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</strong> for{' '}
        <strong>{results.candidateName || 'your campaign'}</strong> have been sent to the PolMark team.
      </p>
      <p className="success-sub">
        Our team will review and add your campaigns to your Google Ads account within 1–2 business days.
      </p>
      <div className="success-summary">
        <p className="success-summary-label">Submitted campaigns</p>
        {campaigns.map((c, i) => (
          <div key={c.id} className="success-campaign-item">
            <span className="success-campaign-num">{i + 1}</span>
            <div>
              <span className="success-campaign-name">{c.settings.campaignName}</span>
              <span className="success-campaign-budget"> — ${c.dailyBudgetAmount.toFixed(2)}/day</span>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn--primary" onClick={onRestart} style={{ marginTop: '28px' }}>
        Create New Campaigns
      </button>
    </div>
  );
}
