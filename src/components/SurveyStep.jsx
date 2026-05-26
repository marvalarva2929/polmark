export default function SurveyStep({ step, answers, onChange }) {
  return (
    <div className="step-fields">
      {step.questions.map((q) => (
        <div key={q.id} className="field">
          <label className="field-label">{q.label}</label>
          {q.hint && <p className="field-hint">{q.hint}</p>}

          {q.type === 'text' && (
            <input
              className="field-input"
              type="text"
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          )}

          {q.type === 'textarea' && (
            <textarea
              className="field-input field-textarea"
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
              rows={3}
            />
          )}

          {q.type === 'currency' && (
            <div className="currency-wrap">
              <span className="currency-symbol">$</span>
              <input
                className="field-input field-input--currency"
                type="number"
                min="0"
                step="1"
                placeholder={q.placeholder}
                value={answers[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
              />
            </div>
          )}

          {q.type === 'date' && (
            <input
              className="field-input"
              type="date"
              value={answers[q.id] || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          )}

          {q.type === 'radio' && (
            <div className="radio-group">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`radio-chip ${answers[q.id] === opt ? 'radio-chip--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => onChange(q.id, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.type === 'select' && (
            <select
              className="field-input field-select"
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
            >
              <option value="">— Select —</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {q.type === 'checkbox' && (
            <div className="checkbox-grid">
              {q.options.map((opt) => {
                const selected = (answers[q.id] || []).includes(opt);
                const atMax = (answers[q.id] || []).length >= (q.max || Infinity);
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
                        const current = answers[q.id] || [];
                        if (selected) {
                          onChange(q.id, current.filter((v) => v !== opt));
                        } else if (!atMax) {
                          onChange(q.id, [...current, opt]);
                        }
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
              {q.max && q.max < q.options.length && (
                <p className="checkbox-hint">Pick up to {q.max}</p>
              )}
            </div>
          )}

          {q.type === 'multi-text' && (
            <div className="multi-text-group">
              {Array.from({ length: q.count }).map((_, i) => {
                const arr = answers[q.id] || [];
                const val = arr[i] || '';
                const remaining = q.maxLength - val.length;

                function handleChange(newVal) {
                  const next = Array.from({ length: q.count }, (_, j) => (answers[q.id] || [])[j] || '');
                  next[i] = newVal;
                  onChange(q.id, next);
                }

                return (
                  <div key={i} className="multi-text-item">
                    <span className="multi-text-num">{i + 1}</span>
                    <div className="multi-text-input-wrap">
                      {q.multiline ? (
                        <textarea
                          className="field-input field-textarea multi-text-area"
                          placeholder={q.placeholder}
                          value={val}
                          maxLength={q.maxLength}
                          rows={2}
                          onChange={(e) => handleChange(e.target.value)}
                        />
                      ) : (
                        <input
                          className="field-input"
                          type="text"
                          placeholder={q.placeholder}
                          value={val}
                          maxLength={q.maxLength}
                          onChange={(e) => handleChange(e.target.value)}
                        />
                      )}
                      <span className={`inline-char-count ${remaining <= 5 ? 'inline-char-count--warn' : ''}`}>
                        {remaining}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
