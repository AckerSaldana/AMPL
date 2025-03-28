import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juppmkcgqaobqcilvatw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cHBta2NncWFvYnFjaWx2YXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzI2MjEsImV4cCI6MjA1NjcwODYyMX0.ChPFiFaGQ6qfJUSoM6sSTc9-8h_EqJRC8WZDktIJDb0';

export const supabase = createClient(supabaseUrl, supabaseKey);
