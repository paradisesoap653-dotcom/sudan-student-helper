import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lhxebcykgdyxehcyohzk.supabase.co";
const supabaseKey = "sb_publishable_hMGP3EMJNixAVn5liDeh1Q_K10Eiyeu";

export const supabase = createClient(supabaseUrl, supabaseKey);
