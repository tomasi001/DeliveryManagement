import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Truck } from "lucide-react";

export default function Home() {
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
            <Link href="/admin" className="w-full block">
              <Button variant="outline" className="w-full">
                Enter Admin Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

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
              * Drivers can view active deliveries and history here.
            </p>
            <Link href="/delivery" className="w-full block">
              <Button variant="outline" className="w-full">
                Enter Driver Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-neutral-400 mt-8">
        <p>System v1.0.0 • Secure Access Only</p>
      </div>
    </div>
  );
}
