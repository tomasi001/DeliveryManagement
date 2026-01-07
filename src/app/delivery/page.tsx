"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions } from "@/app/actions/get-sessions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Truck, CheckCircle2, Package, Calendar, ArrowLeft, LogOut } from "lucide-react";
import { signout } from "../login/actions";
import { Loader2 } from "lucide-react";
import type { Session } from "@/types";
import { toast } from "sonner";

export default function DeliveryDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (e) {
        console.error("Failed to load sessions", e);
        toast.error("Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const activeSessions = sessions.filter(
    (s) => s.status === "ready_for_pickup"
  );
  
  const completedSessions = sessions.filter(
    (s) => s.status === "archived"
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 pt-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-col space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Driver Dashboard
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Manage your delivery schedule
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading sessions...</p>
          </div>
        ) : (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Current Deliveries
                {activeSessions.length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-600 text-white text-[10px] px-2 py-0.5">
                    {activeSessions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {activeSessions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-dashed">
                  <Package className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">No active deliveries</h3>
                  <p className="text-sm text-neutral-500">Wait for admin to assign sessions.</p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <Link key={session.id} href={`/delivery/${session.id}`} className="block group">
                    <Card className="hover:border-blue-500/50 transition-colors cursor-pointer group-hover:shadow-md">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                            {session.client_name}
                          </h3>
                          <div className="flex items-center text-sm text-neutral-500">
                            <span className="truncate max-w-[200px]">{session.address || 'No address'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                              Ready for Pickup
                            </Badge>
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(session.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-blue-500 transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {completedSessions.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <p>No completed deliveries yet.</p>
                </div>
              ) : (
                completedSessions.map((session) => (
                  <Link key={session.id} href={`/delivery/${session.id}`} className="block group">
                    <Card className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer border-neutral-200/60">
                      <CardContent className="p-4 flex items-center justify-between opacity-75 group-hover:opacity-100 transition-opacity">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {session.client_name}
                          </h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            Completed on {new Date(session.created_at).toLocaleDateString()} 
                            {/* Note: ideally we'd track 'completed_at', but created_at is fine for now */}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                          Completed
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
