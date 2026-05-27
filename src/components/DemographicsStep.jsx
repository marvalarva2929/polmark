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

const AGE_OPTIONS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
const INCOME_OPTIONS = ['Under $35k', '$35k–$75k', '$75k–$150k', '$150k+'];
const LOCATION_OPTIONS = ['Urban', 'Suburban', 'Rural', 'Mixed'];

function DemoBlock({ demo, index, onChange, onRemove, canRemove }) {
  const issues = demo.issues ?? [];

  function field(id) {
    return (val) => onChange({ ...demo, [id]: val });
  }

  return (
    <div className="demo-block">
      <div className="demo-block-header">
        <span className="demo-block-title">Demographic {index + 1}</span>
        {canRemove && (
          <button className="demo-remove-btn" type="button" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      {/* Name + Budget row */}
      <div className="demo-row-two">
        <div className="field demo-field-grow">
          <label className="field-label">Voter group name</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Seniors, Parents, Small Business Owners"
            value={demo.name ?? ''}
            onChange={(e) => field('name')(e.target.value)}
          />
        </div>
        <div className="field demo-field-pct">
          <label className="field-label">Budget %</label>
          <div className="budget-pct-row">
            <input
              className="field-input field-input--pct"
              type="number"
              min="1"
              max="100"
              placeholder="60"
              value={demo.budgetPct ?? ''}
              onChange={(e) => field('budgetPct')(e.target.value)}
            />
            <span className="pct-label">%</span>
          </div>
        </div>
      </div>

      {/* Detailed description */}
      <div className="field">
        <label className="field-label">Describe this voter group in detail</label>
        <textarea
          className="field-input field-textarea"
          placeholder="e.g. Homeowners aged 55–70 in the eastern suburbs who consistently vote and are primarily concerned about property taxes, school quality, and public safety. They respond to messaging about protecting community values and fiscal responsibility."
          value={demo.description ?? ''}
          onChange={(e) => field('description')(e.target.value)}
          rows={3}
        />
      </div>

      {/* Top 3 issues */}
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
                    field('issues')(next);
                  }}
                />
                {opt}
              </label>
            );
          })}
          <p className="checkbox-hint">Pick up to 3</p>
        </div>
      </div>

      {/* Age ranges */}
      <div className="field">
        <label className="field-label">Age ranges in this group</label>
        <div className="checkbox-grid">
          {AGE_OPTIONS.map((opt) => {
            const ages = demo.ageRanges ?? [];
            const selected = ages.includes(opt);
            return (
              <label key={opt} className={`checkbox-chip ${selected ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => field('ageRanges')(
                    selected ? ages.filter((v) => v !== opt) : [...ages, opt]
                  )}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </div>

      {/* Income + location type row */}
      <div className="demo-row-two">
        <div className="field demo-field-grow">
          <label className="field-label">Household income levels</label>
          <div className="checkbox-grid">
            {INCOME_OPTIONS.map((opt) => {
              const incomes = demo.incomeRanges ?? [];
              const selected = incomes.includes(opt);
              return (
                <label key={opt} className={`checkbox-chip ${selected ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => field('incomeRanges')(
                      selected ? incomes.filter((v) => v !== opt) : [...incomes, opt]
                    )}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
        <div className="field demo-field-grow">
          <label className="field-label">Location type</label>
          <div className="checkbox-grid">
            {LOCATION_OPTIONS.map((opt) => {
              const locs = demo.locationTypes ?? [];
              const selected = locs.includes(opt);
              return (
                <label key={opt} className={`checkbox-chip ${selected ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => field('locationTypes')(
                      selected ? locs.filter((v) => v !== opt) : [...locs, opt]
                    )}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Landing page URL */}
      <div className="field">
        <label className="field-label">Landing page URL for this group's issues</label>
        <input
          className="field-input"
          type="text"
          placeholder="https://yoursite.com/seniors"
          value={demo.landingUrl ?? ''}
          onChange={(e) => field('landingUrl')(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function DemographicsStep({ answers, onChange }) {
  const demographics = answers.demographics ?? [
    { name: '', budgetPct: '', description: '', issues: [], ageRanges: [], incomeRanges: [], locationTypes: [], landingUrl: '' },
  ];

  const totalPct = demographics.reduce((sum, d) => sum + (Number(d.budgetPct) || 0), 0);
  const isValid = Math.abs(totalPct - 100) < 0.5;

  function updateDemo(index, updated) {
    onChange('demographics', demographics.map((d, i) => (i === index ? updated : d)));
  }

  function addDemo() {
    onChange('demographics', [
      ...demographics,
      { name: '', budgetPct: '', description: '', issues: [], ageRanges: [], incomeRanges: [], locationTypes: [], landingUrl: '' },
    ]);
  }

  function removeDemo(index) {
    onChange('demographics', demographics.filter((_, i) => i !== index));
  }

  return (
    <div className="step-fields">
      <p className="demo-intro">
        Add each voter group you want to target. Each gets its own Google Ads campaign with a dedicated daily budget. All budget percentages must add up to 100%.
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
