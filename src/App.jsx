import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { SURVEY_STEPS } from './surveyData';
import { generateCampaigns } from './adEngine';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SurveyStep from './components/SurveyStep';
import DemographicsStep from './components/DemographicsStep';
import AdResults from './components/AdResults';
import './App.css';

const DEMOGRAPHICS_STEP_INDEX = SURVEY_STEPS.findIndex((s) => s.id === 'demographics');

export default function App() {
  const [session, setSession] = useState(null);
  const [appView, setAppView] = useState('loading'); // loading | auth | dashboard | survey | results

  // Survey state
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [validationMsg, setValidationMsg] = useState('');

  // ── Session management ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAppView(session ? 'dashboard' : 'auth');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && appView === 'auth') setAppView('dashboard');
      if (!session) { resetSurvey(); setAppView('auth'); }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  // ── Survey helpers ──────────────────────────────────────────
  function resetSurvey() {
    setStepIndex(0);
    setAnswers({});
    setResults(null);
    setValidationMsg('');
  }

  function startNewCampaign() {
    resetSurvey();
    setAppView('survey');
  }

  function goToDashboard() {
    resetSurvey();
    setAppView('dashboard');
  }

  function handleChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setValidationMsg('');
  }

  function validate() {
    if (stepIndex === DEMOGRAPHICS_STEP_INDEX) {
      const demos = answers.demographics ?? [];
      if (demos.length === 0 || !demos[0]?.name) {
        return 'Add at least one demographic group with a name.';
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
    if (msg) { setValidationMsg(msg); return; }

    const isLast = stepIndex === SURVEY_STEPS.length - 1;
    if (isLast) {
      setResults(generateCampaigns(answers));
      setAppView('results');
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setValidationMsg('');
    setStepIndex((i) => i - 1);
  }

  // ── Render ──────────────────────────────────────────────────
  if (appView === 'loading') return <LoadingScreen />;
  if (appView === 'auth') return <Auth />;

  const step = SURVEY_STEPS[stepIndex];
  const progress = (stepIndex / SURVEY_STEPS.length) * 100;

  return (
    <div className="app">
      <Header onLogoClick={appView !== 'auth' ? goToDashboard : undefined} />

      {appView === 'dashboard' && (
        <main className="main main--wide">
          <Dashboard
            user={session?.user}
            onNewCampaign={startNewCampaign}
            onSignOut={handleSignOut}
          />
        </main>
      )}

      {appView === 'survey' && (
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

            {step.type === 'custom' ? (
              <DemographicsStep answers={answers} onChange={handleChange} />
            ) : (
              <SurveyStep step={step} answers={answers} onChange={handleChange} />
            )}

            {validationMsg && <p className="validation-msg">{validationMsg}</p>}

            <div className="step-nav">
              <button className="btn btn--ghost" onClick={goToDashboard}>
                ← Dashboard
              </button>
              <div className="step-nav-right">
                {stepIndex > 0 && (
                  <button className="btn btn--outline" onClick={handleBack}>Back</button>
                )}
                <button className="btn btn--primary" onClick={handleNext}>
                  {stepIndex === SURVEY_STEPS.length - 1 ? 'Generate My Campaigns →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {appView === 'results' && results && (
        <main className="main main--wide">
          <AdResults
            results={results}
            answers={answers}
            onRestart={() => { resetSurvey(); setAppView('survey'); }}
            onGoToDashboard={goToDashboard}
          />
        </main>
      )}
    </div>
  );
}

function Header({ onLogoClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button
          className="logo logo-btn"
          onClick={onLogoClick}
          style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
        >
          <span className="logo-icon">🗳️</span>
          <span className="logo-text">PolMark</span>
        </button>
        <p className="header-tagline">Google Ads for Political Candidates</p>
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
    </div>
  );
}
