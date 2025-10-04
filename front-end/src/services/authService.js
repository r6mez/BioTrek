const API_BASE_URL = import.meta.env.BACKEND_API_BASE_URL;

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.tokenExpires = localStorage.getItem('tokenExpires');
    this.refreshInterval = null;
    
    // Start automatic token refresh if we have a valid token
    if (this.token && this.tokenExpires) {
      this.scheduleTokenRefresh();
    }
  }

  // Set authentication tokens
  setTokens(token, refreshToken, tokenExpires = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.tokenExpires = tokenExpires;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    if (tokenExpires) {
      localStorage.setItem('tokenExpires', tokenExpires);
    }
    
    // Schedule automatic refresh
    this.scheduleTokenRefresh();
  }

  // Clear authentication tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpires = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');
    
    // Clear any scheduled refresh
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Schedule automatic token refresh before expiration
  scheduleTokenRefresh() {
    // Clear any existing scheduled refresh
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (!this.tokenExpires || !this.refreshToken) {
      return;
    }

    const expiresAt = parseInt(this.tokenExpires);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Refresh 2 minutes before expiration (or immediately if less than 2 minutes remaining)
    const refreshBuffer = 2 * 60 * 1000; // 2 minutes in milliseconds
    const timeUntilRefresh = Math.max(0, timeUntilExpiry - refreshBuffer);

    // Only schedule if token hasn't expired yet
    if (timeUntilExpiry > 0) {
      console.log(`Token refresh scheduled in ${Math.floor(timeUntilRefresh / 1000)} seconds`);
      this.refreshInterval = setTimeout(async () => {
        console.log('Auto-refreshing token...');
        await this.refreshAccessToken();
      }, timeUntilRefresh);
    } else {
      // Token already expired, try to refresh immediately
      console.log('Token already expired, refreshing now...');
      this.refreshAccessToken();
    }
  }

  // Get current user data from /api/v1/auth/me
  async getCurrentUser() {
    if (!this.token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the request with new token
            return this.getCurrentUser();
          } else {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            throw new Error('Authentication expired. Please login again.');
          }
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();
      
      // Store user data in localStorage for quick access
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`, // Backend expects refresh token in Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.token, data.refreshToken, data.tokenExpires);
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Token refresh failed with status:', response.status);
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return false;
    }
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setTokens(data.token, data.refreshToken, data.tokenExpires);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }


  // Logout
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get stored user data
  getStoredUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
