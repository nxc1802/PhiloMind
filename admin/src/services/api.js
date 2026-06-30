// API helper for Admin Portal to perform full CRUD on all entities
const API_BASE_URL =
  (import.meta.env && import.meta.env.REACT_APP_API_URL) ||
  "http://localhost:3001/api";

function getHeaders(customHeaders = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...customHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (response.status === 401 || response.status === 403) {
    // Auth failure: clear stored session and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (!window.location.pathname.endsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage = errBody.message || errorMessage;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(", ");
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },
  },

  users: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() }),
      ),
    get: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/users/${id}`, { headers: getHeaders() }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  courses: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/courses`, { headers: getHeaders() }),
      ),
    get: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/courses/${id}`, { headers: getHeaders() }),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  chapters: {
    list: async (courseId) =>
      handleResponse(
        await fetch(
          courseId
            ? `${API_BASE_URL}/chapters?courseId=${courseId}`
            : `${API_BASE_URL}/chapters`,
          { headers: getHeaders() },
        ),
      ),
    get: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/chapters/${id}`, {
          headers: getHeaders(),
        }),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/chapters`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/chapters/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/chapters/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  nodes: {
    list: async (chapterId) =>
      handleResponse(
        await fetch(
          chapterId
            ? `${API_BASE_URL}/nodes?chapterId=${chapterId}`
            : `${API_BASE_URL}/nodes`,
          { headers: getHeaders() },
        ),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/nodes`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/nodes/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/nodes/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  flashcards: {
    list: async (nodeId) =>
      handleResponse(
        await fetch(
          nodeId
            ? `${API_BASE_URL}/flashcards?nodeId=${nodeId}`
            : `${API_BASE_URL}/flashcards`,
          { headers: getHeaders() },
        ),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/flashcards`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/flashcards/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/flashcards/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
    bulkImport: async (nodeId, flashcards) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/flashcards/nodes/${nodeId}/bulk`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ flashcards }),
        }),
      ),
  },

  quizzes: {
    list: async (nodeId) =>
      handleResponse(
        await fetch(
          nodeId
            ? `${API_BASE_URL}/quizzes?nodeId=${nodeId}`
            : `${API_BASE_URL}/quizzes`,
          { headers: getHeaders() },
        ),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/quizzes`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/quizzes/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/quizzes/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  podcasts: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/podcasts`, { headers: getHeaders() }),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/podcasts`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/podcasts/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/podcasts/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
    synthesize: async (nodeId, scriptText) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/podcasts/synthesize`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ nodeId, scriptText }),
        }),
      ),
  },

  debates: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/all`, { headers: getHeaders() }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  debateTopics: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/topics`, {
          headers: getHeaders(),
        }),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/topics`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/topics/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/debates/topics/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  warmups: {
    list: async (nodeId) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/nodes/${nodeId}/warmups`, {
          headers: getHeaders(),
        }),
      ),
    create: async (nodeId, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/nodes/${nodeId}/warmups`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/warmups/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  feedbacks: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/feedbacks`, { headers: getHeaders() }),
      ),
  },

  documents: {
    list: async (courseId) =>
      handleResponse(
        await fetch(
          courseId
            ? `${API_BASE_URL}/documents?courseId=${courseId}`
            : `${API_BASE_URL}/documents`,
          { headers: getHeaders() },
        ),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/documents`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/documents/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },

  files: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: "POST",
        headers: getHeaders(),
        body: formData,
      });
      return handleResponse(response);
    },
    uploadLessonAsset: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${API_BASE_URL}/files/lesson-assets/upload`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        },
      );
      return handleResponse(response);
    },
    uploadLessonVideo: async (file, title) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      const response = await fetch(
        `${API_BASE_URL}/files/lesson-videos/upload`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        },
      );
      return handleResponse(response);
    },
    storeLessonVideoUrl: async (url, title) => {
      const response = await fetch(`${API_BASE_URL}/files/lesson-videos/url`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ url, title }),
      });
      return handleResponse(response);
    },
  },

  philosofun: {
    list: async () =>
      handleResponse(
        await fetch(`${API_BASE_URL}/philosofun`, { headers: getHeaders() }),
      ),
    get: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/philosofun/${id}`, {
          headers: getHeaders(),
        }),
      ),
    create: async (data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/philosofun`, {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    update: async (id, data) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/philosofun/${id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }),
      ),
    delete: async (id) =>
      handleResponse(
        await fetch(`${API_BASE_URL}/philosofun/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        }),
      ),
  },
};
