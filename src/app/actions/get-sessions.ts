'use server'

import { createClient } from '@/lib/supabase/server'
import { Session } from '@/types'
import { checkRole } from '@/lib/auth/role-check'

export async function getSessions() {
  try {
    await checkRole(['admin', 'driver', 'super_admin'])
    const supabase = await createClient()
    
    // DEBUG: Check who is asking
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("DEBUG: getSessions User:", user?.id, user?.email, "Auth Error:", authError)

    const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data as Session[]
  } catch (error) {
    console.error('Session fetch/Auth error:', error)
    return []
  }
}

