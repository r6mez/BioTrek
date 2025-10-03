import authService from './authService.js';

const API_BASE_URL = 'http://localhost:3000/api/v1';

class ChatbotService {
  constructor() {
    this.lastSources = [];
  }

  // Get authorization headers using authService
  getAuthHeaders() {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required. Please log in to use the chatbot.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.token}`,
    };
  }

  // Ask a question to the chatbot
  async askQuestion(query, chatHistoryId = null) {
    try {
      const body = { query };
      if (chatHistoryId) {
        body.chatHistoryId = chatHistoryId;
      }

      const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token using authService
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Retry the request with new token
            return this.askQuestion(query, chatHistoryId);
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Invalid query or request timeout');
        } else if (response.status === 500) {
          throw new Error('Chatbot service error. Please try again later.');
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Store sources for later retrieval
      if (data.sources) {
        this.lastSources = data.sources;
      }

      return data;
    } catch (error) {
      console.error('Chatbot query error:', error);
      throw error;
    }
  }

  // Get the last query sources
  async getLastSources() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/sources`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token using authService
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Retry the request with new token
            return this.getLastSources();
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to fetch sources: ${response.status}`);
      }

      const sources = await response.json();
      this.lastSources = sources;
      return sources;
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  }

  // Get chatbot health status
  async getHealthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token using authService
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Retry the request with new token
            return this.getHealthStatus();
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to fetch health status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }

  // Rebuild vector store
  async rebuildVectorStore() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/rebuild`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token using authService
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Retry the request with new token
            return this.rebuildVectorStore();
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        } else if (response.status === 500) {
          throw new Error('Failed to rebuild vector store');
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rebuilding vector store:', error);
      throw error;
    }
  }

  // Get cached sources (from last query)
  getCachedSources() {
    return this.lastSources;
  }

  // ========== Chat History Methods ==========

  // Get all chat histories for the current user
  async getChatHistories() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.getChatHistories();
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to fetch chat histories: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      throw error;
    }
  }

  // Get a specific chat history by ID
  async getChatHistoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.getChatHistoryById(id);
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // Create a new chat history
  async createChatHistory(title) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.createChatHistory(title);
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to create chat history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat history:', error);
      throw error;
    }
  }

  // Update a chat history title
  async updateChatHistory(id, title) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history/${id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.updateChatHistory(id, title);
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to update chat history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  }

  // Delete a specific chat history
  async deleteChatHistory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.deleteChatHistory(id);
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to delete chat history: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }

  // Clear all chat history
  async clearAllChatHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return this.clearAllChatHistory();
          } else {
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        throw new Error(`Failed to clear chat history: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;
