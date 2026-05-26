const ISSUE_KEYWORDS = {
  'Public Safety': ['safe neighborhoods', 'crime reduction', 'public safety', 'police reform'],
  'Economy & Jobs': ['job creation', 'local jobs', 'economic growth', 'small business support'],
  Healthcare: ['affordable healthcare', 'healthcare access', 'lower drug costs', 'medical coverage'],
  Education: ['better schools', 'education funding', 'teacher pay', 'student success'],
  'Housing & Affordability': ['affordable housing', 'rent relief', 'housing costs', 'first time homebuyer'],
  'Climate & Environment': ['clean energy', 'climate action', 'environmental protection', 'green jobs'],
  Infrastructure: ['road repairs', 'infrastructure investment', 'broadband access', 'public transit'],
  Immigration: ['immigration reform', 'border security', 'pathway to citizenship', 'DACA'],
  'Tax Reform': ['tax cuts', 'tax fairness', 'lower property tax', 'fiscal responsibility'],
  'Transparency & Ethics': ['government accountability', 'ethics reform', 'transparent government', 'anti-corruption'],
};

const STANDARD_NEGATIVES = [
  'scandal', 'national', 'hiring', 'salary', 'job openings', 'biography',
  'wikipedia', 'net worth', 'controversy', 'arrest', 'fired', 'charges',
  'indicted', 'sued', 'lawsuit', 'crime record',
];

function parseLines(str) {
  if (!str) return [];
  return str.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

function clean(str, maxLen) {
  if (!str) return '';
  return str.replace(/!/g, '').trim().slice(0, maxLen);
}

function slug(str, maxLen) {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, maxLen);
}

function buildKeywords(candidateName, officeTitle, issues) {
  const last = candidateName ? candidateName.split(' ').pop() : 'Candidate';
  const office = officeTitle || 'local office';

  const pool = [
    `${last} ${office}`,
    `vote ${last}`,
    `elect ${last}`,
    `${last} for ${office}`,
    `${candidateName || last} campaign`,
    `${last} election`,
  ];

  (issues || []).slice(0, 3).forEach((issue) => {
    (ISSUE_KEYWORDS[issue] || []).slice(0, 2).forEach((kw) => pool.push(kw));
  });

  const unique = [...new Set(pool.map((k) => k.toLowerCase().trim()))].slice(0, 14);
  const half = Math.ceil(unique.length / 2);

  return [
    ...unique.slice(0, half).map((k) => `"${k}"`),
    ...unique.slice(half).map((k) => `[${k}]`),
  ];
}

function buildHeadlines(candidateName, officeTitle, demo, userHeadlines) {
  const last = candidateName ? candidateName.split(' ').pop() : 'Candidate';
  const first = candidateName ? candidateName.split(' ')[0] : last;
  const office = officeTitle || 'Local Office';
  const demoName = demo.name || 'Voters';
  const topIssue = (demo.issues || [])[0] || '';
  const year = new Date().getFullYear();

  const user = (userHeadlines || [])
    .filter((h) => h && h.trim())
    .map((h) => clean(h, 30));

  const generated = [
    clean(`Vote ${last} ${year}`, 30),
    clean(`${last} for ${office}`, 30),
    clean(`Elect ${first} Today`, 30),
    clean(`${demoName}: Vote ${last}`, 30),
    clean(topIssue ? `${topIssue.slice(0, 18)} Now` : 'Real Change Now', 30),
    clean(`${last}: Proven Leader`, 30),
    clean(`Endorsed by the Community`, 30),
    clean(`Real Results for ${demoName}`, 30),
    clean(`${office}: Vote ${last}`, 30),
    clean(`Join ${last}'s Campaign`, 30),
    clean(`${last} Fights for You`, 30),
    clean(`Change Starts With Your Vote`, 30),
    clean(`Trusted. Tested. ${last}.`, 30),
    clean(`A Voice for ${demoName}`, 30),
    clean(`Your Voice. ${last}'s Promise.`, 30),
  ];

  const all = [...user];
  for (const g of generated) {
    if (all.length >= 15) break;
    if (g && !all.includes(g)) all.push(g);
  }

  return all.slice(0, 15);
}

function buildDescriptions(candidateName, demo, userDescriptions) {
  const last = candidateName ? candidateName.split(' ').pop() : 'Candidate';
  const demoName = demo.name || 'voters';
  const issues = (demo.issues || []).join(', ') || 'our community';

  const user = (userDescriptions || [])
    .filter((d) => d && d.trim())
    .map((d) => d.slice(0, 90));

  const fallback = clean(
    `${candidateName || last} is committed to ${issues} for ${demoName}. Your vote makes a difference.`,
    90,
  );

  while (user.length < 4) user.push(fallback);
  return user.slice(0, 4);
}

