"use client";

import { useState } from "react";
import { signout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signout();
  };

  return (
    <form onSubmit={handleSignOut}>
      <Button
        variant="ghost"
        className={className}
        disabled={loading}
        type="submit"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4 mr-2" />
        )}
        {loading ? "Signing Out..." : "Sign Out"}
      </Button>
    </form>
  );
}

