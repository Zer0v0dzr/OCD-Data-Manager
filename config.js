// ============================================================
// OCD Data Manager
// Supabase Config
// ============================================================

const SUPABASE_URL =
    "https://sxvtbwtitdbaflaigahj.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9LVOphB0mpLVwN5x6qLCLA_ha1Z5DH6";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );