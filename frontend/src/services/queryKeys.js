export const queryKeys = {
  courses: {
    all: ['courses'],
    list: (userId) => [...queryKeys.courses.all, 'list', userId || 'anonymous'],
    journey: (courseId, userId) => [...queryKeys.courses.all, 'journey', courseId, userId || 'anonymous'],
    nodeCore: (nodeId, userId) => [...queryKeys.courses.all, 'node-core', nodeId, userId || 'anonymous'],
    nodeDetails: (nodeId, userId) => [...queryKeys.courses.all, 'node-details', nodeId, userId || 'anonymous'],
    comments: (nodeId) => [...queryKeys.courses.all, 'comments', nodeId],
  },
  flashcards: {
    all: ['flashcards'],
    due: (userId) => [...queryKeys.flashcards.all, 'due', userId || 'anonymous'],
  },
  quizzes: {
    all: ['quizzes'],
    list: (nodeId) => [...queryKeys.quizzes.all, 'list', nodeId || 'general'],
  },
  debates: {
    all: ['debates'],
    topics: () => [...queryKeys.debates.all, 'topics'],
    transcript: (id, userId, type) => [...queryKeys.debates.all, 'transcript', type, id, userId || 'anonymous'],
  },
  documents: {
    all: ['documents'],
    list: (courseId) => [...queryKeys.documents.all, 'list', courseId || 'all'],
  },
  philosofun: {
    all: ['philosofun'],
    list: () => [...queryKeys.philosofun.all, 'list'],
  },
};
