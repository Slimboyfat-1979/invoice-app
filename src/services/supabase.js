import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://bttqagrzzcyaxsfresid.supabase.co";
const supabaseKey = "sb_publishable_x2bSyGTtrLtYc6Gpfny4ww_wI0Lt1lv";

export const supabase = createClient(supabaseURL, supabaseKey);