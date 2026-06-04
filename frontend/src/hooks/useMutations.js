import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

export function useCompleteNodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, userId }) => api.courses.completeNode(nodeId, userId),
    onSuccess: (data, { nodeId, userId }) => {
      // Invalidate journey so sidebar / progress map updates
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.journey('main', userId) });
      // Invalidate current node details
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.nodeDetails(nodeId, userId) });
    },
  });
}

export function useUpdateProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, userId, status, extraFields }) => 
      api.courses.updateProgress(nodeId, userId, status, extraFields),
    onSuccess: (data, { nodeId, userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.journey('main', userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.nodeDetails(nodeId, userId) });
    },
  });
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, flashcardId, ease }) => 
      api.flashcards.submitReview(userId, flashcardId, ease),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.due(userId) });
    },
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, userId, content, role }) => 
      api.courses.comments.create(nodeId, userId, content, role),
    onSuccess: (data, { nodeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.comments(nodeId) });
    },
  });
}

export function useSendDebateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, userId, message }) => 
      api.debates.sendMessage(nodeId, userId, message),
    onSuccess: (data, { nodeId, userId }) => {
      queryClient.setQueryData(queryKeys.debates.transcript(nodeId, userId, 'concept'), data);
    },
  });
}

export function useSendTopicDebateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, userId, message }) => 
      api.debates.topics.sendMessage(topicId, userId, message),
    onSuccess: (data, { topicId, userId }) => {
      queryClient.setQueryData(queryKeys.debates.transcript(topicId, userId, 'topic'), data);
    },
  });
}
