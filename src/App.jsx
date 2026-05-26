import { useState } from 'react';
import { SURVEY_STEPS } from './surveyData';
import { generateCampaigns } from './adEngine';
import SurveyStep from './components/SurveyStep';
import DemographicsStep from './components/DemographicsStep';
import AdResults from './components/AdResults';
import './App.css';

const DEMOGRAPHICS_STEP_INDEX = SURVEY_STEPS.findIndex((s) => s.id === 'demographics');

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [validationMsg, setValidationMsg] = useState('');

  const step = SURVEY_STEPS[stepIndex];
  const isLast = stepIndex === SURVEY_STEPS.length - 1;
  const progress = (stepIndex / SURVEY_STEPS.length) * 100;

  function handleChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setValidationMsg('');
  }

  function validate() {
    if (stepIndex === DEMOGRAPHICS_STEP_INDEX) {
      const demos = answers.demographics || [];
      if (demos.length === 0 || !demos[0].name) {
        return 'Add at least one demographic group.';
      }
      const total = demos.reduce((sum, d) => sum + (Number(d.budgetPct) || 0), 0);
      if (Math.abs(total - 100) >= 0.5) {
        return `Budget percentages must add up to 100% (currently ${total}%).`;
      }
    }
    return null;
  }

  function handleNext() {
    const msg = validate();
    if (msg) {
      setValidationMsg(msg);
      return;
    }
    if (isLast) {
      setResults(generateCampaigns(answers));
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setValidationMsg('');
    setStepIndex((i) => i - 1);
  }

  function handleRestart() {
    setResults(null);
    setStepIndex(0);
    setAnswers({});
    setValidationMsg('');
  }

  if (results) {
    return (
      <div className="app">
        <Header />
        <main className="main main--wide">
          <AdResults results={results} onRestart={handleRestart} />
        </main>
      </div>
    );
  }

  const isCustomStep = step.type === 'custom';

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="survey-card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="step-header">
            <div className="step-counter">
              Step {stepIndex + 1} of {SURVEY_STEPS.length}
            </div>
            <h2 className="step-title">{step.title}</h2>
          </div>

          {isCustomStep ? (
            <DemographicsStep answers={answers} onChange={handleChange} />
          ) : (
            <SurveyStep step={step} answers={answers} onChange={handleChange} />
          )}

          {validationMsg && (
            <p className="validation-msg">{validationMsg}</p>
          )}

          <div className="step-nav">
            {stepIndex > 0 && (
              <button className="btn btn--outline" onClick={handleBack}>Back</button>
            )}
            <button className="btn btn--primary" onClick={handleNext}>
              {isLast ? 'Generate My Campaigns →' : 'Next →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">🗳️</span>
          <span className="logo-text">PolMark</span>
        </div>
        <p className="header-tagline">Google Ads for Political Candidates</p>
      </div>
    </header>
  );
}
