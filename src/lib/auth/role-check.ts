import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export async function checkRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error(`Unauthorized: Role '${profile?.role}' not allowed`);
  }

  return { user, profile };
}
