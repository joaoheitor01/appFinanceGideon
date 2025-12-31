import { createClient } from '@supabase/supabase-js';

// Suas chaves do projeto (baseado no seu app.js original)
const SUPABASE_URL = 'https://kpajxjpliyqclkmdowbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OURRIqDVKngWfW8rOfJdQw_OyQFczHm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);