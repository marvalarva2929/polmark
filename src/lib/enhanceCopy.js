import { supabase } from './supabase';

export async function enhanceCampaignCopy({ answers, campaigns }) {
  const { data, error } = await supabase.functions.invoke('enhance-copy', {
    body: { answers, campaigns },
  });

  if (error) throw new Error(error.message ?? 'Enhancement failed');
  if (data?.error) throw new Error(data.error);
  return data.campaigns;
}
