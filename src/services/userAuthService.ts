import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
}

export const userAuthService = {
  async register(data: RegisterData): Promise<AppUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection required. Please connect to Supabase first.');
    }

    try {
      console.log('🔐 Registering new user:', data.email);
      
      const { data: result, error } = await supabase.rpc('register_user', {
        p_email: data.email,
        p_password: data.password,
        p_full_name: data.full_name,
        p_phone: data.phone || null,
        p_address: data.address || null
      });

      if (error) {
        console.error('❌ Registration error:', error);
        if (error.message.includes('Email already registered')) {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        }
        throw new Error(`Registration failed: ${error.message}`);
      }

      console.log('✅ User registered successfully:', result);
      return result as AppUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async login(data: LoginData): Promise<AppUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection required. Please connect to Supabase first.');
    }

    try {
      console.log('🔐 Authenticating user:', data.email);
      
      const { data: result, error } = await supabase.rpc('authenticate_user', {
        p_email: data.email,
        p_password: data.password
      });

      if (error) {
        console.error('❌ Authentication error:', error);
        if (error.message.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(`Login failed: ${error.message}`);
      }

      console.log('✅ User authenticated successfully:', result);
      return result as AppUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<AppUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection required. Please connect to Supabase first.');
    }

    try {
      console.log('📝 Updating user profile:', userId, data);
      
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_full_name: data.full_name || null,
        p_phone: data.phone || null,
        p_address: data.address || null
      });

      if (error) {
        console.error('❌ Profile update error:', error);
        throw new Error(`Profile update failed: ${error.message}`);
      }

      console.log('✅ Profile updated successfully:', result);
      return result as AppUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  async getUserOrders(userId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection required. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              image,
              unit
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Session management
  saveUserSession(user: AppUser) {
    try {
      localStorage.setItem('app_user', JSON.stringify(user));
      localStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('user_session_id', Date.now().toString());
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  },

  getCurrentUser(): AppUser | null {
    try {
      const savedUser = localStorage.getItem('app_user');
      const isAuthenticated = localStorage.getItem('user_authenticated');
      const sessionId = localStorage.getItem('user_session_id');
      
      if (savedUser && isAuthenticated === 'true' && sessionId) {
        const user = JSON.parse(savedUser);
        
        // Check session age (24 hours)
        const sessionAge = Date.now() - parseInt(sessionId);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxSessionAge) {
          return user;
        } else {
          // Session expired
          this.logout();
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  logout() {
    try {
      localStorage.removeItem('app_user');
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_session_id');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};