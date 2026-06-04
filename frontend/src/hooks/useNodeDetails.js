import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

export function useNodeDetails(nodeId, userId) {
  return useQuery({
    queryKey: queryKeys.courses.nodeDetails(nodeId, userId),
    queryFn: async () => {
      if (!nodeId || !userId) return null;

      const [coreRes, detailsRes] = await Promise.all([
        api.courses.getNodeCore(nodeId, userId),
        api.courses.getNodeDetails(nodeId, userId),
      ]);

      return {
        ...detailsRes,
        ...coreRes,
      };
    },
    enabled: !!nodeId && !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes stale time for node details
  });
}
