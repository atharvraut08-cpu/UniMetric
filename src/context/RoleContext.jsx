import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const RoleContext = createContext(null);

/**
 * Maps a Supabase user object to UniMetric's standardized user profile
 */
const formatUserData = (sbUser) => {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: meta.full_name || sbUser.email?.split('@')[0] || 'User',
    role: meta.role || 'Student',
  };
};

/**
 * Provides the active role, auth state, and Supabase auth methods across the app.
 * Role is one of: 'Prospect' | 'Student' | 'Admin'
 */
export function RoleProvider({ children }) {
  const isConfigured = isSupabaseConfigured();
  const [role, setRole] = useState('Prospect');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state when session or user changes
  const applyUserSession = useCallback((currentSession) => {
    setSession(currentSession);
    if (currentSession?.user) {
      const formatted = formatUserData(currentSession.user);
      setUser(formatted);
      setRole(formatted.role);
    } else {
      setUser(null);
      setRole('Prospect');
    }
  }, []);

  // Listen to Supabase Auth lifecycle
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
      if (!error && initSession) {
        applyUserSession(initSession);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applyUserSession(newSession);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConfigured, applyUserSession]);

  /**
   * Sign In with Email & Password
   */
  const signIn = async ({ email, password }) => {
    if (!isConfigured) {
      // Fallback for local testing before Supabase keys are configured
      const mockUser = {
        id: 'local-test-id',
        email,
        name: email.split('@')[0],
        role: 'Student',
      };
      setUser(mockUser);
      setRole(mockUser.role);
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.session) {
      applyUserSession(data.session);
    }
    return data;
  };

  /**
   * Sign Up with Email, Password, Name, and Role
   */
  const signUp = async ({ email, password, name, role: userRole }) => {
    if (!isConfigured) {
      // Fallback for local testing before Supabase keys are configured
      const mockUser = {
        id: 'local-test-id',
        email,
        name,
        role: userRole || 'Student',
      };
      setUser(mockUser);
      setRole(mockUser.role);
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: userRole || 'Student',
        },
      },
    });

    if (error) throw error;
    if (data.session) {
      applyUserSession(data.session);
    }
    return data;
  };

  /**
   * Sign Out / Logout
   */
  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out from Supabase:', err);
      }
    }
    setUser(null);
    setSession(null);
    setRole('Prospect');
  };

  // Backwards compatibility aliases
  const login = (userData) => {
    setUser(userData);
    setRole(userData.role || 'Student');
  };
  const logout = signOut;

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        user,
        session,
        isAuthenticated: Boolean(user),
        loading,
        isSupabaseConfigured: isConfigured,
        signIn,
        signUp,
        signOut,
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to consume the role and auth context.
 */
export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
}
