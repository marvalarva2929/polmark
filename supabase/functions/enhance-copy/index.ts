import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoInfo {
  name: string;
  issues?: string[];
  description?: string;
}

interface Campaign {
  demo: DemoInfo;
  rsa: {
    headlines: string[];
    descriptions: string[];
    finalUrl: string;
    displayPath1: string;
    displayPath2: string;
  };
  previewHeadlines: string[];
  previewDescription: string;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { answers, campaigns } = await req.json() as {
      answers: Record<string, unknown>;
      campaigns: Campaign[];
    };

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const anthropic = new Anthropic({ apiKey });

    const candidateName = (answers.candidateName as string) || 'the candidate';
    const officeTitle = (answers.officeTitle as string) || 'local office';
    const userHeadlines = ((answers.headlines as string[]) || []).filter(Boolean).join(', ');
    const userDescs = ((answers.descriptions as string[]) || []).filter(Boolean).join('. ');
    const demographics = (answers.demographics as DemoInfo[]) || [];

    const enhanced = await Promise.all(
      campaigns.map(async (campaign) => {
        const demo = campaign.demo;
        const demoDetail = demographics.find((d) => d.name === demo.name);
        const description = demoDetail?.description ?? '';
        const issues = (demo.issues ?? []).join(', ');

        const prompt = `You are a Google Ads copywriter for political campaigns. Write compelling ad copy for a specific voter demographic.

CANDIDATE: ${candidateName}
OFFICE: ${officeTitle}
DEMOGRAPHIC GROUP: ${demo.name}
${description ? `GROUP DESCRIPTION: ${description}` : ''}
${issues ? `TOP ISSUES: ${issues}` : ''}
${userHeadlines ? `CANDIDATE'S OWN HEADLINES (use as inspiration): ${userHeadlines}` : ''}
${userDescs ? `CANDIDATE'S OWN MESSAGING (use as inspiration): ${userDescs}` : ''}

Write ad copy for this exact voter group. Rules:
- 15 headlines, each MUST be 30 characters or fewer, absolutely NO exclamation marks
- 4 descriptions, each MUST be 90 characters or fewer, absolutely NO exclamation marks
- Be specific to this demographic's concerns and values
- Mix candidate name references with issue-focused and action-oriented copy
- Make it feel genuine and targeted, not generic

Respond ONLY with valid JSON, no other text:
{"headlines":["...15 items..."],"descriptions":["...4 items..."]}`;

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const text = response.content.find((b) => b.type === 'text')?.text ?? '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Claude returned no JSON for ' + demo.name);

        const parsed = JSON.parse(jsonMatch[0]) as { headlines: string[]; descriptions: string[] };

        const headlines = (parsed.headlines ?? [])
          .map((h: string) => h.replace(/!/g, '').trim().slice(0, 30))
          .filter(Boolean)
          .slice(0, 15);

        const descriptions = (parsed.descriptions ?? [])
          .map((d: string) => d.replace(/!/g, '').trim().slice(0, 90))
          .filter(Boolean)
          .slice(0, 4);

        // Pad with template fallbacks if Claude returned fewer items
        while (headlines.length < 15) {
          headlines.push(campaign.rsa.headlines[headlines.length] ?? '');
        }
        while (descriptions.length < 4) {
          descriptions.push(campaign.rsa.descriptions[descriptions.length] ?? '');
        }

        return {
          ...campaign,
          previewHeadlines: headlines.slice(0, 3),
          previewDescription: descriptions[0],
          rsa: { ...campaign.rsa, headlines, descriptions },
        };
      }),
    );

    return new Response(JSON.stringify({ campaigns: enhanced }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const error = err as Error;
    console.error('[enhance-copy]', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
