"use client";

import { useState } from "react";
import {
  useUpdateArtworkStatus,
  useCompleteDelivery,
} from "@/hooks/use-session-mutations";
import { CameraScanner } from "@/components/delivery/camera-scanner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Session,
  Artwork,
  ArtworkStatus,
  AIScannedArtwork,
} from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface DeliveryViewProps {
  session: Session;
  initialArtworks: Artwork[];
}

type ScannedItemState = {
  scan: AIScannedArtwork;
  match?: Artwork;
  selected: boolean;
};

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DeliveryView({ session, initialArtworks }: DeliveryViewProps) {
  const completeDeliveryMutation = useCompleteDelivery();
  const updateArtworkStatusMutation = useUpdateArtworkStatus();

  const [artworks, setArtworks] = useState(initialArtworks);
  const [mode, setMode] = useState<"loading" | "delivering">("loading");
  // removed completing state, using mutation state
  const isArchived = session.status === "archived";

  // Review State
  const [reviewItems, setReviewItems] = useState<ScannedItemState[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Complete Delivery Confirmation State
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Manual Status Update State
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isManualUpdateOpen, setIsManualUpdateOpen] = useState(false);
  // removed manualUpdating state, using mutation state

  const handleScan = (items: AIScannedArtwork[]) => {
    // If archived, do nothing (scanning disabled)
    if (isArchived) return;

    // Match scanned items to database items
    const matches: ScannedItemState[] = items.map((scan) => {
      const normalizedCode = scan.wacCode.trim().toUpperCase();
      const match = artworks.find(
        (a) =>
          normalizedCode.includes(a.wac_code.trim().toUpperCase()) ||
          a.wac_code.trim().toUpperCase().includes(normalizedCode)
      );
      return {
        scan,
        match,
        selected: !!match, // Default select if match found
      };
    });
    setReviewItems(matches);
    setIsReviewOpen(true);
  };

  const toggleSelection = (index: number) => {
    setReviewItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const confirmScannedItems = async () => {
    const selectedItems = reviewItems.filter((i) => i.selected && i.match);
    if (selectedItems.length === 0) {
      setIsReviewOpen(false);
      return;
    }

    setUpdating(true);

    const targetStatus: ArtworkStatus =
      mode === "loading" ? "in_truck" : "delivered";

    // Process updates in parallel
    await Promise.all(
      selectedItems.map(async (item) => {
        if (!item.match) return;

        // Strict flow enforcement
        let shouldUpdate = false;
        if (mode === "loading" && item.match.status === "in_stock")
          shouldUpdate = true;
        if (mode === "delivering" && item.match.status === "in_truck")
          shouldUpdate = true;

        if (shouldUpdate) {
          // Optimistic update
          setArtworks((prev) =>
            prev.map((a) =>
              a.id === item.match!.id ? { ...a, status: targetStatus } : a
            )
          );
          await updateArtworkStatusMutation.mutateAsync({
            artworkId: item.match.id,
            status: targetStatus,
            sessionId: session.id,
          });
        }
      })
    );

    setUpdating(false);
    setIsReviewOpen(false);
  };

  // Triggered by button click
  function handleComplete() {
    setIsCompleteDialogOpen(true);
  }

  // Triggered by dialog confirm
  async function confirmCompletion() {
    try {
      const res = await completeDeliveryMutation.mutateAsync(session.id);
      if (res.success) {
        toast.success("Delivery completed successfully");
        // Reload page to reflect archived status
        window.location.reload();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to complete delivery", {
        description: message,
      });
      setIsCompleteDialogOpen(false);
    }
  }

  const handleManualUpdate = async (targetStatus: ArtworkStatus) => {
    if (!selectedArtwork) return;

    try {
      // Optimistic update
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === selectedArtwork.id ? { ...a, status: targetStatus } : a
        )
      );
      await updateArtworkStatusMutation.mutateAsync({
        artworkId: selectedArtwork.id,
        status: targetStatus,
        sessionId: session.id,
      });
      toast.success(`Status updated to ${formatStatus(targetStatus)}`);
      setIsManualUpdateOpen(false);
      setSelectedArtwork(null);
    } catch (err) {
      console.error("Manual update error:", err);
      toast.error("Failed to update status");
    }
  };

  const openManualUpdate = (art: Artwork) => {
    if (isArchived) return;
    setSelectedArtwork(art);
    setIsManualUpdateOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 p-4 pt-6 max-w-md mx-auto">
      <div className="flex flex-row items-center gap-3">
        <div className="flex-none pt-1">
          <Link href="/delivery">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 dark:bg-neutral-900 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </Button>
          </Link>
        </div>
        <div className="flex-1 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-bold text-xl">{session.client_name}</h1>
            {isArchived && (
              <span className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                Completed
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            {session.address || "No address provided"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
          Workflow
        </label>
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "loading" | "delivering")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            <TabsTrigger
              value="loading"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:shadow-sm"
            >
              Loading Truck
            </TabsTrigger>
            <TabsTrigger
              value="delivering"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:shadow-sm"
            >
              Delivering
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
          Action
        </label>
        {isArchived ? (
          <div className="h-32 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900/50">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <p className="font-semibold text-neutral-500">Delivery Completed</p>
            <p className="text-xs text-neutral-400">
              No further actions allowed
            </p>
          </div>
        ) : (
          <CameraScanner onScan={handleScan} />
        )}
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
          Manifest
        </h3>
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {artworks.map((art) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                onClick={() => openManualUpdate(art)}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.98]",
                  art.status === "delivered"
                    ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
                    : art.status === "in_truck"
                    ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30"
                    : "bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                )}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {art.wac_code}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                    {art.title || "Untitled"}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1",
                      art.status === "in_stock"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : art.status === "in_truck"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        : art.status === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    )}
                  >
                    {formatStatus(art.status)}
                  </span>
                </div>
                <div>
                  {art.status === "delivered" && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                  {art.status === "in_truck" && (
                    <Truck className="w-6 h-6 text-blue-600" />
                  )}
                  {art.status === "in_stock" && (
                    <Package className="w-6 h-6 text-neutral-300" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {mode === "delivering" && !isArchived && (
        <div className="pt-4 px-1">
          <Button
            onClick={handleComplete}
            disabled={completeDeliveryMutation.isPending}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
          >
            {completeDeliveryMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              "Complete Delivery"
            )}
          </Button>
        </div>
      )}

      {/* Scanned Items Confirmation Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>
              Confirm {mode === "loading" ? "Load" : "Delivery"}
            </DialogTitle>
            <DialogDescription>Select the items to update.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <div className="space-y-2 py-2">
              {reviewItems.length === 0 && (
                <p className="text-center text-neutral-500 py-4">
                  No items found.
                </p>
              )}
              {reviewItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.match && toggleSelection(idx)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none",
                    item.match
                      ? item.selected
                        ? "bg-brand-primary/5 border-brand-primary/30"
                        : "bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                      : "bg-neutral-50 border-neutral-100 opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      disabled={!item.match}
                      readOnly
                      className="w-5 h-5 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {item.scan.wacCode}
                      </span>
                      {item.match ? (
                        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          Match Found
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> No Match
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm line-clamp-1">
                      {item.scan.title || item.match?.title || "Unknown Title"}
                    </p>
                    {item.match && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Current Status: {formatStatus(item.match.status)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmScannedItems}
              disabled={
                updating || reviewItems.filter((i) => i.selected).length === 0
              }
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                `Confirm (${reviewItems.filter((i) => i.selected).length})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Delivery Confirmation Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="max-w-md bg-white dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Complete Delivery?</DialogTitle>
            <DialogDescription>
              This will mark the session as archived and send delivery
              confirmation emails to the client and admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCompletion}
              disabled={completeDeliveryMutation.isPending}
            >
              {completeDeliveryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Yes, Complete Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Status Update Dialog */}
      <Dialog open={isManualUpdateOpen} onOpenChange={setIsManualUpdateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Manual Status Update</DialogTitle>
            <DialogDescription>
              Update the status for <strong>{selectedArtwork?.title}</strong> (
              {selectedArtwork?.wac_code}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border text-center">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                Current Status
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-bold",
                  selectedArtwork?.status === "in_stock"
                    ? "bg-blue-100 text-blue-800"
                    : selectedArtwork?.status === "in_truck"
                    ? "bg-orange-100 text-orange-800"
                    : selectedArtwork?.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-neutral-100 text-neutral-800"
                )}
              >
                {selectedArtwork ? formatStatus(selectedArtwork.status) : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mode === "loading" && (
                <>
                  <Button
                    variant={
                      selectedArtwork?.status === "in_truck"
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-16 text-lg font-bold transition-all",
                      selectedArtwork?.status === "in_truck" &&
                        "bg-orange-600 hover:bg-orange-700"
                    )}
                    onClick={() => handleManualUpdate("in_truck")}
                    disabled={
                      updateArtworkStatusMutation.isPending ||
                      selectedArtwork?.status === "in_truck"
                    }
                  >
                    <Truck className="w-6 h-6 mr-3" />
                    Move to Truck
                  </Button>
                  <Button
                    variant={
                      selectedArtwork?.status === "in_stock"
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-16 text-lg font-bold transition-all",
                      selectedArtwork?.status === "in_stock" &&
                        "bg-blue-600 hover:bg-blue-700"
                    )}
                    onClick={() => handleManualUpdate("in_stock")}
                    disabled={
                      updateArtworkStatusMutation.isPending ||
                      selectedArtwork?.status === "in_stock"
                    }
                  >
                    <Package className="w-6 h-6 mr-3" />
                    Return to Stock
                  </Button>
                </>
              )}

              {mode === "delivering" && (
                <>
                  <Button
                    variant={
                      selectedArtwork?.status === "delivered"
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-16 text-lg font-bold transition-all",
                      selectedArtwork?.status === "delivered" &&
                        "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleManualUpdate("delivered")}
                    disabled={
                      updateArtworkStatusMutation.isPending ||
                      selectedArtwork?.status === "delivered"
                    }
                  >
                    <CheckCircle2 className="w-6 h-6 mr-3" />
                    Mark as Delivered
                  </Button>
                  <Button
                    variant={
                      selectedArtwork?.status === "in_truck"
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-16 text-lg font-bold transition-all",
                      selectedArtwork?.status === "in_truck" &&
                        "bg-orange-600 hover:bg-orange-700"
                    )}
                    onClick={() => handleManualUpdate("in_truck")}
                    disabled={
                      updateArtworkStatusMutation.isPending ||
                      selectedArtwork?.status === "in_truck"
                    }
                  >
                    <Truck className="w-6 h-6 mr-3" />
                    Return to Truck
                  </Button>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsManualUpdateOpen(false)}
              disabled={updateArtworkStatusMutation.isPending}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
