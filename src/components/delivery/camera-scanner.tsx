"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractWacFromImage } from "@/app/actions/extract-wac";
import { Loader2, Camera, Upload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIScannedArtwork } from "@/types";

interface CameraScannerProps {
  onScan: (artworks: AIScannedArtwork[]) => void;
}

export function CameraScanner({ onScan }: CameraScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Image Optimization: Resize to max 1024px
      const resizedBase64 = await resizeImage(file, 1024);

      const result = await extractWacFromImage(resizedBase64);

      if (result.success && result.data && result.data.length > 0) {
        onScan(result.data);
      } else {
        setError("No WAC code found. Please try again or enter manually.");
      }
    } catch (err) {
      console.error("Scanning error:", err);
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resizeImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Card className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex flex-col items-center justify-center space-y-4">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center py-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin relative z-10" />
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                AI Processing...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCapture}
              />

              <Button
                variant="outline"
                className="w-full h-32 flex flex-col gap-3 border-2 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-neutral-600 dark:text-neutral-400 group-hover:text-brand-primary" />
                </div>
                <div className="text-center">
                  <span className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Scan Artwork
                  </span>
                  <span className="text-xs text-neutral-500">
                    Take Photo or Upload Image
                  </span>
                </div>
              </Button>

              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
