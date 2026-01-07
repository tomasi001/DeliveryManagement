"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/app/actions/get-users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await getUsers();
      return data;
    },
  });
}
