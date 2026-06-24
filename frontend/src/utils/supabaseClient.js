import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isMock = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes("your-supabase-project") || 
  supabaseAnonKey.includes("your-anon-key");

let supabase;

if (isMock) {
  console.warn("Supabase credentials missing or default. Falling back to local Mock Auth Mode.");
  
  // Create a mock Supabase client interface
  const listeners = new Set();
  let currentSession = null;

  // Retrieve mock session if it exists in local storage
  const savedSession = localStorage.getItem("philomind_mock_supabase_session");
  if (savedSession) {
    try {
      currentSession = JSON.parse(savedSession);
    } catch (_) {}
  }

  const triggerListeners = (event, session) => {
    listeners.forEach((cb) => cb(event, session));
  };

  supabase = {
    auth: {
      async signInWithOAuth({ provider, options }) {
        console.log(`[Mock Supabase] Initiating OAuth flow for ${provider}`);
        
        // Simulating oauth redirect by logging in instantly
        const mockUser = {
          id: "mock-supabase-user-id-12345",
          email: "philosopher.beginner@gmail.com",
          user_metadata: {
            full_name: "Tân thủ Triết học",
            avatar_url: "",
          },
          identities: [{ provider: "google", id: "mock-google-identity" }]
        };

        const mockSession = {
          access_token: "mock-supabase-jwt-token-string",
          user: mockUser,
        };

        currentSession = mockSession;
        localStorage.setItem("philomind_mock_supabase_session", JSON.stringify(mockSession));
        
        // Trigger status in a small delay
        setTimeout(() => {
          triggerListeners("SIGNED_IN", mockSession);
        }, 100);

        return { data: { provider, url: window.location.href }, error: null };
      },

      async getSession() {
        return { data: { session: currentSession }, error: null };
      },

      async getUser() {
        return { data: { user: currentSession?.user || null }, error: null };
      },

      async signOut() {
        console.log("[Mock Supabase] Signing out");
        currentSession = null;
        localStorage.removeItem("philomind_mock_supabase_session");
        triggerListeners("SIGNED_OUT", null);
        return { error: null };
      },

      onAuthStateChange(callback) {
        listeners.add(callback);
        // Fire initial check
        callback(currentSession ? "SIGNED_IN" : "SIGNED_OUT", currentSession);
        
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              },
            },
          },
        };
      },
    },
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, isMock };
