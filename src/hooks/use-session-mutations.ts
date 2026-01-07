"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSessionWithArtworks } from "@/app/actions/create-session";
import { completeDelivery } from "@/app/actions/complete-delivery";
import { updateArtworkStatus } from "@/app/actions/update-artwork";
import { ArtworkStatus } from "@/types";

interface ScannedArtwork {
  wacCode: string;
  artist?: string;
  title?: string;
  dimensions?: string;
}

interface ClientDetails {
  name: string;
  email: string;
  address: string;
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artworks,
      clientDetails,
    }: {
      artworks: ScannedArtwork[];
      clientDetails: ClientDetails;
    }) => {
      const result = await createSessionWithArtworks(artworks, clientDetails);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCompleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await completeDelivery(sessionId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
}

export function useUpdateArtworkStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artworkId,
      status,
      sessionId,
    }: {
      artworkId: string;
      status: ArtworkStatus;
      sessionId: string;
    }) => {
      const result = await updateArtworkStatus(artworkId, status, sessionId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", variables.sessionId],
      });
    },
  });
}
