import { createClient } from '@supabase/supabase-js'

// Apni Supabase Settings > API se copy karke yahan lagao
const supabaseUrl = 'https://kqkmmfxrrbgffxhtlrcj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxa21tZnhycmJnZmZ4aHRscmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU0ODgsImV4cCI6MjA4MTEzMTQ4OH0.EtZoRga89EHka4ZlnuOWqT49nWQpfbAPyqnolc9MI7o'

export const supabase = createClient(supabaseUrl, supabaseKey)