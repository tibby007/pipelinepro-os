import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAICommunicationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAICommunication(options: UseAICommunicationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const generateInitialOutreach = useCallback(
    async (prospectId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateInitialOutreach',
            prospectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate outreach');

        const { data } = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        console.error('Error generating outreach:', error);
        options.onError?.(error as Error);
        toast.error('Failed to generate outreach message');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const generateQualificationQuestions = useCallback(
    async (prospectId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateQualificationQuestions',
            prospectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate questions');

        const { data } = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        console.error('Error generating questions:', error);
        options.onError?.(error as Error);
        toast.error('Failed to generate qualification questions');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const analyzeQualificationResponses = useCallback(
    async (prospectId: string, responses: Record<string, string>) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyzeQualificationResponses',
            prospectId,
            data: { responses },
          }),
        });

        if (!response.ok) throw new Error('Failed to analyze responses');

        const { data } = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        console.error('Error analyzing responses:', error);
        options.onError?.(error as Error);
        toast.error('Failed to analyze qualification responses');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const generateDocumentRequest = useCallback(
    async (prospectId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateDocumentRequest',
            prospectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate document request');

        const { data } = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        console.error('Error generating document request:', error);
        options.onError?.(error as Error);
        toast.error('Failed to generate document request');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const prepareLenderSubmission = useCallback(
    async (prospectId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'prepareLenderSubmission',
            prospectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to prepare submission');

        const { data } = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        console.error('Error preparing submission:', error);
        options.onError?.(error as Error);
        toast.error('Failed to prepare lender submission');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    isLoading,
    generateInitialOutreach,
    generateQualificationQuestions,
    analyzeQualificationResponses,
    generateDocumentRequest,
    prepareLenderSubmission,
  };
}