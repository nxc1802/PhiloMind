import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

const MAIN_COURSE_ID_KEY = 'mln_last_main_course_id';

export function useJourney(user) {
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.courses.journey('main', userId),
    queryFn: async () => {
      if (!userId) return { courses: [], mainCourse: null, journey: [] };

      const cachedCourseId = localStorage.getItem(MAIN_COURSE_ID_KEY);

      // Fire both calls in parallel if we have a cached course ID
      const coursesPromise = api.courses.list();
      const journeyPromise = cachedCourseId
        ? api.courses.getJourney(cachedCourseId, userId)
        : Promise.resolve(null);

      const [courses, preFetchedJourney] = await Promise.all([
        coursesPromise,
        journeyPromise
      ]);

      const mainCourse = courses.find(c => c.title.includes('Triết học')) || courses[0];

      if (!mainCourse) {
        return { courses, mainCourse: null, journey: [] };
      }

      let journey = preFetchedJourney;

      // If there was no cached ID, or the cached ID did not match the resolved main course,
      // fetch the correct journey sequentially and update the cache.
      if (!cachedCourseId || mainCourse.id !== cachedCourseId) {
        localStorage.setItem(MAIN_COURSE_ID_KEY, mainCourse.id);
        journey = await api.courses.getJourney(mainCourse.id, userId);
      }

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
