import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";

interface CourseProgress {
  id: string;
  user_id: string;
  course_name: string;
  current_topic: number;
  completed_topics: number[];
  last_accessed_at: string;
  created_at: string;
}

interface CourseStatistics {
  id: string;
  user_id: string;
  course_name: string;
  time_spent_minutes: number;
  topics_completed: number;
  last_activity: string;
}

interface LocalProgress {
  current_topic: number;
  completed_topics: number[];
  time_spent_minutes: number;
}

export const useCourseProgress = (courseName: string) => {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Get local storage key
  const getLocalStorageKey = () => `course_progress_${courseName}`;

  // Load from localStorage
  const loadLocalProgress = (): LocalProgress => {
    const stored = localStorage.getItem(getLocalStorageKey());
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      current_topic: 0,
      completed_topics: [],
      time_spent_minutes: 0,
    };
  };

  // Save to localStorage
  const saveLocalProgress = (progress: LocalProgress) => {
    localStorage.setItem(getLocalStorageKey(), JSON.stringify(progress));
  };

  // Fetch course progress (only if authenticated)
  const { data: dbProgress, isLoading: dbLoading } = useQuery({
    queryKey: ["course-progress", courseName],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_name", courseName)
        .maybeSingle();

      if (error) throw error;
      return data as CourseProgress | null;
    },
    enabled: isAuthenticated === true,
  });

  // Fetch statistics (only if authenticated)
  const { data: dbStatistics } = useQuery({
    queryKey: ["course-statistics", courseName],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_statistics")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_name", courseName)
        .maybeSingle();

      if (error) throw error;
      return data as CourseStatistics | null;
    },
    enabled: isAuthenticated === true,
  });

  // Merge local and DB progress
  const localProgress = loadLocalProgress();
  const progress = isAuthenticated && dbProgress ? dbProgress : {
    current_topic: localProgress.current_topic,
    completed_topics: localProgress.completed_topics,
  };
  const statistics = isAuthenticated && dbStatistics ? dbStatistics : {
    time_spent_minutes: localProgress.time_spent_minutes,
  };

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: {
      current_topic: number;
      completed_topics: number[];
    }) => {
      console.log('updateProgressMutation called with:', data);
      
      // Always save to localStorage
      const localData = loadLocalProgress();
      saveLocalProgress({
        ...localData,
        current_topic: data.current_topic,
        completed_topics: data.completed_topics,
      });

      // Also save to DB if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Not authenticated, saved to localStorage only');
        return;
      }

      console.log('User authenticated:', user.id);

      const { error } = await supabase
        .from("course_progress")
        .upsert({
          user_id: user.id,
          course_name: courseName,
          current_topic: data.current_topic,
          completed_topics: data.completed_topics,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,course_name",
        });

      if (error) {
        console.error('Error updating progress:', error);
        throw error;
      }
      
      console.log('Progress updated successfully in DB');
    },
    onSuccess: () => {
      console.log('Invalidating queries...');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["course-progress", courseName] });
        queryClient.refetchQueries({ queryKey: ["course-progress", courseName] });
      }
    },
    onError: (error) => {
      console.error('Error in updateProgressMutation:', error);
    },
  });

  // Update statistics mutation
  const updateStatisticsMutation = useMutation({
    mutationFn: async (data: {
      time_spent_minutes?: number;
      topics_completed?: number;
    }) => {
      // Always save to localStorage
      const localData = loadLocalProgress();
      saveLocalProgress({
        ...localData,
        time_spent_minutes: data.time_spent_minutes ?? localData.time_spent_minutes,
      });

      // Also save to DB if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentStats = dbStatistics || {
        time_spent_minutes: 0,
        topics_completed: 0,
      };

      const { error } = await supabase
        .from("course_statistics")
        .upsert({
          user_id: user.id,
          course_name: courseName,
          time_spent_minutes: data.time_spent_minutes ?? currentStats.time_spent_minutes,
          topics_completed: data.topics_completed ?? currentStats.topics_completed,
          last_activity: new Date().toISOString(),
        }, {
          onConflict: "user_id,course_name",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["course-statistics", courseName] });
      }
    },
  });

  // Save completed course
  const saveCompletedCourseMutation = useMutation({
    mutationFn: async (data: {
      test_score: number;
      user_name: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Cannot save completed course - not authenticated');
        return;
      }

      const timeSpent = dbStatistics?.time_spent_minutes || localProgress.time_spent_minutes;

      const { error } = await supabase
        .from("completed_courses")
        .insert({
          user_id: user.id,
          course_name: courseName,
          test_score: data.test_score,
          time_spent_minutes: timeSpent,
          completion_date: new Date().toISOString(),
        });

      if (error) throw error;
    },
  });

  // Auto-save time tracking
  useEffect(() => {
    startTimeRef.current = new Date();

    const timer = setInterval(() => {
      const now = new Date();
      const minutesElapsed = Math.floor(
        (now.getTime() - startTimeRef.current.getTime()) / 60000
      );

      if (minutesElapsed > 0) {
        const currentMinutes = (isAuthenticated && dbStatistics?.time_spent_minutes) || localProgress.time_spent_minutes || 0;
        updateStatisticsMutation.mutate({
          time_spent_minutes: currentMinutes + minutesElapsed,
        });
        startTimeRef.current = now;
      }
    }, 60000); // Every minute

    timerRef.current = timer;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const isLoading = isAuthenticated === null || (isAuthenticated && dbLoading);

  return {
    progress,
    statistics,
    isLoading,
    isAuthenticated,
    updateProgress: (data: { current_topic: number; completed_topics: number[] }) => {
      return updateProgressMutation.mutateAsync(data);
    },
    updateStatistics: updateStatisticsMutation.mutate,
    saveCompletedCourse: saveCompletedCourseMutation.mutate,
  };
};
