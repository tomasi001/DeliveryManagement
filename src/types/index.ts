export type SessionStatus = "active" | "ready_for_pickup" | "archived";
export type ArtworkStatus = "in_stock" | "in_truck" | "delivered" | "returned";

export interface Session {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  address: string;
  status: SessionStatus;
}

export interface Artwork {
  id: string;
  session_id: string;
  wac_code: string;
  artist: string;
  title: string;
  dimensions?: string;
  status: ArtworkStatus;
}

export interface AIScannedArtwork {
  wacCode: string;
  artist?: string | null;
  title?: string | null;
  dimensions?: string | null;
}

export type UserRole = "super_admin" | "admin" | "driver";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
