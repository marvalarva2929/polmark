import { supabase } from './supabase';

export async function saveCampaignSubmission({ results, campaigns }) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      candidate_name: results.candidateName || 'Unknown Candidate',
      office_title: results.officeTitle || '',
      campaign_count: campaigns.length,
      monthly_budget: results.monthly || 0,
      election_end_date: results.electionEndDate || null,
      payload: { results, campaigns },
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function getUserCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, candidate_name, office_title, campaign_count, monthly_budget, election_end_date, status, admin_notes, created_at, payload')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
