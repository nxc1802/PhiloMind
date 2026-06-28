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

      const coursesPromise = api.courses.list();
      const courses = await coursesPromise;

      const mainCourse = courses.find(c => c.title.includes('Triết học')) || courses[0];

      if (!mainCourse) {
        return { courses, mainCourse: null, journey: [] };
      }

      const cachedCourseId = localStorage.getItem(MAIN_COURSE_ID_KEY);
      const cachedCourseStillExists = cachedCourseId && courses.some((course) => course.id === cachedCourseId);
      const courseId = cachedCourseStillExists ? cachedCourseId : mainCourse.id;

      if (!cachedCourseStillExists || courseId !== cachedCourseId) {
        localStorage.setItem(MAIN_COURSE_ID_KEY, courseId);
      }

      let journey;
      try {
        journey = await api.courses.getJourney(courseId, userId);
      } catch (err) {
        localStorage.removeItem(MAIN_COURSE_ID_KEY);
        if (courseId === mainCourse.id) throw err;
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
