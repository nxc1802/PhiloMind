// API client service for PhiloMind frontend to communicate with backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function getHeaders(customHeaders = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Helper to handle fetch responses and handle JSON/text properly
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage = errBody.message || errorMessage;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
    } catch (_) {
      // ignore JSON parse error for plain text responses
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // ==================== AUTH & USER ====================
  auth: {
    register: async (email, name, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      return handleResponse(response);
    },

    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    googleLogin: async (idToken) => {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      return handleResponse(response);
    },

    supabaseLogin: async (token) => {
      const response = await fetch(`${API_BASE_URL}/auth/supabase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      return handleResponse(response);
    },

    getUser: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }
  },

  // ==================== COURSES & MINDMAP ====================
  courses: {
    list: async (userId) => {
      const url = userId ? `${API_BASE_URL}/courses?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/courses`;
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(response);
    },

    getJourney: async (courseId, userId) => {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/journey?userId=${encodeURIComponent(userId)}`,
        { headers: getHeaders() }
      );
      return handleResponse(response);
    },

    getNodeDetails: async (nodeId, userId) => {
      const response = await fetch(
        `${API_BASE_URL}/courses/nodes/${nodeId}?userId=${encodeURIComponent(userId)}`,
        { headers: getHeaders() }
      );
      return handleResponse(response);
    },

    getNodeCore: async (nodeId, userId) => {
      const response = await fetch(
        `${API_BASE_URL}/courses/nodes/${nodeId}/core?userId=${encodeURIComponent(userId)}`,
        { headers: getHeaders() }
      );
      return handleResponse(response);
    },

    completeNode: async (nodeId, userId) => {
      const response = await fetch(`${API_BASE_URL}/courses/nodes/${nodeId}/complete`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId }),
      });
      return handleResponse(response);
    },

    updateProgress: async (nodeId, userId, status, extraFields = {}) => {
      const response = await fetch(`${API_BASE_URL}/courses/nodes/${nodeId}/progress`, {
        method: 'PATCH',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId, status, ...extraFields }),
      });
      return handleResponse(response);
    },

    uploadDoc: async (courseId, fileName, content) => {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/upload`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileName, content }),
      });
      return handleResponse(response);
    },
    comments: {
      list: async (nodeId) => {
        const response = await fetch(`${API_BASE_URL}/courses/nodes/${nodeId}/comments`, {
          headers: getHeaders()
        });
        return handleResponse(response);
      },
      create: async (nodeId, userId, content, role = 'student') => {
        const response = await fetch(`${API_BASE_URL}/courses/nodes/${nodeId}/comments`, {
          method: 'POST',
          headers: getHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ userId, content, role }),
        });
        return handleResponse(response);
      }
    }
  },

  // ==================== FLASHCARDS ====================
  flashcards: {
    getDue: async (userId, courseId) => {
      let url = `${API_BASE_URL}/flashcards/due?userId=${encodeURIComponent(userId)}`;
      if (courseId) {
        url += `&courseId=${encodeURIComponent(courseId)}`;
      }
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(response);
    },

    submitReview: async (userId, flashcardId, ease) => {
      const response = await fetch(`${API_BASE_URL}/flashcards/review`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId, flashcardId, ease }),
      });
      return handleResponse(response);
    },

    list: async (nodeId) => {
      const url = nodeId ? `${API_BASE_URL}/flashcards?nodeId=${encodeURIComponent(nodeId)}` : `${API_BASE_URL}/flashcards`;
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }
  },

  // ==================== DEBATES ====================
  debates: {
    getTranscript: async (nodeId, userId) => {
      const response = await fetch(
        `${API_BASE_URL}/debates/${nodeId}?userId=${encodeURIComponent(userId)}`,
        { headers: getHeaders() }
      );
      return handleResponse(response);
    },

    sendMessage: async (nodeId, userId, message) => {
      const response = await fetch(`${API_BASE_URL}/debates/${nodeId}/message`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId, message }),
      });
      return handleResponse(response);
    },

    topics: {
      list: async () => {
        const response = await fetch(`${API_BASE_URL}/debates/topics`, {
          headers: getHeaders()
        });
        return handleResponse(response);
      },
      getTranscript: async (topicId, userId) => {
        const response = await fetch(
          `${API_BASE_URL}/debates/topic/${topicId}?userId=${encodeURIComponent(userId)}`,
          { headers: getHeaders() }
        );
        return handleResponse(response);
      },
      sendMessage: async (topicId, userId, message) => {
        const response = await fetch(`${API_BASE_URL}/debates/topic/${topicId}/message`, {
          method: 'POST',
          headers: getHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ userId, message }),
        });
        return handleResponse(response);
      }
    }
  },
  documents: {
    list: async (courseId) => {
      const url = courseId ? `${API_BASE_URL}/documents?courseId=${encodeURIComponent(courseId)}` : `${API_BASE_URL}/documents`;
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }
  },
  quizzes: {
    list: async (nodeId) => {
      const url = nodeId ? `${API_BASE_URL}/quizzes?nodeId=${encodeURIComponent(nodeId)}` : `${API_BASE_URL}/quizzes`;
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(response);
    },
    get: async (id) => {
      const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }
  },
  // ==================== FEEDBACKS ====================
  feedbacks: {
    create: async (userId, content) => {
      const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId, content }),
      });
      return handleResponse(response);
    }
  },
  philosofun: {
    list: async () => {
      const response = await fetch(`${API_BASE_URL}/philosofun`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    },
    get: async (id) => {
      const response = await fetch(`${API_BASE_URL}/philosofun/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }
  }
};
