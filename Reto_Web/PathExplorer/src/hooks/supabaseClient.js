import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tu-proyecto.supabase.co'; 
const supabaseKey = 'tu-clave-secreta'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
