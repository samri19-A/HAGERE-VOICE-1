import { supabase } from './supabase';

export async function submitFeedback({
  rating,
  category,
  message = '',
  source = 'app',
  lang = 'en',
  contactName = '',
  contactEmail = '',
}) {
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_rating:        rating,
    p_category:      category,
    p_message:       message || null,
    p_source:        source,
    p_lang:          lang,
    p_contact_name:  contactName || null,
    p_contact_email: contactEmail || null,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'submit_failed');
  return data;
}
