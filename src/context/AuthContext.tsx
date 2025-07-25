
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer user profile loading to prevent potential deadlocks
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading profile for user:', supabaseUser.email);
      
      // Load user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setLoading(false);
        return;
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        console.error('Error loading user roles:', rolesError);
        setLoading(false);
        return;
      }

      // Get the primary role (first one found, prefer admin > franchisee > customer)
      const rolesPriority = ['admin', 'franchisee', 'customer'];
      const availableRoles = userRoles?.map(ur => ur.role) || [];
      const primaryRole = rolesPriority.find(role => availableRoles.includes(role)) || 'customer';

      console.log('User roles found:', availableRoles, 'Primary role:', primaryRole);

      const userObj: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: primaryRole as "admin" | "franchisee" | "customer"
      };

      setUser(userObj);
      console.log('User profile loaded successfully:', userObj);
    } catch (error) {
      console.error('Unexpected error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login successful for:', email);
      // User profile will be loaded by the auth state change listener
      return;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('Logout successful');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
