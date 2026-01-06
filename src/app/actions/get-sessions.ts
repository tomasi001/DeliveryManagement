'use server'

import { createClient } from '@/lib/supabase/server'
import { Session } from '@/types'

export async function getSessions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data as Session[]
}

