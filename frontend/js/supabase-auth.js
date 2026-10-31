/**
 * =========================================================================
 * TESLA SHOWROOM - MÓDULO SUPABASE AUTH & GESTIÓN DE SESIONES
 * =========================================================================
 * Integra autenticación oficial con Supabase (@supabase/supabase-js)
 * y protección de rutas tanto en frontend como para llamadas al backend.
 * Ofrece fallback transparente a almacenamiento local si el proyecto
 * está en fase de configuración o modo local.
 */

(function (window) {
  'use strict';

  // Configuración de Supabase (Puede ser inyectada por el servidor, variables o localStorage)
  const SUPABASE_URL = window.ENV_SUPABASE_URL || localStorage.getItem('supabase_project_url') || '';
  const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

  let client = null;
  const isSupabaseConfigured = Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('[PROJECT-REF]') &&
    !SUPABASE_ANON_KEY.includes('[ANON-KEY]')
  );

  // Inicializar cliente Supabase oficial si está disponible en window
  if (isSupabaseConfigured && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      console.log('⚡ [Supabase Auth] Cliente inicializado correctamente.');
    } catch (e) {
      console.warn('⚠️ [Supabase Auth] Error al inicializar cliente:', e.message);
    }
  }

  const listeners = [];

  const supabaseAuth = {
    isConfigured() {
      return Boolean(client);
    },

    getClient() {
      return client;
    },

    /**
     * Registro de nuevo usuario (Sign Up)
     */
    async signUp({ email, password, name, phone, city, preferredModel }) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const userName = (name || '').trim();

      if (client) {
        try {
          const { data, error } = await client.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                name: userName,
                phone: phone || '',
                city: city || 'Bogotá D.C.',
                preferred_model: preferredModel || 'model-3',
                role: 'user'
              }
            }
          });

          if (error) throw error;

          const user = data.user;
          const session = data.session;

          const localUser = {
            id: user ? user.id : 'user_' + Date.now(),
            name: userName || (user && user.user_metadata && user.user_metadata.name) || 'Usuario Tesla',
            email: cleanEmail,
            phone: phone || '',
            city: city || 'Bogotá D.C.',
            preferredModel: preferredModel || 'model-3',
            role: (user && user.app_metadata && user.app_metadata.role) || 'user',
            orders: []
          };

          if (session) {
            localStorage.setItem('tesla_auth_token', session.access_token);
          }
          localStorage.setItem('tesla_auth_user', JSON.stringify(localUser));
          this._notifyListeners('SIGNED_IN', localUser);

          return { success: true, user: localUser, session };
        } catch (err) {
          console.error('Error en Supabase signUp:', err.message);
          return { success: false, error: err.message };
        }
      }

      // Modo Local / Fallback
      const fallbackUser = {
        id: 'local_' + Date.now(),
        name: userName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || '',
        city: city || 'Bogotá D.C.',
        preferredModel: preferredModel || 'model-3',
        role: (cleanEmail.includes('admin') || cleanEmail === 'julian.o@tesla.com') ? 'admin' : 'user',
        orders: []
      };

      try {
        const registered = JSON.parse(localStorage.getItem('tesla_registered_users') || '[]');
        const idx = registered.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);
        if (idx >= 0) registered[idx] = { ...registered[idx], ...fallbackUser };
        else registered.push(fallbackUser);
        localStorage.setItem('tesla_registered_users', JSON.stringify(registered));
      } catch (e) {}

      localStorage.setItem('tesla_auth_user', JSON.stringify(fallbackUser));
      this._notifyListeners('SIGNED_IN', fallbackUser);
      return { success: true, user: fallbackUser, fallback: true };
    },

    /**
     * Inicio de sesión con correo y contraseña (Sign In)
     */
    async signIn({ email, password }) {
      const cleanEmail = (email || '').trim().toLowerCase();

      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (error) throw error;

          const user = data.user;
          const session = data.session;
          const appMeta = user.app_metadata || {};
          const userMeta = user.user_metadata || {};

          // Prioridad: rol en app_metadata (seguro) o metadata de usuario
          const role = appMeta.role || userMeta.role || (cleanEmail === 'julian.o@tesla.com' ? 'admin' : 'user');

          const localUser = {
            id: user.id,
            name: userMeta.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: userMeta.phone || '',
            city: userMeta.city || 'Bogotá D.C.',
            preferredModel: userMeta.preferred_model || 'model-3',
            role: role,
            orders: []
          };

          if (session) {
            localStorage.setItem('tesla_auth_token', session.access_token);
          }
          localStorage.setItem('tesla_auth_user', JSON.stringify(localUser));
          this._notifyListeners('SIGNED_IN', localUser);

          return { success: true, user: localUser, session };
        } catch (err) {
          console.error('Error en Supabase signIn:', err.message);
          return { success: false, error: err.message };
        }
      }

      // Modo Local / Fallback
      let foundUser = null;
      try {
        const registered = JSON.parse(localStorage.getItem('tesla_registered_users') || '[]');
        foundUser = registered.find(u => (u.email || '').toLowerCase() === cleanEmail);
      } catch (e) {}

      const role = (cleanEmail === 'julian.o@tesla.com' || cleanEmail.includes('admin')) ? 'admin' : 'user';
      const fallbackUser = foundUser ? { ...foundUser, role } : {
        id: 'local_' + Date.now(),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '+57 300 000 0000',
        city: 'Bogotá D.C.',
        preferredModel: 'model-3',
        role: role,
        orders: []
      };

      localStorage.setItem('tesla_auth_user', JSON.stringify(fallbackUser));
      this._notifyListeners('SIGNED_IN', fallbackUser);
      return { success: true, user: fallbackUser, fallback: true };
    },

    /**
     * Cierre de sesión (Sign Out)
     */
    async signOut() {
      if (client) {
        try {
          await client.auth.signOut();
        } catch (e) {
          console.warn('Aviso en signOut:', e.message);
        }
      }
      localStorage.removeItem('tesla_auth_token');
      localStorage.removeItem('tesla_auth_user');
      this._notifyListeners('SIGNED_OUT', null);
      return { success: true };
    },

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
      try {
        const stored = localStorage.getItem('tesla_auth_user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * Obtener Token JWT activo para peticiones protegidas al Backend
     */
    getToken() {
      return localStorage.getItem('tesla_auth_token') || '';
    },

    /**
     * Encabezado de autorización HTTP listo para usar en fetch
     */
    getAuthHeaders(customHeaders = {}) {
      const headers = { ...customHeaders };
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    },

    /**
     * Escuchador de cambios de autenticación
     */
    onAuthStateChange(callback) {
      if (typeof callback === 'function') {
        listeners.push(callback);
      }
      if (client) {
        client.auth.onAuthStateChange((event, session) => {
          callback(event, session);
        });
      }
    },

    _notifyListeners(event, user) {
      listeners.forEach(fn => {
        try {
          fn(event, user);
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  window.supabaseAuth = supabaseAuth;
})(window);

