'use server'

import { createClient } from '@/lib/supabase/server'
import { ArtworkStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import { checkRole } from '@/lib/auth/role-check'

export async function updateArtworkStatus(artworkId: string, status: ArtworkStatus, sessionId: string) {
  try {
    await checkRole(['driver', 'super_admin'])
    const supabase = await createClient()
  const { error } = await supabase
    .from('artworks')
    .update({ status })
    .eq('id', artworkId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/delivery/${sessionId}`)
  return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

