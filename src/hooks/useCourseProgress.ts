import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

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

export const useCourseProgress = (courseName: string) => {
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  // Fetch course progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ["course-progress", courseName],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_name", courseName)
        .maybeSingle();

      if (error) throw error;
      return data as CourseProgress | null;
    },
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ["course-statistics", courseName],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("course_statistics")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_name", courseName)
        .maybeSingle();

      if (error) throw error;
      return data as CourseStatistics | null;
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: {
      current_topic: number;
      completed_topics: number[];
    }) => {
      console.log('updateProgressMutation called with:', data);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
      
      console.log('Progress updated successfully');
    },
    onSuccess: () => {
      console.log('Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseName] });
    },
  });

  // Update statistics mutation
  const updateStatisticsMutation = useMutation({
    mutationFn: async (data: {
      time_spent_minutes?: number;
      topics_completed?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentStats = statistics || {
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
      queryClient.invalidateQueries({ queryKey: ["course-statistics", courseName] });
    },
  });

  // Save completed course
  const saveCompletedCourseMutation = useMutation({
    mutationFn: async (data: {
      test_score: number;
      user_name: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timeSpent = statistics?.time_spent_minutes || 0;

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
        const currentMinutes = statistics?.time_spent_minutes || 0;
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

  return {
    progress,
    statistics,
    isLoading,
    updateProgress: updateProgressMutation.mutate,
    updateStatistics: updateStatisticsMutation.mutate,
    saveCompletedCourse: saveCompletedCourseMutation.mutate,
  };
};
