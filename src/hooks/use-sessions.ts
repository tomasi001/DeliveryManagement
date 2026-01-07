"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/app/actions/get-sessions";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const data = await getSessions();
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes as requested
  });
}
