// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User, AuthContextType } from "@/types";
import { toast } from "sonner"; // Importar toast para feedback

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Loading profile for user:', supabaseUser.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        // Este erro agora será capturado pela função de login
        throw new Error(`Falha ao buscar perfil: ${profileError.message}`);
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        throw new Error(`Falha ao buscar roles: ${rolesError.message}`);
      }

      const rolesPriority = ['admin', 'franchisee', 'customer'];
      const availableRoles = userRoles?.map(ur => ur.role) || [];
      const primaryRole = rolesPriority.find(role => availableRoles.includes(role)) || 'customer';

      const userObj: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: primaryRole as "admin" | "franchisee" | "customer"
      };

      setUser(userObj);
      console.log('User profile loaded successfully:', userObj);
      return userObj;
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Se falhar ao carregar o perfil, deslogamos o usuário para evitar um estado inconsistente.
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      throw error; // Propaga o erro para a função de login
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user).catch(() => {});
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await loadUserProfile(session.user).catch(() => {});
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // --- FUNÇÃO DE LOGIN MELHORADA ---
  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login bem-sucedido, mas nenhum usuário retornado.");

    // Após o signIn, o onAuthStateChange vai disparar, mas podemos carregar o perfil aqui
    // para dar um retorno imediato e robusto para a página de Login.
    const userProfile = await loadUserProfile(data.user);
    
    if (!userProfile) {
        throw new Error("Não foi possível carregar os dados do perfil após o login.");
    }

    return userProfile;
  };
  // --- FIM DA MELHORIA ---

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
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