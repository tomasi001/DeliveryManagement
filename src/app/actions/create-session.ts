"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function createSessionWithArtworks(
  artworks: ScannedArtwork[],
  clientDetails: ClientDetails
) {
  if (!artworks || artworks.length === 0) {
    return { error: "No artworks provided" };
  }

  if (!clientDetails.name || !clientDetails.email) {
    return { error: "Client name and email are required" };
  }

  const supabase = await createClient();

  try {
    // 1. Create Session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        client_name: clientDetails.name,
        client_email: clientDetails.email,
        address: clientDetails.address,
        status: "active",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return { error: "Failed to create session" };
    }

    // 2. Prepare Artworks
    const artworksData = artworks.map((art) => ({
      session_id: session.id,
      wac_code: art.wacCode.trim(),
      artist: art.artist || "Unknown",
      title: art.title || "Untitled",
      dimensions: art.dimensions || "",
      status: "in_stock",
    }));

    // 3. Bulk Insert
    const { error: artworksError } = await supabase
      .from("artworks")
      .insert(artworksData);

    if (artworksError) {
      console.error("Artworks insert error:", artworksError);
      return { error: "Failed to add artworks to session" };
    }

    return { success: true, sessionId: session.id };
  } catch (err) {
    console.error("Server Action Error:", err);
    return { error: "An unexpected error occurred" };
  }
}
