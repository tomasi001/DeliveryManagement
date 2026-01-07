"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/role-check";
import { Profile } from "@/types";

export async function getUsers() {
  await checkRole(["super_admin"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile[];
}
