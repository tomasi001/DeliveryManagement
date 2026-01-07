"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Admin client using service role key to manage users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function addUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "admin" | "driver";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  // The profile will be created by the database trigger, but we need to update the role
  // because the trigger defaults to 'driver'.
  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id);

    if (profileError) {
      return {
        error: "User created but role update failed: " + profileError.message,
      };
    }
  }

  revalidatePath("/super-admin");
  return { success: true };
}

export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "admin" | "driver" | "super_admin";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" };
  }

  // Update profile role
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/super-admin");
  return { success: true };
}

export async function removeUser(userId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/super-admin");
  return { success: true };
}
