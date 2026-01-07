"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { extractWacFromImage } from "@/app/actions/extract-wac";
import { createSessionWithArtworks } from "@/app/actions/create-session";
import { getSessions } from "@/app/actions/get-sessions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  UploadCloud,
  Loader2,
  RefreshCcw,
  X,
  CheckCircle2,
  History,
  ChevronRight,
  Package,
  User,
  ArrowLeft,
  Pencil,
  Check,
  LogOut,
} from "lucide-react";
import { signout } from "../login/actions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";

interface ScannedArtwork {
  wacCode: string;
  artist?: string;
  title?: string;
  dimensions?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 flex items-start justify-center pt-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Admin Dashboard
            </h1>
          </div>
        </div>
        <p className="text-neutral-500 pl-14 -mt-4">
          Manage delivery sessions and manifests
        </p>

        <Tabs
          defaultValue="upload"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload Manifest
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Session History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <UploadManifestView />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistoryView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UploadManifestView() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Processing Manifest...");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Review State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [extractedArtworks, setExtractedArtworks] = useState<ScannedArtwork[]>(
    []
  );
  const [creatingSession, setCreatingSession] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ScannedArtwork | null>(null);

  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    name: "",
    email: "",
    address: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFiles(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setStatusText("Analyzing manifest with AI...");
    setError(null);

    try {
      await processPdfWithAi(file);
    } catch (err) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  async function processPdfWithAi(file: File) {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      // Process all pages
      const allArtworks: ScannedArtwork[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatusText(`Analyzing page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);

        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport,
            canvas: canvas as any,
          }).promise;
          const base64Image = canvas.toDataURL("image/jpeg", 0.8);

          const aiResult = await extractWacFromImage(base64Image);

          if (aiResult.success && aiResult.data) {
            allArtworks.push(
              ...(aiResult.data as any[]).map((item) => ({
                wacCode: item.wacCode,
                artist: item.artist || undefined,
                title: item.title || undefined,
                dimensions: item.dimensions || undefined,
              }))
            );
          }
        }
      }

      if (allArtworks.length > 0) {
        // Deduplicate by WAC code
        const uniqueArtworks = allArtworks.filter(
          (art, index, self) =>
            index === self.findIndex((t) => t.wacCode === art.wacCode)
        );
        openReview(uniqueArtworks);
      } else {
        setError("AI could not find any artwork details in the document.");
        setLoading(false);
      }
    } catch (err) {
      console.error("AI Processing Error:", err);
      setError("Failed to process document with AI.");
      setLoading(false);
    }
  }

  function openReview(artworks: ScannedArtwork[]) {
    setExtractedArtworks(artworks);
    setLoading(false);
    setReviewOpen(true);
  }

  function removeArtwork(indexToRemove: number) {
    setExtractedArtworks((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove)
    );
  }

  function startEditing(index: number, artwork: ScannedArtwork) {
    setEditingIndex(index);
    setEditForm({ ...artwork });
  }

  function cancelEditing() {
    setEditingIndex(null);
    setEditForm(null);
  }

  function saveEditing() {
    if (editingIndex !== null && editForm) {
      setExtractedArtworks((prev) =>
        prev.map((item, idx) => (idx === editingIndex ? editForm : item))
      );
      setEditingIndex(null);
      setEditForm(null);
    }
  }

  async function confirmSessionCreation() {
    if (extractedArtworks.length === 0) return;
    if (!clientDetails.name || !clientDetails.email) {
      alert("Please provide client name and email.");
      return;
    }

    setCreatingSession(true);
    const result = await createSessionWithArtworks(
      extractedArtworks,
      clientDetails
    );

    if (result.success && result.sessionId) {
      router.push(`/admin/session/${result.sessionId}`);
    } else {
      alert("Failed to create session: " + result.error);
      setCreatingSession(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFiles(e.dataTransfer.files[0]);
  };

  return (
    <>
      <Card className="w-full shadow-lg border-neutral-200">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-brand-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Upload Manifest</CardTitle>
          <CardDescription>
            Upload your delivery PDF to automatically extract artwork details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onDragEnter={handleDrag}
            onSubmit={(e) => e.preventDefault()}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-brand-primary/20 rounded-xl bg-brand-primary/5"
                >
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                  <p className="text-brand-primary font-medium">{statusText}</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFiles(e.target.files[0])
                    }
                  />
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                      dragActive
                        ? "border-brand-primary bg-brand-primary/5 scale-[1.02]"
                        : "border-neutral-200 hover:border-brand-primary/50 hover:bg-neutral-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="z-10 flex flex-col items-center pointer-events-none">
                      <FileText className="w-8 h-8 text-neutral-400 group-hover:text-brand-primary transition-colors mb-4" />
                      <p className="text-lg font-medium text-neutral-700">
                        Click to upload or drag & drop
                      </p>
                    </div>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Finalize Session</DialogTitle>
            <DialogDescription>
              Please enter client details and verify the extracted manifest.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4 border p-4 rounded-lg bg-neutral-50/50">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-brand-primary" />
                <h4 className="font-semibold text-sm">Client Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    placeholder="John Doe"
                    value={clientDetails.name}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email Address</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="john@example.com"
                    value={clientDetails.email}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">Delivery Address</Label>
                <Input
                  id="client-address"
                  placeholder="123 Gallery Way, Cape Town"
                  value={clientDetails.address}
                  onChange={(e) =>
                    setClientDetails({
                      ...clientDetails,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Extracted Items ({extractedArtworks.length})
              </h4>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-neutral-50/50">
                {extractedArtworks.length === 0 ? (
                  <p className="text-center text-neutral-400 py-10">
                    No items left.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {extractedArtworks.map((art, idx) => (
                      <div
                        key={idx}
                        className="relative p-3 bg-white rounded-lg shadow-sm border border-neutral-100 group hover:border-brand-primary/30 transition-colors"
                      >
                        {editingIndex === idx ? (
                          <div className="space-y-2 pr-8">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`edit-wac-${idx}`}
                                  className="text-xs"
                                >
                                  WAC Code
                                </Label>
                                <Input
                                  id={`edit-wac-${idx}`}
                                  value={editForm?.wacCode || ""}
                                  onChange={(e) =>
                                    setEditForm((prev) =>
                                      prev
                                        ? { ...prev, wacCode: e.target.value }
                                        : null
                                    )
                                  }
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`edit-artist-${idx}`}
                                  className="text-xs"
                                >
                                  Artist
                                </Label>
                                <Input
                                  id={`edit-artist-${idx}`}
                                  value={editForm?.artist || ""}
                                  onChange={(e) =>
                                    setEditForm((prev) =>
                                      prev
                                        ? { ...prev, artist: e.target.value }
                                        : null
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label
                                htmlFor={`edit-title-${idx}`}
                                className="text-xs"
                              >
                                Title
                              </Label>
                              <Input
                                id={`edit-title-${idx}`}
                                value={editForm?.title || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, title: e.target.value }
                                      : null
                                  )
                                }
                                className="h-8 text-xs"
                              />
                            </div>

                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                              <button
                                onClick={saveEditing}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 text-neutral-400 hover:bg-neutral-100 rounded transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(idx, art)}
                                className="p-1 text-neutral-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeArtwork(idx)}
                                className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-[1fr,auto] gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                    {art.wacCode}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-neutral-900 text-sm">
                                  {art.title || "Untitled"}
                                </h4>
                                <p className="text-xs text-neutral-500">
                                  {art.artist || "Unknown Artist"}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSessionCreation}
              disabled={
                extractedArtworks.length === 0 ||
                creatingSession ||
                !clientDetails.name ||
                !clientDetails.email
              }
            >
              {creatingSession ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function HistoryView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-neutral-400">
          <Package className="w-12 h-12 mb-4 opacity-20" />
          <p>No delivery sessions found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/admin/session/${session.id}`}
          className="block"
        >
          <Card className="hover:border-brand-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 font-mono mb-1">
                  {new Date(session.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      session.status === "archived"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    )}
                  />
                  <span className="font-medium capitalize text-neutral-900">
                    {session.client_name || session.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
