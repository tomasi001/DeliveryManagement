'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function finalizeSession(sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'ready_for_pickup' })
    .eq('id', sessionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/session/${sessionId}`)
  return { success: true }
}

