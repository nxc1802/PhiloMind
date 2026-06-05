import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

export function useJourney(user) {
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.courses.journey('main', userId),
    queryFn: async () => {
      if (!userId) return { courses: [], mainCourse: null, journey: [] };

      // 1. Fetch courses list
      const courses = await api.courses.list();
      const mainCourse = courses.find(c => c.title.includes('Triết học')) || courses[0];
      
      if (!mainCourse) {
        return { courses, mainCourse: null, journey: [] };
      }

      // 2. Fetch journey for the main course
      const journey = await api.courses.getJourney(mainCourse.id, userId);
      return {
        courses,
        mainCourse,
        journey: journey || [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale
  });
}
