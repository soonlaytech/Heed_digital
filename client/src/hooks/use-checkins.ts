import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCheckinRequest } from "@shared/routes";

export function useCheckins() {
  return useQuery({
    queryKey: [api.checkins.list.path],
    queryFn: async () => {
      const res = await fetch(api.checkins.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checkins");
      return api.checkins.list.responses[200].parse(await res.json());
    },
  });
}

export function useLatestCheckin() {
  return useQuery({
    queryKey: [api.checkins.latest.path],
    queryFn: async () => {
      const res = await fetch(api.checkins.latest.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch latest checkin");
      return api.checkins.latest.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCheckinRequest) => {
      const res = await fetch(api.checkins.create.path, {
        method: api.checkins.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.checkins.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create checkin");
      }
      
      return api.checkins.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.checkins.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.checkins.latest.path] });
    },
  });
}
