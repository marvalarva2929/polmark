import { useState } from 'react';

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? 'Copied' : (label || 'Copy')}
    </button>
  );
}

function SettingsPanel({ campaign }) {
  const { settings, bidding, adGroup, rsa, assets, safety } = campaign;

  return (
    <div className="settings-panel">

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">1. Campaign Settings</span>
        </div>
        <div className="settings-rows">
          <SettingsRow label="Objective" value={settings.objective} />
          <SettingsRow label="Campaign Type" value={settings.campaignType} />
          <SettingsRow label="Campaign Name" value={settings.campaignName} copyable />
          <SettingsRow label="Networks" value={settings.networks} />
          <SettingsRow label="Locations" value={settings.locations.join(', ') || '—'} copyable />
          <SettingsRow label="Location Option" value={settings.locationOption} />
          <SettingsRow label="Languages" value={settings.languages.join(', ')} copyable />
          <SettingsRow label="Daily Budget" value={`$${settings.dailyBudget}`} highlight />
          <SettingsRow label="End Date" value={settings.endDate || '—'} />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">2. Bidding Strategy</span>
        </div>
        <div className="settings-rows">
          <SettingsRow label="Bidding Focus" value={bidding.focus} highlight />
          <SettingsRow label="Set Max CPC Bid Limit" value="Check this box" />
          <SettingsRow label="Max CPC Bid Limit" value={`$${bidding.maxCpcBidLimit}`} highlight />
          <SettingsRow label="Customer Acquisition" value="Leave unchecked" />
          <SettingsRow label="AI Upgrade (Perf. Max)" value="Click Skip / Decline" />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">3. Ad Group & Keywords</span>
          <CopyButton text={adGroup.keywords.join('\n')} label="Copy All" />
        </div>
        <SettingsRow label="Ad Group Name" value={adGroup.name} copyable />
        <div className="keyword-list">
          {adGroup.keywords.map((k, i) => (
            <span key={i} className={`keyword-tag ${k.startsWith('[') ? 'keyword-tag--exact' : 'keyword-tag--phrase'}`}>
              {k}
            </span>
          ))}
        </div>
        <p className="settings-hint">Blue = Phrase Match ("") &nbsp;|&nbsp; Green = Exact Match ([])</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">4. Responsive Search Ad</span>
        </div>
        <div className="settings-rows">
          <SettingsRow label="Final URL" value={rsa.finalUrl || '—'} copyable />
          <SettingsRow label="Display Path 1" value={rsa.displayPath1 || '—'} copyable />
          <SettingsRow label="Display Path 2" value={rsa.displayPath2 || '—'} copyable />
        </div>
        <div className="rsa-copy-block">
          <div className="rsa-copy-header">
            <span>Headlines (15 fields)</span>
            <CopyButton text={rsa.headlines.join('\n')} label="Copy All" />
          </div>
          <ol className="rsa-copy-list">
            {rsa.headlines.map((h, i) => (
              <li key={i} className="rsa-copy-item">
                <span className="rsa-copy-text">{h}</span>
                <CopyButton text={h} />
              </li>
            ))}
          </ol>
        </div>
        <div className="rsa-copy-block">
          <div className="rsa-copy-header">
            <span>Descriptions (4 fields)</span>
            <CopyButton text={rsa.descriptions.join('\n')} label="Copy All" />
          </div>
          <ol className="rsa-copy-list">
            {rsa.descriptions.map((d, i) => (
              <li key={i} className="rsa-copy-item">
                <span className="rsa-copy-text">{d}</span>
                <CopyButton text={d} />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">5. Ad Assets</span>
        </div>
        <p className="settings-sublabel">Sitelinks (4)</p>
        <div className="sitelinks-list">
          {assets.sitelinks.map((s, i) => (
            <div key={i} className="sitelink-item">
              <div className="sitelink-title">{s.title}</div>
              <div className="sitelink-desc">{s.desc1}</div>
              <div className="sitelink-desc">{s.desc2}</div>
              <div className="sitelink-url">{s.url}</div>
            </div>
          ))}
        </div>
        <p className="settings-sublabel">Callouts (4)</p>
        <div className="callouts-list">
          {assets.callouts.map((c, i) => (
            <span key={i} className="callout-tag">{c}</span>
          ))}
        </div>
        {assets.structuredSnippet.values.length > 0 && (
          <>
            <p className="settings-sublabel">Structured Snippet — Neighborhoods</p>
            <div className="callouts-list">
              {assets.structuredSnippet.values.map((v, i) => (
                <span key={i} className="callout-tag callout-tag--neighborhood">{v}</span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <span className="settings-section-title">6. Post-Publishing Safety</span>
          <CopyButton text={safety.negativeKeywords.join('\n')} label="Copy Negatives" />
        </div>
        <SettingsRow label="Exclude Tablets" value="Settings > Devices > Tablets > Decrease bid 100%" />
        <p className="settings-sublabel">Negative Keywords (phrase match)</p>
        <div className="keyword-list">
          {safety.negativeKeywords.map((k, i) => (
            <span key={i} className="keyword-tag keyword-tag--negative">{k}</span>
          ))}
        </div>
      </div>

    </div>
  );
}

function SettingsRow({ label, value, copyable, highlight }) {
  return (
    <div className={`settings-row ${highlight ? 'settings-row--highlight' : ''}`}>
      <span className="settings-key">{label}</span>
      <span className="settings-val">{value}</span>
      {copyable && <CopyButton text={value} />}
    </div>
  );
}

export default function CampaignCard({ campaign, index, onChange }) {
  const [editingAd, setEditingAd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function updatePreviewHeadline(i, val) {
    const next = [...campaign.previewHeadlines];
    next[i] = val;
    const rsa = { ...campaign.rsa, headlines: [...campaign.rsa.headlines] };
    rsa.headlines[i] = val;
    onChange({ ...campaign, previewHeadlines: next, rsa });
  }

  function updateAllHeadline(i, val) {
    const rsa = { ...campaign.rsa, headlines: [...campaign.rsa.headlines] };
    rsa.headlines[i] = val;
    const previewHeadlines = rsa.headlines.slice(0, 3);
    onChange({ ...campaign, previewHeadlines, rsa });
  }

  function updateDescription(i, val) {
    const rsa = { ...campaign.rsa, descriptions: [...campaign.rsa.descriptions] };
    rsa.descriptions[i] = val;
    const previewDescription = rsa.descriptions[0];
    onChange({ ...campaign, previewDescription, rsa });
  }

  function updateUrl(val) {
    onChange({ ...campaign, rsa: { ...campaign.rsa, finalUrl: val } });
  }

  const base = campaign.rsa.displayPath1 || '';
  const path2 = campaign.rsa.displayPath2 || '';

  return (
    <div className={`campaign-card ${editingAd ? 'campaign-card--editing' : ''}`}>
      <div className="campaign-card-header">
        <div className="campaign-card-meta">
          <span className="campaign-index">{index + 1}</span>
          <div className="campaign-tags">
            <span className="campaign-tag">{campaign.demo.name}</span>
            {campaign.demo.issues.slice(0, 2).map((iss) => (
              <span key={iss} className="campaign-tag campaign-tag--issue">{iss}</span>
            ))}
          </div>
        </div>
        <div className="campaign-card-actions">
          <span className="budget-pill">${campaign.dailyBudgetAmount.toFixed(2)}/day</span>
          <button
            className={`edit-toggle ${editingAd ? 'edit-toggle--active' : ''}`}
            onClick={() => { setEditingAd((v) => !v); setShowSettings(false); }}
          >
            {editingAd ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="ad-preview-google">
        <div className="ad-preview-google-url">
          <span className="ad-badge">Ad</span>
          <span className="ad-url-text">
            {campaign.rsa.finalUrl || campaign.settings.campaignName}
            {base ? ` › ${base}` : ''}
            {path2 ? ` › ${path2}` : ''}
          </span>
        </div>

        {editingAd ? (
          <div className="ad-edit-fields">
            <div className="ad-edit-section">
              <p className="ad-edit-label">
                All 15 Headlines <span className="ad-edit-hint">max 30 chars, no exclamation points</span>
              </p>
              {campaign.rsa.headlines.map((h, i) => {
                const remaining = 30 - (h?.length || 0);
                return (
                  <div key={i} className="ad-edit-row">
                    <span className="ad-edit-num">{i + 1}</span>
                    <div className="editable-wrap">
                      <input
                        className="editable-field"
                        type="text"
                        value={h}
                        maxLength={30}
                        onChange={(e) => updateAllHeadline(i, e.target.value)}
                      />
                      <span className={`char-count ${remaining <= 3 ? 'char-count--over' : ''}`}>{remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ad-edit-section">
              <p className="ad-edit-label">
                All 4 Descriptions <span className="ad-edit-hint">max 90 chars</span>
              </p>
              {campaign.rsa.descriptions.map((d, i) => {
                const remaining = 90 - (d?.length || 0);
                return (
                  <div key={i} className="ad-edit-row">
                    <span className="ad-edit-num">{i + 1}</span>
                    <div className="editable-wrap">
                      <textarea
                        className="editable-field editable-field--multiline"
                        value={d}
                        maxLength={90}
                        rows={2}
                        onChange={(e) => updateDescription(i, e.target.value)}
                      />
                      <span className={`char-count char-count--top ${remaining <= 5 ? 'char-count--over' : ''}`}>{remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ad-edit-section">
              <p className="ad-edit-label">Final URL</p>
              <input
                className="editable-field"
                type="text"
                value={campaign.rsa.finalUrl}
                onChange={(e) => updateUrl(e.target.value)}
                placeholder="https://yoursite.com/page"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="ad-preview-google-headlines">
              {campaign.previewHeadlines.join(' | ')}
            </div>
            <div className="ad-preview-google-desc">
              {campaign.previewDescription}
            </div>
          </>
        )}
      </div>

      <button
        className="settings-toggle"
        onClick={() => { setShowSettings((v) => !v); setEditingAd(false); }}
      >
        {showSettings ? '▲ Hide Campaign Settings' : '▼ View Full Campaign Settings'}
      </button>

      {showSettings && <SettingsPanel campaign={campaign} />}
    </div>
  );
}
