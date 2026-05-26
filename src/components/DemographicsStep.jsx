const ISSUE_OPTIONS = [
  'Public Safety',
  'Economy & Jobs',
  'Healthcare',
  'Education',
  'Housing & Affordability',
  'Climate & Environment',
  'Infrastructure',
  'Immigration',
  'Tax Reform',
  'Transparency & Ethics',
];

function DemoBlock({ demo, index, onChange, onRemove, canRemove }) {
  const issues = demo.issues || [];

  return (
    <div className="demo-block">
      <div className="demo-block-header">
        <span className="demo-block-title">Demographic {index + 1}</span>
        {canRemove && (
          <button className="demo-remove-btn" onClick={onRemove}>Remove</button>
        )}
      </div>

      <div className="field">
        <label className="field-label">Voter group name</label>
        <input
          className="field-input"
          type="text"
          placeholder="e.g. Seniors, Parents, Small Business Owners"
          value={demo.name || ''}
          onChange={(e) => onChange({ ...demo, name: e.target.value })}
        />
      </div>

      <div className="field">
        <label className="field-label">Budget allocation for this group</label>
        <div className="budget-pct-row">
          <input
            className="field-input field-input--pct"
            type="number"
            min="1"
            max="100"
            placeholder="60"
            value={demo.budgetPct || ''}
            onChange={(e) => onChange({ ...demo, budgetPct: e.target.value })}
          />
          <span className="pct-label">% of total budget</span>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Top 3 issues this group cares about most</label>
        <div className="checkbox-grid">
          {ISSUE_OPTIONS.map((opt) => {
            const selected = issues.includes(opt);
            const atMax = issues.length >= 3;
            return (
              <label
                key={opt}
                className={`checkbox-chip ${selected ? 'selected' : ''} ${!selected && atMax ? 'disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!selected && atMax}
                  onChange={() => {
                    const next = selected
                      ? issues.filter((v) => v !== opt)
                      : atMax ? issues : [...issues, opt];
                    onChange({ ...demo, issues: next });
                  }}
                />
                {opt}
              </label>
            );
          })}
          <p className="checkbox-hint">Pick up to 3</p>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Landing page URL for this demographic's issues</label>
        <input
          className="field-input"
          type="text"
          placeholder="https://yoursite.com/seniors"
          value={demo.landingUrl || ''}
          onChange={(e) => onChange({ ...demo, landingUrl: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function DemographicsStep({ answers, onChange }) {
  const demographics = answers.demographics || [
    { name: '', budgetPct: '', issues: [], landingUrl: '' },
  ];

  const totalPct = demographics.reduce((sum, d) => sum + (Number(d.budgetPct) || 0), 0);
  const isValid = Math.abs(totalPct - 100) < 0.5;

  function updateDemo(index, updated) {
    onChange('demographics', demographics.map((d, i) => (i === index ? updated : d)));
  }

  function addDemo() {
    onChange('demographics', [
      ...demographics,
      { name: '', budgetPct: '', issues: [], landingUrl: '' },
    ]);
  }

  function removeDemo(index) {
    onChange('demographics', demographics.filter((_, i) => i !== index));
  }

  return (
    <div className="step-fields">
      <p className="demo-intro">
        Add each voter group you want to target. Each group gets its own Google Ads campaign with a dedicated daily budget. Budget percentages must add up to 100%.
      </p>

      {demographics.map((demo, i) => (
        <DemoBlock
          key={i}
          demo={demo}
          index={i}
          onChange={(updated) => updateDemo(i, updated)}
          onRemove={() => removeDemo(i)}
          canRemove={demographics.length > 1}
        />
      ))}

      <div className="demo-footer">
        <div className={`budget-total ${isValid ? 'budget-total--ok' : totalPct > 0 ? 'budget-total--warn' : ''}`}>
          Total allocated: <strong>{totalPct}%</strong>
          {isValid && ' ✓'}
          {!isValid && totalPct > 0 && ' — must equal 100%'}
        </div>
        <button className="btn btn--outline" type="button" onClick={addDemo}>
          + Add Another Demographic
        </button>
      </div>
    </div>
  );
}
