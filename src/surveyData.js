export const SURVEY_STEPS = [
  {
    id: 'foundation',
    title: 'Foundation & Website',
    questions: [
      {
        id: 'candidateName',
        label: 'Candidate name exactly as it will appear on the ballot',
        type: 'text',
        placeholder: 'Jane Smith',
      },
      {
        id: 'officeTitle',
        label: 'Exact office you are running for',
        type: 'text',
        placeholder: 'City Council, State Senate, U.S. House District 21...',
      },
      {
        id: 'locations',
        label: 'Exact ZIP codes, cities, or counties your district covers',
        type: 'textarea',
        placeholder: '78701, 78702, Austin TX, Travis County...',
      },
      {
        id: 'languages',
        label: 'Languages your targeted voters speak',
        type: 'checkbox',
        options: ['English', 'Spanish', 'Mandarin Chinese', 'Vietnamese', 'Korean', 'Tagalog', 'Arabic', 'Other'],
        max: 8,
      },
      {
        id: 'hasConversionTracking',
        label: 'Do you have Google Ads Conversion Tracking installed on your website?',
        type: 'radio',
        options: ['Yes', 'No'],
      },
      {
        id: 'websiteDomain',
        label: 'Your website domain name',
        type: 'text',
        placeholder: 'janesmith.com',
      },
    ],
  },
  {
    id: 'budget',
    title: 'Budget & Timeline',
    questions: [
      {
        id: 'monthlyBudget',
        label: 'Total monthly digital advertising budget (USD)',
        type: 'currency',
        placeholder: '1000',
      },
      {
        id: 'electionEndDate',
        label: 'Campaign end date (Election Day)',
        type: 'date',
      },
    ],
  },
  {
    id: 'demographics',
    title: 'Voter Demographics',
    type: 'custom',
    questions: [],
  },
  {
    id: 'messaging',
    title: 'Your Message',
    questions: [
      {
        id: 'headlines',
        label: '5 short, punchy reasons someone should vote for you',
        type: 'multi-text',
        count: 5,
        maxLength: 30,
        multiline: false,
        placeholder: 'e.g. Fighting for Families',
        hint: 'Max 30 characters each. No exclamation points (Google policy).',
      },
      {
        id: 'descriptions',
        label: '3 broader descriptions of your platform and vision',
        type: 'multi-text',
        count: 3,
        maxLength: 90,
        multiline: true,
        placeholder: 'e.g. Jane Smith will fight for affordable housing and better schools in our district.',
        hint: 'Max 90 characters each.',
      },
    ],
  },
  {
    id: 'competitors',
    title: 'Competitors & Safety',
    questions: [
      {
        id: 'opponents',
        label: 'Main opponents — list their full names',
        type: 'textarea',
        placeholder: 'John Doe\nMary Johnson',
      },
      {
        id: 'neighborhoods',
        label: 'Specific neighborhoods, subdivisions, or hyper-local areas in your district',
        type: 'textarea',
        placeholder: 'Oak Hills, Downtown, Riverside, Barton Hills, Mueller...',
      },
      {
        id: 'toxicKeywords',
        label: 'Controversial topics, politicians, or keywords you do NOT want your name associated with',
        type: 'textarea',
        placeholder: 'List any names, issues, or terms to avoid...',
      },
    ],
  },
];
