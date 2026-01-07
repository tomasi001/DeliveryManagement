import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Truck, Settings, LogOut } from "lucide-react";
import { signout } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should be handled by proxy.ts, but as a safety measure:
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = profile?.role === "super_admin";
  const isAdmin = profile?.role === "admin" || isSuperAdmin;
  const isDriver =
    profile?.role === "driver" || profile?.role === "admin" || isSuperAdmin;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          ArtTrack
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Delivery Management System
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {isSuperAdmin && (
          <Card className="hover:shadow-lg transition-shadow border-brand-primary/30 bg-brand-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-primary" />
                Super Admin
              </CardTitle>
              <CardDescription>
                System-wide user management and configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="default"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
              >
                <Link href="/super-admin">User Management</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-primary" />
                Admin Portal
              </CardTitle>
              <CardDescription>
                Upload manifests, manage sessions, and review delivery reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/5"
              >
                <Link href="/admin">Enter Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isDriver && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-brand-secondary" />
                Driver App
              </CardTitle>
              <CardDescription>
                Scan artworks, update status, and complete deliveries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-500 mb-4">
                * View active deliveries and history.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/delivery">Enter Driver Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <form action={signout} className="mt-4">
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400 font-medium">
              {user.email}
            </span>
            <span>
              <Button
                variant="ghost"
                className="w-full text-neutral-500 hover:text-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </span>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-neutral-400 mt-8">
        <p>System v1.1.0 • Secure Role-Based Access</p>
      </div>
    </div>
  );
}
