// API helper for Admin Portal to perform full CRUD on all entities
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage = errBody.message || errorMessage;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  users: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/users`)),
    get: async (id) => handleResponse(await fetch(`${API_BASE_URL}/users/${id}`)),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }))
  },
  
  courses: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/courses`)),
    get: async (id) => handleResponse(await fetch(`${API_BASE_URL}/courses/${id}`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: 'default-user-id' })
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/courses/${id}`, { method: 'DELETE' }))
  },

  chapters: {
    list: async (courseId) => handleResponse(await fetch(courseId ? `${API_BASE_URL}/chapters?courseId=${courseId}` : `${API_BASE_URL}/chapters`)),
    get: async (id) => handleResponse(await fetch(`${API_BASE_URL}/chapters/${id}`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/chapters/${id}`, { method: 'DELETE' }))
  },

  nodes: {
    list: async (chapterId) => handleResponse(await fetch(chapterId ? `${API_BASE_URL}/nodes?chapterId=${chapterId}` : `${API_BASE_URL}/nodes`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/nodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/nodes/${id}`, { method: 'DELETE' }))
  },

  flashcards: {
    list: async (nodeId) => handleResponse(await fetch(nodeId ? `${API_BASE_URL}/flashcards?nodeId=${nodeId}` : `${API_BASE_URL}/flashcards`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/flashcards/${id}`, { method: 'DELETE' })),
    bulkImport: async (nodeId, flashcards) => handleResponse(await fetch(`${API_BASE_URL}/flashcards/nodes/${nodeId}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards })
    }))
  },

  quizzes: {
    list: async (nodeId) => handleResponse(await fetch(nodeId ? `${API_BASE_URL}/quizzes?nodeId=${nodeId}` : `${API_BASE_URL}/quizzes`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/quizzes/${id}`, { method: 'DELETE' }))
  },

  podcasts: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/podcasts`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/podcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/podcasts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/podcasts/${id}`, { method: 'DELETE' })),
    synthesize: async (nodeId, scriptText) => handleResponse(await fetch(`${API_BASE_URL}/podcasts/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, scriptText })
    }))
  },

  debates: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/debates/all`)),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/debates/${id}`, { method: 'DELETE' }))
  },

  debateTopics: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/debates/topics`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/debates/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/debates/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/debates/topics/${id}`, { method: 'DELETE' }))
  },

  warmups: {
    list: async (nodeId) => handleResponse(await fetch(`${API_BASE_URL}/nodes/${nodeId}/warmups`)),
    create: async (nodeId, data) => handleResponse(await fetch(`${API_BASE_URL}/nodes/${nodeId}/warmups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/warmups/${id}`, { method: 'DELETE' }))
  },

  feedbacks: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/feedbacks`))
  },

  documents: {
    list: async (courseId) => handleResponse(await fetch(courseId ? `${API_BASE_URL}/documents?courseId=${courseId}` : `${API_BASE_URL}/documents`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' }))
  },

  files: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData
      });
      return handleResponse(response);
    }
  },
  
  philosofun: {
    list: async () => handleResponse(await fetch(`${API_BASE_URL}/philosofun`)),
    get: async (id) => handleResponse(await fetch(`${API_BASE_URL}/philosofun/${id}`)),
    create: async (data) => handleResponse(await fetch(`${API_BASE_URL}/philosofun`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    update: async (id, data) => handleResponse(await fetch(`${API_BASE_URL}/philosofun/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })),
    delete: async (id) => handleResponse(await fetch(`${API_BASE_URL}/philosofun/${id}`, { method: 'DELETE' }))
  }
};
