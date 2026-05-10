import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Goal, InsertGoal } from "@shared/schema";

export function useGoals() {
  return useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json() as Promise<Goal[]>;
    },
  });
}

export function useCreateGoal() {
  return useMutation({
    mutationFn: async (goal: Omit<InsertGoal, "userId">) =>
      apiRequest("POST", "/api/goals", goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}

export function useUpdateGoal() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertGoal> }) =>
      apiRequest("PATCH", `/api/goals/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}

export function useDeleteGoal() {
  return useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}
