
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kzxiqdakyfxtyyuybwtl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGlxZGFreWZ4dHl5dXlid3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTYwNjksImV4cCI6MjA2NDAzMjA2OX0.8GwAjmdwup-i7gfhHKAxKi2Uufr3JAisKj5jg0qIALk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
