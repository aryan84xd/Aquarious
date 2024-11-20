import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cknxbmyfgneybdsnfrfi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrbnhibXlmZ25leWJkc25mcmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NDk5MzQsImV4cCI6MjA0NzUyNTkzNH0.0Z_hTx94kf8vACT7GvwYhA9oO6pFk3OINsw_VcFhfcM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
