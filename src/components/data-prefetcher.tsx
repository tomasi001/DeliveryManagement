"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSessions } from "@/app/actions/get-sessions";
import { getUsers } from "@/app/actions/get-users";
import { UserRole } from "@/types";

interface DataPrefetcherProps {
  role: UserRole;
}

export function DataPrefetcher({ role }: DataPrefetcherProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch sessions for everyone (Super Admin, Admin, Driver)
    // Stale time is 30 mins, so this respects the cache policy
    queryClient.prefetchQuery({
      queryKey: ["sessions"],
      queryFn: async () => {
        const data = await getSessions();
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });

    // Prefetch users ONLY for Super Admin
    if (role === "super_admin") {
      queryClient.prefetchQuery({
        queryKey: ["users"],
        queryFn: async () => {
          const data = await getUsers();
          return data;
        },
      });
    }
  }, [role, queryClient]);

  return null;
}

