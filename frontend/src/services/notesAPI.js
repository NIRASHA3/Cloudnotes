const API_BASE = 'http://localhost:5000/api';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${url}`, config);
  
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

export const notesAPI = {
  getNotes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/notes?${queryString}`);
  },

  getNote: async (id) => {
    return makeRequest(`/notes/${id}`);
  },

  getStats: async () => {
    return makeRequest('/notes/stats/overview');
  },

  createNote: async (noteData) => {
    return makeRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  },

  updateNote: async (id, noteData) => {
    return makeRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData)
    });
  },

  togglePin: async (id) => {
    return makeRequest(`/notes/${id}/pin`, {
      method: 'PATCH'
    });
  },

  deleteNote: async (id) => {
    return makeRequest(`/notes/${id}`, {
      method: 'DELETE'
    });
  },

  searchNotes: async (query) => {
    return makeRequest(`/notes/search/${encodeURIComponent(query)}`);
  }
};
