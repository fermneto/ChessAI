import { createClient } from './src/lib/supabase/client';

async function debug() {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('puzzles')
    .select('*', { count: 'exact' });
  
  console.log('Error:', error);
  console.log('Count:', count);
  console.log('Data Sample:', data?.slice(0, 2));
}

debug();
