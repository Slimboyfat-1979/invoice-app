import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_supabaseURL
const supabaseKey = import.meta.env.VITE_supabaseKey

export const supabase = createClient(supabaseURL, supabaseKey);