function buildSitelinks(domain, officeTitle) {
  const base = domain
    ? domain.startsWith('http') ? domain.replace(/\/$/, '') : `https://${domain.replace(/\/$/, '')}`
    : '#';
  const officeShort = clean(officeTitle || 'our office', 20);

  return [
    {
      title: clean('Donate Now', 25),
      desc1: clean('Support our campaign today', 35),
      desc2: clean('Every dollar makes a difference', 35),
      url: `${base}/donate`,
    },
    {
      title: clean('Volunteer', 25),
      desc1: clean('Join our team on the ground', 35),
      desc2: clean('Sign up to canvass and make calls', 35),
      url: `${base}/volunteer`,
    },
    {
      title: clean(`About the Candidate`, 25),
      desc1: clean(`Meet your next ${officeShort}`, 35),
      desc2: clean('Experience, values and vision', 35),
      url: `${base}/about`,
    },
    {
      title: clean('Issues & Platform', 25),
      desc1: clean('See where we stand on the issues', 35),
      desc2: clean('Real plans for real results', 35),
      url: `${base}/issues`,
    },
  ];
}

function buildCallouts(userHeadlines) {
  const fromUser = (userHeadlines || [])
    .filter((h) => h && h.trim() && h.length <= 25)
    .map((h) => clean(h, 25));

  const fallbacks = [
    'Local. Trusted. Proven.',
    'Community-Focused',
    'Endorsed by Locals',
    'No Special Interests',
    'Fighting for You',
    'Real Results. Real Change.',
  ].map((s) => clean(s, 25));

  const all = [...fromUser];
  for (const f of fallbacks) {
    if (all.length >= 4) break;
    if (!all.includes(f)) all.push(f);
  }

  return all.slice(0, 4);
}

function buildNegativeKeywords(opponents, toxicKeywords) {
  const lines = [
    ...parseLines(opponents),
    ...parseLines(toxicKeywords),
    ...STANDARD_NEGATIVES,
  ];
  return [...new Set(lines.map((l) => l.toLowerCase().trim()))]
    .filter(Boolean)
    .map((k) => `"${k}"`);
}

export function generateCampaigns(answers) {
  const {
    candidateName = '',
    officeTitle = '',
    locations = '',
    languages = [],
    hasConversionTracking = 'No',
    websiteDomain = '',
    monthlyBudget = '0',
    electionEndDate = '',
    demographics = [],
    headlines: userHeadlines = [],
    descriptions: userDescriptions = [],
    opponents = '',
    neighborhoods = '',
    toxicKeywords = '',
  } = answers;

  const monthly = parseFloat(monthlyBudget) || 0;
  const totalDailyBudget = monthly / 30.4;
  const locationList = parseLines(locations);
  const neighborhoodList = parseLines(neighborhoods);
  const negativeKeywords = buildNegativeKeywords(opponents, toxicKeywords);
  const sitelinks = buildSitelinks(websiteDomain, officeTitle);
  const callouts = buildCallouts(userHeadlines);

  const demosToUse = demographics.length > 0
    ? demographics
    : [{ name: 'General Voters', budgetPct: '100', issues: [], landingUrl: '' }];

  const campaigns = demosToUse.map((demo, index) => {
    const pct = (Number(demo.budgetPct) || 0) / 100;
    const dailyBudget = totalDailyBudget * pct;
    const maxCpc = dailyBudget * 0.15;

    const keywords = buildKeywords(candidateName, officeTitle, demo.issues);
    const headlines = buildHeadlines(candidateName, officeTitle, demo, userHeadlines);
    const descriptions = buildDescriptions(candidateName, demo, userDescriptions);
    const topIssue = (demo.issues || [])[0] || '';
    const base = websiteDomain
      ? websiteDomain.startsWith('http') ? websiteDomain : `https://${websiteDomain}`
      : '';

    return {
      id: `campaign-${index}-${(demo.name || 'general').replace(/\s+/g, '-').toLowerCase()}`,

      // User edits these in the card
      previewHeadlines: headlines.slice(0, 3),
      previewDescription: descriptions[0],

      settings: {
        objective: "Create a campaign without a goal's guidance",
        campaignType: 'Search',
        campaignName: `Search - ${officeTitle || 'Campaign'} - ${demo.name || 'General'}`,
        networks: 'UNCHECK Search Partners. UNCHECK Display Network.',
        locations: locationList.length > 0 ? locationList : [locations].filter(Boolean),
        locationOption: 'Presence: People in or regularly in your targeted locations',
        languages: languages.length > 0 ? languages : ['English'],
        dailyBudget: dailyBudget.toFixed(2),
        endDate: electionEndDate,
      },

      bidding: {
        focus: hasConversionTracking === 'Yes' ? 'Conversions' : 'Clicks',
        maxCpcBidLimit: maxCpc.toFixed(2),
      },

      adGroup: {
        name: `${demo.name || 'General'} Keywords`,
        keywords,
      },

      rsa: {
        finalUrl: demo.landingUrl || base,
        displayPath1: slug(officeTitle, 15),
        displayPath2: slug(topIssue || demo.name, 15),
        headlines,
        descriptions,
      },

      assets: {
        sitelinks,
        callouts,
        structuredSnippet: {
          header: 'Neighborhoods',
          values: neighborhoodList,
        },
      },

      safety: {
        excludeTablets: true,
        negativeKeywords,
      },

      demo: {
        name: demo.name || 'General',
        budgetPct: demo.budgetPct || '100',
        issues: demo.issues || [],
        landingUrl: demo.landingUrl || '',
      },

      dailyBudgetAmount: dailyBudget,
    };
  });

  return {
    campaigns,
    candidateName,
    officeTitle,
    locations: locationList,
    websiteDomain,
    monthly,
    totalDailyBudget: totalDailyBudget.toFixed(2),
    electionEndDate,
  };
}
